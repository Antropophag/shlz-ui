# File Upload

File Upload is a framework-neutral native file-selection and drop surface. The library owns presentation, file-only drag filtering and the normalized event; validation, queue state, removal, upload transport, progress, persistence and announcements are consumer-owned.

```html
<div class="shlz-file-upload" data-shlz-file-upload>
  <input class="shlz-file-upload__input" id="documents" type="file" multiple />
  <label class="shlz-file-upload__surface" for="documents">
    <svg
      class="shlz-icon shlz-file-upload__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <use href="/icons.svg#shlz-icon-cloud-upload"></use>
    </svg>
    <span class="shlz-file-upload__instructions">
      Нажмите или перетащите файл в эту область
    </span>
  </label>
</div>
```

The complete 467×102 surface is the associated label and native file-selection trigger. The source-default instruction stays on one centered line; the component contracts to its container and may wrap only under narrow width or enlarged text. Do not add a separate button or pill inside the surface.

Call `enhanceFileUploads()` or construct `FileUploadController` for optional drag/drop support. Native `change` remains untouched. Each native selection or real file drop emits one bubbling `shlz:file-upload-files` event whose detail is `{ files: FileList, source: "input" | "drop", input }`. A drop never assigns `input.files`.

For invalid state, put `aria-invalid="true"` on both the root and native input, connect the input to the consumer-authored error using `aria-describedby`, and render `.shlz-file-upload__error`. Disabled behavior comes from the native input's `disabled` attribute; also put `aria-disabled="true"` on the full-surface label so its unavailable action is explicit while CSS derives the disabled surface from the input. The associated surface is the File Upload trigger contract, not a Button occurrence. Selected files belong in `.shlz-file-upload__files` and may compose File Row or Document Row.

Repeated enhancement returns the existing controller. `destroy()` removes library listeners and transient drag state but preserves markup and consumer data.
