// Making a tile answer to a finger. Longer than it looks it should be, and the
// comment below says why: Chrome on Android does not reliably send a click for
// a tap that rolls or rests, so the gesture is followed by hand.

// A finger is not a mouse. It lands, rolls a little, and sometimes rests
// before it lifts — and Chrome on Android answers that by withholding the
// click: past its tap slop, or once a press turns into a long press, the
// gesture belongs to the browser and the tile plays dead. So touch activation
// does not wait for a click. It follows the gesture from press to release and
// counts a release on the element however long the press lasted and however
// far the finger rolled — and if the browser seizes the gesture midway, it
// counts the seizure, the finger having been on the tile when it happened.
//
// The gesture is followed twice over, through pointer events and through touch
// events, because Chrome truncates the two streams independently: a press it
// takes for itself ends in pointercancel with no pointerup, while the touch
// stream runs on to touchend, whose target is fixed at touchstart and so
// cannot be retargeted away. Whichever stream gets there first counts the tap;
// `answered` keeps the other from counting the same finger twice.
const TAP_SLOP = 24;   // px outside the element that a release still counts as on it
let lastTap = 0;       // when the last tap fired, to quiet the click behind it
let answered = false;  // whether the gesture in progress has already counted

// one finger followed through one event stream. The two streams number their
// fingers differently, so each gets its own follower and its own ids.
function follow(el, fn) {
  let id = null, x = 0, y = 0;
  return {
    start(i, cx, cy) { id = i; x = cx; y = cy; answered = false; },
    move(i, cx, cy) { if (i === id) { x = cx; y = cy; } },
    // a seizure reports no position of its own; the last one known stands
    end(i, cx, cy) {
      if (i !== id) return;
      id = null;
      if (cx !== undefined) { x = cx; y = cy; }
      if (answered || el.disabled) return;
      const r = el.getBoundingClientRect();
      if (x < r.left - TAP_SLOP || x > r.right + TAP_SLOP ||
          y < r.top - TAP_SLOP || y > r.bottom + TAP_SLOP) return;
      // a pointer or touch event is a user gesture in its own right, so speech
      // asked for here still passes Chrome's autoplay gate
      answered = true;
      lastTap = performance.now();
      fn();
    }
  };
}

export function onTap(el, fn) {
  const p = follow(el, fn), t = follow(el, fn);
  el.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse") return;
    p.start(e.pointerId, e.clientX, e.clientY);
    // the capture keeps the rest of the gesture on this element even once the
    // finger has slid off its edge, so the slop above is ours to judge
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* a nicety, not a need */ }
  });
  el.addEventListener("pointermove", e => p.move(e.pointerId, e.clientX, e.clientY));
  el.addEventListener("pointerup", e => p.end(e.pointerId, e.clientX, e.clientY));
  el.addEventListener("pointercancel", e => p.end(e.pointerId));
  el.addEventListener("touchstart", e => {
    const c = e.changedTouches[0];
    t.start(c.identifier, c.clientX, c.clientY);
  }, { passive: true });
  el.addEventListener("touchmove", e => {
    for (const c of e.changedTouches) t.move(c.identifier, c.clientX, c.clientY);
  }, { passive: true });
  el.addEventListener("touchend", e => {
    for (const c of e.changedTouches) t.end(c.identifier, c.clientX, c.clientY);
  });
  el.addEventListener("touchcancel", e => {
    for (const c of e.changedTouches) t.end(c.identifier);
  });
  // a long press has nothing to offer on a tile
  el.addEventListener("contextmenu", e => e.preventDefault());
  el.addEventListener("click", e => {
    // whatever click the browser sends behind a tap we already answered is a
    // duplicate — and it can land on the tile drawn in this one's place, which
    // is why the guard is a clock and not a flag on the element
    if (e.pointerType === "touch" || e.pointerType === "pen") return;
    if (performance.now() - lastTap < 400) return;
    fn();
  });
}