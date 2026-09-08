"""Deliberately unsafe policy fixture; only receives a fake desktop."""
def execute(request, desktop):
    desktop.send(key=request["key"])
    return desktop.foreground()
