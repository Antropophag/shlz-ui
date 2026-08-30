import { enhanceFileUploads } from "@shlz/behaviors";
import { iconHref, iconViewBox } from "@shlz/icons";
import spriteUrl from "@shlz/icons/sprite.svg?url";

const uploadIcon = `<svg class="shlz-icon shlz-file-upload__icon" viewBox="${iconViewBox("cloud-upload")}" aria-hidden="true"><use href="${iconHref(spriteUrl, "cloud-upload")}"></use></svg>`;

const upload = ({
  id,
  auditId,
  instruction = "Нажмите или перетащите файл в эту область",
  disabled = false,
  invalid = false,
  files = "",
}) => {
  const errorId = `${id}-error`;
  const invalidAttribute = invalid ? ' aria-invalid="true"' : "";
  const describedBy = invalid ? ` aria-describedby="${errorId}"` : "";
  const disabledAttribute = disabled ? " disabled" : "";
  const inputInvalid = invalid ? ' aria-invalid="true"' : "";
  const triggerDisabled = disabled ? ' aria-disabled="true"' : "";
  const error = invalid
    ? `<p class="shlz-file-upload__error" id="${errorId}">The consumer rejected this file.</p>`
    : "";
  return `<div class="shlz-file-upload" data-shlz-file-upload data-component-audit-id="${auditId}"${invalidAttribute}><input class="shlz-file-upload__input" id="${id}" type="file" multiple${describedBy}${inputInvalid}${disabledAttribute}><label class="shlz-file-upload__surface" for="${id}"${triggerDisabled}>${uploadIcon}<span class="shlz-file-upload__instructions">${instruction}</span></label>${error}<ul class="shlz-file-upload__files" data-file-upload-files>${files}</ul></div>`;
};

const row = (name, auditId = "") => {
  const auditAttribute = auditId ? ` data-component-audit-id="${auditId}"` : "";
  return `<li class="shlz-file-row"${auditAttribute}><span class="shlz-file-row__visual" aria-hidden="true">📄</span><span class="shlz-file-row__content"><span class="shlz-file-row__title">${name}</span><span class="shlz-file-row__meta">Selected locally</span></span><button class="shlz-file-row__action" type="button" aria-label="Remove ${name}">×</button></li>`;
};

const specimen = (title, markup) =>
  `<section class="shlz-file-upload-showcase__specimen"><h4>${title}</h4>${markup}</section>`;

export const fileUploadShowcaseMarkup = `<article id="file-upload-demo"><h3>File Upload</h3><p>Native selection and optional file-only drop enhancement; validation and queue lifecycle remain consumer-owned.</p><div class="shlz-file-upload-showcase">${specimen("Source default", upload({ id: "showcase-upload-input", auditId: "file-upload-showcase-empty" }))}${specimen("Populated composition", upload({ id: "showcase-upload-populated", auditId: "file-upload-showcase-populated", files: row("existing-contract-with-a-long-localized-filename.pdf", "file-row-file-upload-populated") }))}${specimen("Disabled · repository state", upload({ id: "showcase-upload-disabled", auditId: "file-upload-showcase-disabled", disabled: true }))}${specimen("Error · repository state", upload({ id: "showcase-upload-error", auditId: "file-upload-showcase-error", invalid: true }))}</div><section><h4>Data Workspace consumer</h4><p data-file-upload-consumer-status>No files selected.</p>${upload({ id: "workspace-upload-input", auditId: "file-upload-data-workspace", files: row("No file selected", "file-row-file-upload-consumer") })}</section></article>`;

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
        const action = root.querySelector(".shlz-file-row__action");
        if (title)
          title.textContent = event.detail.files[0]?.name ?? "No file selected";
        if (meta) meta.textContent = `${event.detail.files.length} selected`;
        if (action)
          action.setAttribute(
            "aria-label",
            `Remove ${event.detail.files[0]?.name ?? "selected file"}`,
          );
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
    root.addEventListener("click", (event) => {
      const action = event.target.closest?.(".shlz-file-row__action");
      if (!action || !root.contains(action)) return;
      if (root.dataset.componentAuditId === "file-upload-data-workspace") {
        root.querySelector(".shlz-file-row__title").textContent =
          "No file selected";
        root.querySelector(".shlz-file-row__meta").textContent = "0 selected";
        action.setAttribute("aria-label", "Remove selected file");
        document.querySelector(
          "[data-file-upload-consumer-status]",
        ).textContent = "No files selected.";
      } else {
        action.closest(".shlz-file-row")?.remove();
      }
    });
  }
  return controllers;
}
