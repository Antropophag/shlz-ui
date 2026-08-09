# Select

Select follows the Figma Component Set named `Dropdown`; it does not reuse Input as its visual model. A native `<select>` can power the single-value form, while searchable and multiselect products should keep equivalent semantics in their own behavior layer.

```html
<label class="shlz-field shlz-field--select">
  <span class="shlz-field__label">Тип</span>
  <span class="shlz-field__control">
    <select class="shlz-select" name="type">
      <option>Значение</option>
    </select>
    <img class="shlz-field__icon" src="arrow-down-md.svg" alt="" />
  </span>
</label>
```

Confirmed source axes and UNKNOWN behavior are recorded in [form-controls-source-spec.md](./form-controls-source-spec.md).
