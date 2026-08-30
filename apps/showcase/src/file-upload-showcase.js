import { enhanceFileUploads } from "@shlz/behaviors";

const upload = ({
  id,
  auditId,
  title = "Drop files here",
  help = "PDF, PNG or JPG. Up to 10 MB.",
  disabled = false,
  invalid = false,
  files = "",
}) => {
  const errorId = `${id}-error`;
  const invalidAttribute = invalid ? ' aria-invalid="true"' : "";
  const describedBy = invalid ? `${id}-help ${errorId}` : `${id}-help`;
  const disabledAttribute = disabled ? " disabled" : "";
  const triggerDisabled = disabled ? ' aria-disabled="true"' : "";
  const error = invalid
    ? `<p class="shlz-file-upload__error" id="${errorId}">The consumer rejected this file.</p>`
    : "";
  return `<div class="shlz-file-upload" data-shlz-file-upload data-component-audit-id="${auditId}"${invalidAttribute}><input class="shlz-file-upload__input" id="${id}" type="file" multiple aria-describedby="${describedBy}"${disabledAttribute}><div class="shlz-file-upload__surface"><div class="shlz-file-upload__content"><p class="shlz-file-upload__title">${title}</p><p class="shlz-file-upload__instructions" id="${id}-help">${help}</p></div><label class="shlz-file-upload__trigger" for="${id}"${triggerDisabled}>Choose files</label></div>${error}<ul class="shlz-file-upload__files" data-file-upload-files>${files}</ul></div>`;
};

const row = (name, auditId = "") => {
  const auditAttribute = auditId ? ` data-component-audit-id="${auditId}"` : "";
  return `<li class="shlz-file-row"${auditAttribute}><span class="shlz-file-row__visual" aria-hidden="true">📄</span><span class="shlz-file-row__content"><span class="shlz-file-row__title">${name}</span><span class="shlz-file-row__meta">Selected locally</span></span><button class="shlz-file-row__action" type="button" aria-label="Remove ${name}">×</button></li>`;
};

export const fileUploadShowcaseMarkup = `<article id="file-upload-demo"><h3>File Upload</h3><p>Native selection and optional file-only drop enhancement; validation and queue lifecycle remain consumer-owned.</p><div class="shlz-component-grid">${upload({ id: "showcase-upload-input", auditId: "file-upload-showcase-empty" })}${upload({ id: "showcase-upload-populated", auditId: "file-upload-showcase-populated", files: row("existing-contract-with-a-long-localized-filename.pdf", "file-row-file-upload-populated") })}${upload({ id: "showcase-upload-disabled", auditId: "file-upload-showcase-disabled", disabled: true })}${upload({ id: "showcase-upload-error", auditId: "file-upload-showcase-error", invalid: true })}</div><section><h4>Data Workspace consumer</h4><p data-file-upload-consumer-status>No files selected.</p>${upload({ id: "workspace-upload-input", auditId: "file-upload-data-workspace", help: "The application validates and owns this queue.", files: row("No file selected", "file-row-file-upload-consumer") })}</section></article>`;

export function enhanceFileUploadShowcase() {
  const controllers = enhanceFileUploads();
  for (const root of document.querySelectorAll("[data-shlz-file-upload]")) {
    root.addEventListener("shlz:file-upload-files", (event) => {
      const list = root.querySelector("[data-file-upload-files]");
      if (root.dataset.componentAuditId === "file-upload-data-workspace") {
        const status = document.querySelector(
          "[data-file-upload-consumer-status]",
        );
        if (status)
          status.textContent = `${event.detail.files.length} file(s) queued by the application.`;
        const title = root.querySelector(".shlz-file-row__title");
        const meta = root.querySelector(".shlz-file-row__meta");
        if (title)
          title.textContent = event.detail.files[0]?.name ?? "No file selected";
        if (meta) meta.textContent = `${event.detail.files.length} selected`;
      } else if (list) {
        list.replaceChildren(
          ...[...event.detail.files].map((file) => {
            const item = document.createElement("li");
            item.className = "shlz-file-upload__file-name";
            item.textContent = file.name;
            return item;
          }),
        );
      }
    });
  }
  return controllers;
}
