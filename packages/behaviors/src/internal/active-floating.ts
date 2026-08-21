const activeFloating = new WeakMap<Document, object[]>();

export function setActiveFloating(
  ownerDocument: Document,
  controller: object,
  active: boolean,
): void {
  const stack = (activeFloating.get(ownerDocument) ?? []).filter(
    (candidate) => candidate !== controller,
  );
  if (active) stack.push(controller);
  if (stack.length) activeFloating.set(ownerDocument, stack);
  else activeFloating.delete(ownerDocument);
}

export function isActiveFloating(
  ownerDocument: Document,
  controller: object,
): boolean {
  return activeFloating.get(ownerDocument)?.at(-1) === controller;
}
