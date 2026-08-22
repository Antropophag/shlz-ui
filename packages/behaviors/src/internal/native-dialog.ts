export interface NativeDialogBindingOptions {
  triggerAttribute: string;
  closeAttribute: string;
  backdropCloseAttribute: string;
  surfaceSelector: string;
  componentName: string;
}

export interface NativeDialogBinding {
  open(trigger?: HTMLElement): void;
  close(returnValue?: string): void;
  destroy(): void;
}

function matchingTriggers(
  dialog: HTMLDialogElement,
  attribute: string,
): HTMLButtonElement[] {
  if (!dialog.id) return [];
  return [
    ...dialog.ownerDocument.querySelectorAll<HTMLButtonElement>(
      `button[${attribute}]`,
    ),
  ].filter((trigger) => trigger.getAttribute(attribute) === dialog.id);
}

function pointIsOutside(element: Element, event: PointerEvent): boolean {
  const rect = element.getBoundingClientRect();
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
}

/** Small native-dialog lifecycle composition shared only by Modal and Drawer. */
export function bindNativeDialog(
  dialog: HTMLDialogElement,
  options: NativeDialogBindingOptions,
): NativeDialogBinding {
  if (!dialog.id) {
    throw new TypeError(`${options.componentName} requires a dialog id.`);
  }

  const surface = dialog.querySelector<HTMLElement>(options.surfaceSelector);
  if (!surface) {
    throw new TypeError(
      `${options.componentName} requires a ${options.surfaceSelector} descendant.`,
    );
  }

  const abort = new AbortController();
  const triggers = matchingTriggers(dialog, options.triggerAttribute);
  let returnFocusTo: HTMLElement | null = null;
  let backdropPointerId: number | null = null;
  let closeCleanupRequired = false;
  let destroyed = false;

  const resetCycleState = (): void => {
    backdropPointerId = null;
  };

  const syncTriggers = (expanded: boolean): void => {
    for (const trigger of triggers) {
      trigger.setAttribute("aria-controls", dialog.id);
      trigger.setAttribute("aria-expanded", String(expanded));
    }
  };

  const open = (trigger?: HTMLElement): void => {
    if (destroyed || dialog.open) return;
    resetCycleState();
    closeCleanupRequired = true;
    dialog.returnValue = "";
    const active = dialog.ownerDocument.activeElement;
    returnFocusTo =
      trigger ??
      (active instanceof HTMLElement && !dialog.contains(active)
        ? active
        : null);
    dialog.showModal();
    syncTriggers(true);
  };

  const completeCloseCleanup = (): void => {
    if (!closeCleanupRequired) return;
    closeCleanupRequired = false;
    resetCycleState();
    syncTriggers(false);
    const focusTarget = returnFocusTo;
    returnFocusTo = null;
    const focusTargetIsEligible =
      focusTarget?.isConnected &&
      !focusTarget.matches(":disabled, [aria-disabled='true']");
    if (focusTargetIsEligible) {
      focusTarget.focus();
    } else if (
      focusTarget &&
      dialog.ownerDocument.activeElement === focusTarget
    ) {
      focusTarget.blur();
    }
  };

  const close = (returnValue?: string): void => {
    if (!dialog.open) return;
    if (returnValue === undefined) dialog.close();
    else dialog.close(returnValue);
    completeCloseCleanup();
  };

  for (const trigger of triggers) {
    trigger.setAttribute("aria-controls", dialog.id);
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", () => open(trigger), {
      signal: abort.signal,
    });
  }

  dialog.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      const closeControl =
        target instanceof Element
          ? target.closest<HTMLElement>(`[${options.closeAttribute}]`)
          : null;
      if (closeControl && dialog.contains(closeControl)) {
        close(closeControl.getAttribute(options.closeAttribute) || undefined);
      }
    },
    { signal: abort.signal },
  );

  dialog.addEventListener(
    "pointerdown",
    (event) => {
      backdropPointerId =
        event.target === dialog && pointIsOutside(surface, event)
          ? event.pointerId
          : null;
    },
    { signal: abort.signal },
  );

  dialog.addEventListener(
    "pointerup",
    (event) => {
      const mayDismiss = dialog.hasAttribute(options.backdropCloseAttribute);
      const endedOutside =
        event.target === dialog && pointIsOutside(surface, event);
      const completesBackdropGesture = backdropPointerId === event.pointerId;
      backdropPointerId = null;
      if (mayDismiss && completesBackdropGesture && endedOutside) close();
    },
    { signal: abort.signal },
  );

  dialog.addEventListener(
    "pointercancel",
    (event) => {
      if (backdropPointerId === event.pointerId) backdropPointerId = null;
    },
    { signal: abort.signal },
  );

  dialog.addEventListener("cancel", resetCycleState, { signal: abort.signal });

  dialog.addEventListener("close", completeCloseCleanup, {
    signal: abort.signal,
  });

  syncTriggers(dialog.open);

  return {
    open,
    close,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (dialog.open) close();
      resetCycleState();
      returnFocusTo = null;
      abort.abort();
    },
  };
}
