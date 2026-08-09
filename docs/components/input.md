# Input

Input is a full field composition sourced from the `Input` Component Set: label, control, optional trailing action, and optional secondary actions. The native `<input>` is the interactive part, not the outer visual shell.

```html
<label class="shlz-field">
  <span class="shlz-field__label">Название</span>
  <span class="shlz-field__control">
    <input class="shlz-input" name="title" placeholder="Введите название" />
  </span>
</label>
```

Use `shlz-field--medium`, wrapper state classes for static fixtures, and native `disabled`, `readonly`, focus, and value state in applications. Input source properties are broken, so the library does not claim parsed Size/State/Filled/Type axes; all 21 node IDs remain in source coverage.

See [form-controls-source-spec.md](./form-controls-source-spec.md).
