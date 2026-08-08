export function listenForOutsidePointer(
  elements: readonly HTMLElement[],
  onOutsidePointer: () => void,
  signal: AbortSignal,
): void {
  const ownerDocument = elements[0]?.ownerDocument;
  if (!ownerDocument) return;

  ownerDocument.addEventListener(
    "pointerdown",
    (event) => {
      const target = event.target;
      if (
        target instanceof Node &&
        elements.every((element) => !element.contains(target))
      ) {
        onOutsidePointer();
      }
    },
    { signal },
  );
}
