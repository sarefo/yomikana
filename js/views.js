// The frame a practice mode runs inside. One screen holds the lessons, the
// other holds whatever is being practiced on top of them; a mode owns the
// stage in the middle and nothing around it. The title, the way back and the
// footnote live here so that adding a second mode does not mean adding a
// second copy of the plumbing.

export const homeEl = document.getElementById("home");
export const sessionEl = document.getElementById("session");
export const stage = document.getElementById("stage");
const titleEl = document.getElementById("sessionTitle");
const footEl = document.getElementById("sessionFoot");

// Set once at boot: what to draw when a mode hands control back. Modes call
// exitSession() instead of reaching into the home screen themselves, which is
// what keeps every import in this app pointing one way.
let drawHome = () => {};
export function setHomeRenderer(fn) { drawHome = fn; }

// What the back arrow and "Resume later" do while a mode is running. Each mode
// supplies its own, because leaving means tearing down its own state first.
let leave = exitSession;

export function openSession(title, onLeave) {
  titleEl.textContent = title;
  leave = onLeave;
  footEl.classList.remove("hidden");
  homeEl.classList.add("hidden");
  sessionEl.classList.remove("hidden");
}

export function exitSession() {
  leave = exitSession;
  sessionEl.classList.add("hidden");
  homeEl.classList.remove("hidden");
  drawHome();
}

// Hidden on the screens that are not questions — a checkpoint offers its own
// way onward, and "Resume later" underneath it only muddies the choice.
export function showFoot(on) { footEl.classList.toggle("hidden", !on); }

document.getElementById("backBtn").addEventListener("click", () => leave());
// Progress is written to the store on every answer, so leaving costs nothing
// and picking the group again carries straight on. The back arrow already does
// exactly this; the button exists to say out loud that leaving is safe.
document.getElementById("pauseBtn").addEventListener("click", () => leave());
