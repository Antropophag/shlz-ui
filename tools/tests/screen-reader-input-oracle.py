"""A foreign-window invariant exercised without real desktop input."""
import importlib.util
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
target = Path(sys.argv[1]).resolve()
allowed = {
    root / "at" / "windows_input.py",
    root / "tests" / "fixtures" / "screen-reader-unsafe-input.py",
}
if target not in allowed:
    raise ValueError("Unknown input-policy oracle target")
spec = importlib.util.spec_from_file_location("input_policy", target)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class Desktop:
    def __init__(self):
        self.sent = []

    def foreground(self):
        return {"window": 42, "pid": 999}

    def send(self, key=None, text=None):
        self.sent.append((key, text))


desktop = Desktop()
blocked = False
try:
    module.execute({"command": "key", "key": "Tab", "allowedPids": [123]}, desktop)
except RuntimeError:
    blocked = True
assert blocked, "Foreign foreground was accepted"
assert desktop.sent == [], "Input was injected before ownership validation"
print("Foreign foreground rejected before input")
