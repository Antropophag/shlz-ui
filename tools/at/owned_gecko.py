"""Keep Geckodriver and every browser it creates in one owned Windows job."""
import ctypes
from ctypes import wintypes
import json
from pathlib import PureWindowsPath
import re
import subprocess
import sys
import time


class BasicLimits(ctypes.Structure):
    _fields_ = [
        ("processTime", ctypes.c_longlong), ("jobTime", ctypes.c_longlong),
        ("flags", wintypes.DWORD), ("minimum", ctypes.c_size_t),
        ("maximum", ctypes.c_size_t), ("activeLimit", wintypes.DWORD),
        ("affinity", ctypes.c_size_t), ("priority", wintypes.DWORD),
        ("scheduling", wintypes.DWORD),
    ]


class ExtendedLimits(ctypes.Structure):
    _fields_ = [
        ("basic", BasicLimits), ("io", ctypes.c_ulonglong * 6),
        ("processMemory", ctypes.c_size_t), ("jobMemory", ctypes.c_size_t),
        ("peakProcessMemory", ctypes.c_size_t), ("peakJobMemory", ctypes.c_size_t),
    ]


class Accounting(ctypes.Structure):
    _fields_ = [
        ("times", ctypes.c_longlong * 4), ("faults", wintypes.DWORD),
        ("total", wintypes.DWORD), ("active", wintypes.DWORD),
        ("terminated", wintypes.DWORD),
    ]


def close_owned_job(kernel, job, child):
    try:
        if child:
            kernel.TerminateJobObject(job, 1)
            if child.poll() is None:
                child.kill()
            child.wait(timeout=3)
        info = Accounting()
        deadline = time.monotonic() + 3
        while time.monotonic() < deadline:
            if not kernel.QueryInformationJobObject(job, 1, ctypes.byref(info), ctypes.sizeof(info), None):
                raise RuntimeError("Cannot verify owned process cleanup")
            if info.active == 0:
                return
            time.sleep(0.05)
        raise RuntimeError("Owned browser processes did not exit")
    finally:
        kernel.CloseHandle(job)


def validated_command(request):
    executable = PureWindowsPath(request["executable"])
    args = request["args"]
    if len(args) != 8 or args[:3] != ["--host", "127.0.0.1", "--port"] or args[4] != "--profile-root" or args[6:] != ["--log", "error"]:
        raise ValueError("Only the fixed loopback driver arguments are supported")
    if not re.fullmatch(r"[0-9]{1,5}", args[3]) or not 1024 <= int(args[3]) <= 65535:
        raise ValueError("Invalid local driver port")
    profile = PureWindowsPath(args[5])
    root = profile.parent
    if not re.fullmatch(r"[A-Za-z]:", root.drive) or not root.is_absolute() or ".." in root.parts:
        raise ValueError("A local task root is required")
    if not re.fullmatch(r"shlz-at-[A-Za-z0-9_-]+", root.name) or not re.fullmatch(r"firefox-run-[A-Za-z0-9_-]+", profile.name):
        raise ValueError("An isolated task profile is required")
    if executable.name.lower() != "geckodriver.exe" or ".." in executable.parts or root not in executable.parents:
        raise ValueError("Only the task-owned Geckodriver is supported")
    return [str(executable), "--host", "127.0.0.1", "--port", str(int(args[3])),
            "--profile-root", str(profile), "--log", "error"]


def supervise(request):
    if sys.platform != "win32":
        raise RuntimeError("Windows job objects require Windows")
    command = validated_command(request)
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.CreateJobObjectW.restype = wintypes.HANDLE
    kernel.SetInformationJobObject.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD]
    kernel.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]
    kernel.TerminateJobObject.argtypes = [wintypes.HANDLE, wintypes.UINT]
    kernel.QueryInformationJobObject.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD, ctypes.c_void_p]
    kernel.CloseHandle.argtypes = [wintypes.HANDLE]
    job = kernel.CreateJobObjectW(None, None)
    if not job:
        raise RuntimeError("Cannot create owned process job")
    child = None
    primary_error = None
    try:
        limits = ExtendedLimits()
        limits.basic.flags = 0x2000  # JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        if not kernel.SetInformationJobObject(job, 9, ctypes.byref(limits), ctypes.sizeof(limits)):
            raise RuntimeError("Cannot configure owned process job")
        child = subprocess.Popen(
            command, stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
        # No /session request is sent until this ready acknowledgment, so no
        # Firefox child can be created before the service joins the job.
        if not kernel.AssignProcessToJobObject(job, int(child._handle)):
            raise RuntimeError("Cannot bind owned Geckodriver to its job")
        print(json.dumps({"kind": "ready", "pid": child.pid}), flush=True)
        sys.stdin.readline()
    except Exception as error:
        primary_error = error
    finally:
        try:
            close_owned_job(kernel, job, child)
        except Exception as cleanup_error:
            if primary_error:
                raise RuntimeError(f"{primary_error}; cleanup: {cleanup_error}") from primary_error
            raise
    print(json.dumps({"kind": "closed", "activeProcesses": 0}), flush=True)
    if primary_error:
        raise primary_error


if __name__ == "__main__":
    try:
        supervise(json.loads(sys.stdin.readline()))
    except Exception as error:
        print(json.dumps({"kind": "error", "message": str(error)}), flush=True)
        sys.exit(1)
