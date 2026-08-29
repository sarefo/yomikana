// The two toggles in the corner. Both are remembered, and both survive a reset
// of the learning progress — erasing what you have learned should not also
// turn the lights back on.

import { store, saveStore } from "./store.js";

function applyTheme() {
  const t = store.settings.theme ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = t;
}
function applySound() {
  document.documentElement.dataset.sound = store.settings.sound === false ? "off" : "on";
}
applyTheme();
applySound();
document.getElementById("themeBtn").addEventListener("click", () => {
  const cur = document.documentElement.dataset.theme;
  store.settings.theme = cur === "dark" ? "light" : "dark";
  saveStore();
  applyTheme();
});
document.getElementById("soundBtn").addEventListener("click", () => {
  store.settings.sound = store.settings.sound === false;
  saveStore();
  applySound();
});