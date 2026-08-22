import {
  bindNativeDialog,
  type NativeDialogBinding,
} from "./internal/native-dialog.js";

const modalControllers = new WeakMap<HTMLDialogElement, ModalController>();

export class ModalController {
  readonly dialog: HTMLDialogElement;
  #binding: NativeDialogBinding;

  constructor(dialog: HTMLDialogElement) {
    if (!dialog.matches("dialog[data-shlz-modal]")) {
      throw new TypeError("Modal requires a dialog[data-shlz-modal] element.");
    }
    this.dialog = dialog;
    this.#binding = bindNativeDialog(dialog, {
      triggerAttribute: "data-shlz-modal-trigger",
      closeAttribute: "data-shlz-modal-close",
      backdropCloseAttribute: "data-shlz-modal-backdrop-close",
      surfaceSelector: ".shlz-modal__surface",
      componentName: "Modal",
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
    modalControllers.delete(this.dialog);
  }
}

export function enhanceModals(scope: ParentNode = document): ModalController[] {
  return [
    ...scope.querySelectorAll<HTMLDialogElement>("dialog[data-shlz-modal]"),
  ].map((dialog) => {
    const existing = modalControllers.get(dialog);
    if (existing) return existing;
    const controller = new ModalController(dialog);
    modalControllers.set(dialog, controller);
    return controller;
  });
}
