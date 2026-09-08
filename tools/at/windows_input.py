"""Guarded Windows keyboard input for an explicitly owned browser process."""
import ctypes
from ctypes import wintypes
import json
import sys
import time
import threading

KEYS = {
    "Tab": (0x09, 0), "Enter": (0x0D, 0), "Escape": (0x1B, 0),
    "Space": (0x20, 0), "ArrowLeft": (0x25, 1), "ArrowUp": (0x26, 1),
    "ArrowRight": (0x27, 1), "ArrowDown": (0x28, 1),
    "Home": (0x24, 1), "End": (0x23, 1), "PageUp": (0x21, 1),
    "PageDown": (0x22, 1), "Backspace": (0x08, 0), "Delete": (0x2E, 1),
    "Ctrl": (0x11, 0), "Shift": (0x10, 0), "Alt": (0x12, 0),
    "NVDA": (0x2D, 1), "F4": (0x73, 0), "F6": (0x75, 0),
}


def validate_request(request):
    command = request.get("command")
    if command not in {"status", "activate", "key", "text"}:
        raise ValueError("Unknown desktop command")
    allowed = request.get("allowedPids", [])
    if command != "status" and (
        not allowed or any(type(pid) is not int or pid <= 0 for pid in allowed)
    ):
        raise ValueError("Positive owned process IDs are required")
    return command, allowed


def require_ownership(request, state, allowed):
    command = request["command"]
    owned = state["pid"] in allowed
    if request.get("allowOwnedDialog"):
        owned = state.get("windowClass") == "#32770" and (
            owned or any(pid in allowed for pid in state.get("ownerPids", []))
        )
    if command != "status" and not owned:
        raise RuntimeError(f"Unowned foreground PID {state['pid']}: input was not sent")
    if request.get("allowOwnedDialog") and (
        command == "text" or request.get("key") in {"Ctrl+A", "Enter"}
    ) and state.get("focusClass") != "Edit":
        raise RuntimeError("A native dialog edit control must own text input")


def execute(request, desktop=None):
    command, allowed = validate_request(request)
    desktop = desktop or WindowsDesktop()
    if command == "activate":
        pid = request.get("pid")
        if type(pid) is not int or pid not in allowed:
            raise ValueError("Activation target is not owned")
        desktop.activate(pid)
    state = desktop.foreground()
    require_ownership(request, state, allowed)
    if command == "key":
        desktop.send(key=request["key"])
    elif command == "text":
        text = request["text"]
        if not isinstance(text, str) or not text or len(text) > 256:
            raise ValueError("Text must contain 1 to 256 characters")
        desktop.send(text=text)
    return state


def key_inputs(key, event, is_held):
    if not isinstance(key, str):
        raise ValueError("A key name is required")
    codes = []
    for part in key.split("+"):
        if part in KEYS:
            codes.append(KEYS[part])
        elif len(part) == 1 and "A" <= part <= "Z":
            codes.append((ord(part), 0))
        else:
            raise ValueError("Unsupported key")
    if any(is_held(vk) for vk, _ in codes):
        raise RuntimeError("A requested key is already held")
    return [event(vk, flags) for vk, flags in codes] + [
        event(vk, flags | 2) for vk, flags in reversed(codes)
    ]


