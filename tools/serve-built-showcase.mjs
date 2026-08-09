import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = process.cwd();
const showcaseRoot = path.join(root, "apps/showcase/dist");
const port = Number(process.env.SHLZ_SHOWCASE_PORT ?? 4173);
const types = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

createServer(async (request, response) => {
  const pathname = decodeURIComponent(
    new globalThis.URL(request.url, "http://local").pathname,
  );
  const requested = pathname.startsWith("/@fs/")
    ? path.resolve("/", pathname.slice(5))
    : path.join(showcaseRoot, pathname === "/" ? "index.html" : pathname);
  const allowedRoots = [root, showcaseRoot];
  if (
    !allowedRoots.some((allowed) =>
      requested.startsWith(`${allowed}${path.sep}`),
    )
  ) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const metadata = await stat(requested);
    if (!metadata.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type":
        types.get(path.extname(requested)) ?? "application/octet-stream",
    });
    createReadStream(requested).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(`Built showcase: http://127.0.0.1:${port}\n`);
});
