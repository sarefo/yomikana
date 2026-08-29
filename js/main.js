// Boot. Its whole job is to put the pieces in touch with one another once, so
// that no module below has to know how the app is assembled.

import "./settings.js";
import { APP_VERSION } from "./config.js";
import { setHomeRenderer, whenIdle } from "./views.js";
import { renderHome } from "./home.js";

// how a practice mode gets back to the lessons without importing them
setHomeRenderer(renderHome);

document.getElementById("appVersion").textContent = APP_VERSION;
renderHome();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  // A new build has finished downloading, so the code running here is already
  // the old one. It is swapped in on the next load, and the next load is
  // arranged for the first moment the lessons screen is showing — never in the
  // middle of a round, where a reload reads as the app quitting on its own.
  navigator.serviceWorker.addEventListener("message", e => {
    if (e.data && e.data.type === "upgraded") whenIdle(() => location.reload());
  });
  // addEventListener alone leaves the messages queued: the delivery only starts
  // on an onmessage assignment or on this call, and without it the worker is
  // talking to nobody
  navigator.serviceWorker.startMessages();
  navigator.serviceWorker.register("sw.js").catch(() => { /* offline still works next load */ });
}
