# Composer / Rich Text Toolbar

Composer and Rich Text Toolbar are independent, framework-neutral HTML/CSS contracts. The library owns their presentation; editable value, commands, selection, attachments, validation, and submission are consumer-owned.

## Rich Text Toolbar contract

Use `.shlz-rich-text-toolbar` with `role="toolbar"` and an accessible name. Put related native buttons in `.shlz-rich-text-toolbar__group` elements with `role="group"` and their own names. Toggle commands expose `aria-pressed`; unavailable commands use the native `disabled` attribute. Native Tab order is intentional. Advanced roving focus and shortcuts belong to the consumer.

```html
<div
  class="shlz-rich-text-toolbar"
  role="toolbar"
  aria-label="Форматирование комментария"
>
  <div
    class="shlz-rich-text-toolbar__group"
    role="group"
    aria-label="Стиль текста"
  >
    <button
      class="shlz-rich-text-toolbar__button"
      type="button"
      aria-label="Полужирный"
      aria-pressed="false"
    >
      <svg
        class="shlz-icon shlz-rich-text-toolbar__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <use href="/icons.svg#shlz-icon-bold-type"></use>
      </svg>
    </button>
  </div>
</div>
```

Toolbar groups wrap as complete units in narrow containers. This is a repository-specific responsive decision because the static source does not establish an overflow interaction.

## Composer contract

The root `.shlz-composer` composes a label, optional help, `.shlz-composer__frame`, consumer-provided editing surface, attachments, status, and actions. A native `textarea`, labelled `contenteditable`, or editor mount point can use `.shlz-composer__editor`.

```html
<section class="shlz-composer">
  <label class="shlz-composer__label" for="comment">Комментарий</label>
  <p class="shlz-composer__help">Добавьте пояснение.</p>
  <div class="shlz-composer__frame">
    <!-- semantic .shlz-rich-text-toolbar may be inserted here -->
    <textarea class="shlz-composer__editor" id="comment"></textarea>
  </div>
  <footer class="shlz-composer__footer">
    <p class="shlz-composer__status" aria-live="polite"></p>
    <div class="shlz-composer__actions">
      <button class="shlz-button shlz-button--primary" type="button">
        Отправить
      </button>
    </div>
  </footer>
</section>
```

Put `aria-invalid="true"` on the Composer and semantic editor when invalid. Pair `data-disabled="true"` with native `disabled` controls, and `data-readonly="true"` with the native `readonly` attribute or equivalent editor semantics. Root hooks style the shell; they do not create behavior.

Attachments may compose existing File Row or Document Row primitives. Actions may compose existing Buttons. The consumer owns accessible status copy and any live announcement policy.

The native editing-area example grows from 128px to a repository-defined 320px maximum, then scrolls vertically. Consumers replacing it with another editor may choose a different growth policy, but must keep that overflow behavior explicit and preserve the Composer container boundary.

## Accessibility

Every editing surface and toolbar needs an accessible name. Icons are decorative (`aria-hidden="true"`); button names describe commands. Keep native disabled, read-only, invalid, and pressed semantics synchronized with root hooks. Focus remains in native document order.

## Responsive behavior

The Composer contracts to its container, wraps toolbar groups, stacks supporting regions when narrow, and permits long labels, attachment names, help, status, and localized action copy to wrap without horizontal overflow.

## Non-goals

The package does not provide an editor engine, document schema, command API, formatting execution, selection preservation, keyboard shortcuts, sanitization, upload lifecycle, messaging, persistence, or submission transport. Framework adapters remain optional consumer code.
