import {
  bindNativeDialog,
  type NativeDialogBinding,
} from "./internal/native-dialog.js";

const drawerControllers = new WeakMap<HTMLDialogElement, DrawerController>();

export class DrawerController {
  readonly dialog: HTMLDialogElement;
  #binding: NativeDialogBinding;

  constructor(dialog: HTMLDialogElement) {
    if (!dialog.matches("dialog[data-shlz-drawer]")) {
      throw new TypeError(
        "Drawer requires a dialog[data-shlz-drawer] element.",
      );
    }
    this.dialog = dialog;
    this.#binding = bindNativeDialog(dialog, {
      triggerAttribute: "data-shlz-drawer-trigger",
      closeAttribute: "data-shlz-drawer-close",
      backdropCloseAttribute: "data-shlz-drawer-backdrop-close",
      surfaceSelector: ".shlz-drawer__surface",
      componentName: "Drawer",
    });
  }

  open(trigger?: HTMLElement): void {
    this.#binding.open(trigger);
  }

  close(returnValue?: string): void {
    this.#binding.close(returnValue);
  }

  destroy(): void {
    this.#binding.destroy();
    drawerControllers.delete(this.dialog);
  }
}

export function enhanceDrawers(
  scope: ParentNode = document,
): DrawerController[] {
  return [
    ...scope.querySelectorAll<HTMLDialogElement>("dialog[data-shlz-drawer]"),
  ].map((dialog) => {
    const existing = drawerControllers.get(dialog);
    if (existing) return existing;
    const controller = new DrawerController(dialog);
    drawerControllers.set(dialog, controller);
    return controller;
  });
}
