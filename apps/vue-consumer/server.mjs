import { createServer as createHttpServer } from "node:http";
import { createServer as createViteServer } from "vite";
import { renderToString } from "vue/server-renderer";
import { createConsumer } from "./app.js";

const vite = await createViteServer({
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  server: { middlewareMode: true },
  appType: "custom",
});
const server = createHttpServer((request, response) => {
  vite.middlewares(request, response, async () => {
    try {
      const markup = await renderToString(createConsumer());
      const html = await vite.transformIndexHtml(
        request.url,
        `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SHLZ Vue consumer</title></head><body><div id="app">${markup}</div><script type="module" src="/apps/vue-consumer/client.js"></script></body></html>`,
      );
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(html);
    } catch (error) {
      response.writeHead(500);
      response.end(String(error));
    }
  });
});
server.listen(4175, "127.0.0.1");
const close = async () => {
  await vite.close();
  server.close();
};
process.on("SIGTERM", close);
process.on("SIGINT", close);
