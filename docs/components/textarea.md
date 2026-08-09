# Textarea

Textarea is an independent source composition with confirmed State, Filled, and Show Count axes.

```html
<label class="shlz-field shlz-field--textarea">
  <span class="shlz-field__label">Комментарий</span>
  <span class="shlz-field__control">
    <textarea class="shlz-textarea" maxlength="100"></textarea>
  </span>
  <span class="shlz-field__secondary">
    <span class="shlz-field__counter">0 / 100</span>
  </span>
</label>
```

For errors, set `aria-invalid="true"`, render `.shlz-field__message`, and connect it with `aria-describedby`. See [form-controls-source-spec.md](./form-controls-source-spec.md).
