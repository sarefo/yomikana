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

// What the boot script in index.html asks for when the worker announces a new
// build: the code running here is already the old one, and it is swapped in on
// the next load — which is arranged for the first moment the lessons screen is
// showing, never in the middle of a round. The worker is registered over there
// rather than here on purpose; the comment on it says why.
window.takeUpgrade = () => whenIdle(() => location.reload());
