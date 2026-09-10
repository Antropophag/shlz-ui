import "@shlz/styles/shlz.css";
import "@fontsource/golos-text/400.css";
import { createConsumer } from "./app.js";

window.serverButton = document.querySelector("#reactive-button");
const app = createConsumer();
app.mount("#app");
window.consumerHydrated = true;
