"""Exercise the foreground boundary without injecting real desktop input."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location(
    "windows_input", Path(__file__).parents[1] / "at" / "windows_input.py"
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class Desktop:
    def __init__(self, pid):
        self.pid = pid
        self.sent = []

    def foreground(self):
        return {"window": 42, "pid": self.pid}

    def send(self, key=None, text=None):
        self.sent.append((key, text))


class InputOwnershipTests(unittest.TestCase):
    def test_only_a_dialog_owned_by_the_browser_can_use_a_modal_lease(self):
        desktop = Desktop(999)
        desktop.foreground = lambda: {
            "window": 42, "pid": 999, "windowClass": "#32770",
            "ownerPids": [123], "focusClass": "Edit",
        }
        module.execute({"command": "key", "key": "Enter",
                        "allowedPids": [123], "allowOwnedDialog": True}, desktop)
        self.assertEqual(desktop.sent, [("Enter", None)])
        desktop.sent.clear()
        with self.assertRaises(RuntimeError):
            module.execute({"command": "key", "key": "Enter",
                            "allowedPids": [456], "allowOwnedDialog": True}, desktop)
        self.assertEqual(desktop.sent, [])

    def test_native_text_never_types_into_a_file_tree(self):
        desktop = Desktop(123)
        desktop.foreground = lambda: {
            "window": 42, "pid": 123, "windowClass": "#32770",
            "ownerPids": [], "focusClass": "SysTreeView32",
        }
        with self.assertRaises(RuntimeError):
            module.execute({"command": "text", "text": "sample",
                            "allowedPids": [123], "allowOwnedDialog": True}, desktop)
        self.assertEqual(desktop.sent, [])

    def test_native_dialog_lease_does_not_allow_browser_chrome(self):
        desktop = Desktop(123)
        desktop.foreground = lambda: {
            "window": 42, "pid": 123, "windowClass": "Chrome_WidgetWin_1",
            "ownerPids": [],
        }
        with self.assertRaises(RuntimeError):
            module.execute({"command": "text", "text": "sample",
                            "allowedPids": [123], "allowOwnedDialog": True}, desktop)
        self.assertEqual(desktop.sent, [])

    def test_foreign_foreground_rejects_input_before_send(self):
        desktop = Desktop(999)
        with self.assertRaisesRegex(RuntimeError, "foreground"):
            module.execute({"command": "key", "key": "Tab", "allowedPids": [123]}, desktop)
        self.assertEqual(desktop.sent, [])

    def test_owned_foreground_receives_one_action(self):
        desktop = Desktop(123)
        result = module.execute({"command": "key", "key": "Tab", "allowedPids": [123]}, desktop)
        self.assertEqual(desktop.sent, [("Tab", None)])
        self.assertEqual(result["pid"], 123)

    def test_empty_ownership_cannot_send_text(self):
        desktop = Desktop(123)
        with self.assertRaises(ValueError):
            module.execute({"command": "text", "text": "example", "allowedPids": []}, desktop)
        self.assertEqual(desktop.sent, [])


if __name__ == "__main__":
    unittest.main()
