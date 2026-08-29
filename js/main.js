// Boot. Its whole job is to put the pieces in touch with one another once, so
// that no module below has to know how the app is assembled.

import "./settings.js";
import { APP_VERSION } from "./config.js";
import { setHomeRenderer } from "./views.js";
import { renderHome } from "./home.js";

// how a practice mode gets back to the lessons without importing them
setHomeRenderer(renderHome);

document.getElementById("appVersion").textContent = APP_VERSION;
renderHome();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => { /* offline still works next load */ });
}
