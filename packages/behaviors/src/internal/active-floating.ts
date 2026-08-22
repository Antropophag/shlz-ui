const activeFloating = new WeakMap<Document, object[]>();
const claimedEscapeEvents = new WeakSet<Event>();

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

function isActiveFloating(
  ownerDocument: Document,
  controller: object,
): boolean {
  return activeFloating.get(ownerDocument)?.at(-1) === controller;
}

export function claimActiveFloatingEscape(
  ownerDocument: Document,
  controller: object,
  event: KeyboardEvent,
): boolean {
  if (event.key !== "Escape") return false;
  if (claimedEscapeEvents.has(event)) return false;
  if (!isActiveFloating(ownerDocument, controller)) return false;
  claimedEscapeEvents.add(event);
  return true;
}