class WindowsDesktop:
    def __init__(self):
        if sys.platform != "win32":
            raise RuntimeError("Actual desktop input requires Windows")
        self.api = ctypes.WinDLL("user32", use_last_error=True)
        self.api.GetForegroundWindow.restype = wintypes.HWND
        self.api.GetWindowThreadProcessId.argtypes = [
            wintypes.HWND, ctypes.POINTER(wintypes.DWORD)
        ]
        self.api.IsWindowVisible.argtypes = [wintypes.HWND]
        self.api.ShowWindow.argtypes = [wintypes.HWND, ctypes.c_int]
        self.api.SetForegroundWindow.argtypes = [wintypes.HWND]
        self.api.GetWindowRect.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.RECT)]
        self.api.SetWindowPos.argtypes = [
            wintypes.HWND, wintypes.HWND, ctypes.c_int, ctypes.c_int,
            ctypes.c_int, ctypes.c_int, wintypes.UINT
        ]
        self.api.WindowFromPoint.argtypes = [wintypes.POINT]
        self.api.WindowFromPoint.restype = wintypes.HWND
        self.api.GetWindow.argtypes = [wintypes.HWND, wintypes.UINT]
        self.api.GetWindow.restype = wintypes.HWND
        self.api.GetClassNameW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]

    def foreground(self):
        return self.describe(self.api.GetForegroundWindow())

    def describe(self, window):
        class GuiInfo(ctypes.Structure):
            _fields_ = [
                ("size", wintypes.DWORD), ("flags", wintypes.DWORD),
                ("active", wintypes.HWND), ("focus", wintypes.HWND),
                ("capture", wintypes.HWND), ("menu", wintypes.HWND),
                ("moveSize", wintypes.HWND), ("caret", wintypes.HWND),
                ("caretRect", wintypes.RECT),
            ]

        pid = wintypes.DWORD()
        thread = self.api.GetWindowThreadProcessId(window, ctypes.byref(pid))
        info = GuiInfo()
        info.size = ctypes.sizeof(GuiInfo)
        self.api.GetGUIThreadInfo.argtypes = [wintypes.DWORD, ctypes.POINTER(GuiInfo)]
        focus_name = ctypes.create_unicode_buffer(256)
        if self.api.GetGUIThreadInfo(thread, ctypes.byref(info)) and info.focus:
            self.api.GetClassNameW(info.focus, focus_name, 256)
        name = ctypes.create_unicode_buffer(256)
        self.api.GetClassNameW(window, name, 256)
        owners = []
        owner = self.api.GetWindow(window, 4)
        while owner and len(owners) < 8:
            owner_pid = wintypes.DWORD()
            self.api.GetWindowThreadProcessId(owner, ctypes.byref(owner_pid))
            owners.append(owner_pid.value)
            owner = self.api.GetWindow(owner, 4)
        return {"window": window or 0, "pid": pid.value,
                "windowClass": name.value, "ownerPids": owners,
                "focusClass": focus_name.value, "tick": uptime()}

    def activate(self, pid):
        windows = []
        callback_type = ctypes.WINFUNCTYPE(
            wintypes.BOOL, wintypes.HWND, wintypes.LPARAM
        )

        def inspect(window, _):
            owner = wintypes.DWORD()
            self.api.GetWindowThreadProcessId(window, ctypes.byref(owner))
            if owner.value == pid and self.api.IsWindowVisible(window):
                windows.append(window)
            return True

        callback = callback_type(inspect)
        self.api.EnumWindows(callback, 0)
        if not windows:
            raise RuntimeError("Owned browser has no visible window")
        target = windows[0]
        self.api.ShowWindow(target, 9)
        self.api.SetForegroundWindow(target)
        deadline = time.monotonic() + 2
        while self.foreground()["pid"] != pid and time.monotonic() < deadline:
            time.sleep(0.05)
        if self.foreground()["pid"] != pid:
            # Activate only the owned window's non-client area. Windows can
            # reject programmatic activation while another app has focus.
            rect = wintypes.RECT()
            cursor = wintypes.POINT()
            self.api.GetWindowRect(target, ctypes.byref(rect))
            self.api.GetCursorPos(ctypes.byref(cursor))
            point = wintypes.POINT(rect.left + 80, rect.top + 12)
            self.api.SetWindowPos(target, -1, 0, 0, 0, 0, 0x43)
            try:
                hit = self.api.WindowFromPoint(point)
                hit_pid = wintypes.DWORD()
                self.api.GetWindowThreadProcessId(hit, ctypes.byref(hit_pid))
                if hit_pid.value != pid:
                    raise RuntimeError("Owned activation point is obstructed")
                self.api.SetCursorPos(point.x, point.y)
                self.api.mouse_event(2, 0, 0, 0, 0)
                self.api.mouse_event(4, 0, 0, 0, 0)
            finally:
                self.api.SetWindowPos(target, -2, 0, 0, 0, 0, 0x43)
                self.api.SetCursorPos(cursor.x, cursor.y)
            deadline = time.monotonic() + 2
            while self.foreground()["pid"] != pid and time.monotonic() < deadline:
                time.sleep(0.05)

    def send(self, key=None, text=None):
        class Keyboard(ctypes.Structure):
            _fields_ = [
                ("vk", wintypes.WORD), ("scan", wintypes.WORD),
                ("flags", wintypes.DWORD), ("time", wintypes.DWORD),
                ("extra", ctypes.c_size_t),
            ]

        class Mouse(ctypes.Structure):
            _fields_ = [
                ("x", wintypes.LONG), ("y", wintypes.LONG),
                ("data", wintypes.DWORD), ("flags", wintypes.DWORD),
                ("time", wintypes.DWORD), ("extra", ctypes.c_size_t),
            ]

        class Payload(ctypes.Union):
            _fields_ = [("keyboard", Keyboard), ("mouse", Mouse)]

        class Input(ctypes.Structure):
            _fields_ = [("type", wintypes.DWORD), ("payload", Payload)]

        def event(vk, flags=0, scan=0):
            return Input(1, Payload(keyboard=Keyboard(vk, scan, flags, 0, 0)))

        inputs = []
        if key is not None:
            inputs = key_inputs(key, event, lambda vk: self.api.GetAsyncKeyState(vk) & 0x8000)
        else:
            encoded = text.encode("utf-16-le")
            for index in range(0, len(encoded), 2):
                unit = int.from_bytes(encoded[index:index + 2], "little")
                inputs += [event(0, 4, unit), event(0, 6, unit)]
        array = (Input * len(inputs))(*inputs)
        self.api.SendInput.argtypes = [
            wintypes.UINT, ctypes.POINTER(Input), ctypes.c_int
        ]
        sent = self.api.SendInput(len(inputs), array, ctypes.sizeof(Input))
        if sent != len(inputs):
            # Release only keys pressed by this partial action.
            releases = [
                event(item.payload.keyboard.vk, item.payload.keyboard.flags | 2,
                      item.payload.keyboard.scan)
                for item in inputs[:sent] if not item.payload.keyboard.flags & 2
            ]
            if releases:
                cleanup = (Input * len(releases))(*releases)
                self.api.SendInput(len(releases), cleanup, ctypes.sizeof(Input))
            raise RuntimeError("Windows rejected some keyboard input")


