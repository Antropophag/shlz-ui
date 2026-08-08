import {
  bindNativeDialog,
  type NativeDialogBinding,
} from "./internal/native-dialog.js";

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
  }
}

export function enhanceModals(scope: ParentNode = document): ModalController[] {
  return [
    ...scope.querySelectorAll<HTMLDialogElement>("dialog[data-shlz-modal]"),
  ].map((dialog) => new ModalController(dialog));
}
