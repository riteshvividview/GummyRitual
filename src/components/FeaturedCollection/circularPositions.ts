/**
 * Pure positioning math for the circular product carousel — no DOM, no
 * React, so it's trivial to reason about/reuse independent of how many
 * products exist.
 *
 * Model: products sit on an invisible circular disc. At any time, up to
 * `maxVisible` of them are shown in a flat, evenly-spaced, non-overlapping
 * row (slots, left to right), sized almost identically with only a subtle
 * rotateY tilt giving the row its "wrapping around a disc" read — matching
 * the reference composition exactly (no single dominant center card, no
 * overlap). Rotating the carousel reassigns which product occupies which
 * slot (and which products, if any, are hidden beyond maxVisible) —
 * that's the actual circular motion; nothing here hardcodes "4 products."
 */

export interface CardTransform {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  rotateY: number;
  opacity: number;
  blur: number;
  zIndex: number;
}

/** Shortest signed distance from `index` to `activeIndex` around a circle
 * of `total` items — e.g. for 4 items, index 3 relative to active 0 is -1
 * (one step left), not +3. */
export function getSignedOffset(index: number, activeIndex: number, total: number): number {
  if (total <= 0) return 0;
  let offset = (index - activeIndex) % total;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

export interface SlotAssignment {
  /** Left-to-right slot position (0-indexed), or -1 if not currently shown. */
  slotIndex: number;
  visible: boolean;
}

/**
 * Decides which products are visible this frame (the `maxVisible` closest
 * to active, by circular distance) and which left-to-right slot each one
 * occupies. Slots are always evenly spaced and symmetric around center —
 * for an even `maxVisible` (the usual desktop case of 4) that means two
 * slots sit left-of-center and two right-of-center, none dead-center,
 * which is exactly how 4 same-size items read in the reference image.
 */
export function getSlotAssignments(
  activeIndex: number,
  total: number,
  maxVisible: number
): Map<number, SlotAssignment> {
  const withOffsets = Array.from({ length: total }, (_, index) => ({
    index,
    offset: getSignedOffset(index, activeIndex, total),
  }));

  const visibleCount = Math.min(maxVisible, total);
  const closestFirst = [...withOffsets].sort(
    (a, b) => Math.abs(a.offset) - Math.abs(b.offset) || a.offset - b.offset
  );
  const visible = closestFirst.slice(0, visibleCount).sort((a, b) => a.offset - b.offset);

  const assignments = new Map<number, SlotAssignment>();
  visible.forEach((item, slotIndex) => {
    assignments.set(item.index, { slotIndex, visible: true });
  });
  withOffsets.forEach(({ index }) => {
    if (!assignments.has(index)) assignments.set(index, { slotIndex: -1, visible: false });
  });

  return assignments;
}

/** Spacing/tilt strength at full (desktop) strength — scaled down by
 * `spread` on narrower viewports (see ProductCarousel.tsx). */
const SLOT_GAP_X = 340;
const ROTATE_Y_PER_SLOT = 10;
const SCALE_FALLOFF_PER_SLOT = 0.035;
const OPACITY_FALLOFF_PER_SLOT = 0.03;
/** The stand graphic (ProductStand.tsx) has a taller center platform and
 * two shorter side platforms — these nudge the center card up and the
 * side cards down so each one's "feet" line up with its own platform's
 * top surface, rather than all three floating at the same height. */
const CENTER_SLOT_LIFT = -22;
const SIDE_SLOT_DROP = 20;

const HIDDEN_TRANSFORM: CardTransform = {
  x: 0,
  y: -80,
  scale: 0.3,
  rotate: 0,
  rotateY: 0,
  opacity: 0,
  blur: 2,
  zIndex: 0,
};

/**
 * Full transform for one product, given the current slot layout and a
 * responsive `spread` multiplier (1 = full desktop strength; see
 * ProductCarousel.tsx's breakpoint-driven spread value).
 */
export function getCardTransform(
  assignment: SlotAssignment,
  visibleCount: number,
  spread: number
): CardTransform {
  if (!assignment.visible) return HIDDEN_TRANSFORM;

  const center = (visibleCount - 1) / 2;
  const d = assignment.slotIndex - center; // signed distance from the row's center, e.g. -1.5..1.5 for 4 visible
  const absD = Math.abs(d);

  return {
    x: d * SLOT_GAP_X * spread,
    y: (d === 0 ? CENTER_SLOT_LIFT : SIDE_SLOT_DROP) * spread,
    scale: 1 - absD * SCALE_FALLOFF_PER_SLOT * spread,
    rotate: 0,
    rotateY: -d * ROTATE_Y_PER_SLOT * spread,
    opacity: 1 - absD * OPACITY_FALLOFF_PER_SLOT * spread,
    blur: 0,
    zIndex: Math.round(50 - absD * 10),
  };
}
