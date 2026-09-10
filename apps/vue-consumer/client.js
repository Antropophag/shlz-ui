import "@shlz/styles/shlz.css";
import "@fontsource/golos-text/400.css";
import { createConsumer } from "./app.js";

window.serverButton = document.querySelector("#reactive-button");
const app = createConsumer(
  new globalThis.URL(window.location.href).searchParams.has("iconSizeProbe"),
);
const consumer = app.mount("#app");
window.setButtonPresentation = consumer.setPresentation;
window.consumerHydrated = true;
