# File Upload

File Upload is a framework-neutral native file-selection and drop surface. The library owns presentation, file-only drag filtering and the normalized event; validation, queue state, removal, upload transport, progress, persistence and announcements are consumer-owned.

```html
<div class="shlz-file-upload" data-shlz-file-upload>
  <input
    class="shlz-file-upload__input"
    id="documents"
    type="file"
    multiple
    aria-describedby="documents-help"
  />
  <div class="shlz-file-upload__surface">
    <div class="shlz-file-upload__content">
      <p class="shlz-file-upload__title">Drop files here</p>
      <p class="shlz-file-upload__instructions" id="documents-help">
        PDF or images. Consumer validation applies.
      </p>
    </div>
    <label class="shlz-file-upload__trigger" for="documents"
      >Choose files</label
    >
  </div>
</div>
```

Call `enhanceFileUploads()` or construct `FileUploadController` for optional drag/drop support. Native `change` remains untouched. Each native selection or real file drop emits one bubbling `shlz:file-upload-files` event whose detail is `{ files: FileList, source: "input" | "drop", input }`. A drop never assigns `input.files`.

For invalid state, put `aria-invalid="true"` on both the root and native input, connect the input to the consumer-authored error using `aria-describedby`, and render `.shlz-file-upload__error`. Disabled behavior comes from the native input's `disabled` attribute; also put `aria-disabled="true"` on the visible label so its unavailable action is explicit while CSS derives the disabled surface from the input. The associated label is the File Upload trigger contract, not a Button occurrence. Selected files belong in `.shlz-file-upload__files` and may compose File Row or Document Row.

Repeated enhancement returns the existing controller. `destroy()` removes library listeners and transient drag state but preserves markup and consumer data.
