import { Buffer } from "node:buffer";
import { unzipSync } from "fflate";

export function listZipEntries(archive) {
  const names = [];
  unzipSync(archive, {
    filter: ({ name }) => {
      names.push(name);
      return false;
    },
  });
  return names;
}

// Decode ZIP names in JavaScript, independently of OS unzip and locale.
// Read only the exact requested entry; never extract archive paths to disk.
export function readZipEntry(archive, entry) {
  const entries = unzipSync(archive, {
    filter: ({ name }) => name === entry,
  });
  if (!Object.hasOwn(entries, entry))
    throw new Error(`ZIP entry not found: ${entry}`);
  return Buffer.from(entries[entry]);
}