def uptime():
    kernel = ctypes.WinDLL("kernel32")
    kernel.GetTickCount64.restype = ctypes.c_ulonglong
    return kernel.GetTickCount64()


def watch_foreground():
    desktop = WindowsDesktop()
    api = desktop.api
    callback_type = ctypes.WINFUNCTYPE(
        None, wintypes.HANDLE, wintypes.DWORD, wintypes.HWND,
        wintypes.LONG, wintypes.LONG, wintypes.DWORD, wintypes.DWORD
    )

    def changed(_hook, _event, window, _object, _child, _thread, event_time):
        try:
            state = desktop.describe(window)
            now = uptime()
            state["tick"] = now - ((now - event_time) & 0xFFFFFFFF)
            print(json.dumps({"kind": "foreground", "state": state}), flush=True)
        except Exception:
            print(json.dumps({"kind": "error", "error": "foreground callback failed"}), flush=True)

    callback = callback_type(changed)
    api.SetWinEventHook.restype = wintypes.HANDLE
    api.SetWinEventHook.argtypes = [
        wintypes.DWORD, wintypes.DWORD, wintypes.HMODULE, callback_type,
        wintypes.DWORD, wintypes.DWORD, wintypes.DWORD
    ]
    hook = api.SetWinEventHook(3, 3, None, callback, 0, 0, 0)
    if not hook:
        raise RuntimeError("Foreground event hook unavailable")
    thread_id = ctypes.windll.kernel32.GetCurrentThreadId()
    message = wintypes.MSG()
    # Initialize the message queue before the stdin thread can post shutdown.
    api.PeekMessageW(ctypes.byref(message), None, 0, 0, 0)

    def stop_when_requested():
        sys.stdin.readline()
        time.sleep(0.3)
        api.PostThreadMessageW(thread_id, 0x0012, 0, 0)

    threading.Thread(target=stop_when_requested, daemon=True).start()
    print(json.dumps({"kind": "ready", "tick": uptime()}), flush=True)
    try:
        while api.GetMessageW(ctypes.byref(message), None, 0, 0) > 0:
            api.TranslateMessage(ctypes.byref(message))
            api.DispatchMessageW(ctypes.byref(message))
    finally:
        api.UnhookWinEvent.argtypes = [wintypes.HANDLE]
        api.UnhookWinEvent(hook)
    print(json.dumps({"kind": "closed", "tick": uptime()}), flush=True)


if __name__ == "__main__":
    try:
        request = json.loads(sys.stdin.readline())
        if request.get("command") == "watch":
            watch_foreground()
        else:
            print(json.dumps(execute(request)))
    except (ValueError, RuntimeError, KeyError) as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
