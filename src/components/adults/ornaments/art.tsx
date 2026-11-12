import type { ReactElement } from "react";

/**
 * Line illustrations for the Adults ornaments. Every stroke carries
 * `pathLength={1}` + `data-draw`, so Ornament can draw it in with scroll.
 * All art is stroke-only in `currentColor`.
 */

export type OrnamentArt = "sprig" | "orbit" | "dayArc" | "citrus" | "lattice" | "rays";

const P = { pathLength: 1, "data-draw": true } as const;

/** An almond leaf leaving (x, y) at `angle` degrees, `len` long. */
function leaf(x: number, y: number, angle: number, len: number, key: string) {
  const w = len * 0.3;
  return (
    <g key={key} transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path
        {...P}
        d={`M0 0 C ${len * 0.3} ${-w}, ${len * 0.75} ${-w}, ${len} 0 C ${len * 0.75} ${w}, ${len * 0.3} ${w}, 0 0`}
      />
      <path {...P} d={`M0 0 L ${len * 0.82} 0`} />
    </g>
  );
}

function Sprig() {
  // stem rises with a slow S-curve; leaves alternate and shrink upward
  const rows = [
    { x: 101, y: 268, len: 74 },
    { x: 103, y: 214, len: 68 },
    { x: 103, y: 160, len: 60 },
    { x: 100, y: 110, len: 50 },
    { x: 97, y: 66, len: 40 },
  ];
  return (
    <svg viewBox="0 0 200 330" fill="none">
      <path {...P} d="M100 326 C 96 250, 110 170, 100 100 C 97 70, 95 44, 96 14" />
      {rows.map((r, i) => [
        leaf(r.x, r.y, -152 + i * 3, r.len, `l${i}`),
        leaf(r.x, r.y - 20, -28 - i * 3, r.len * 0.94, `r${i}`),
      ])}
      {leaf(96, 16, -84, 30, "tip")}
    </svg>
  );
}

function Orbit() {
  // three tilted orbits around a core, nine actives resting on them
  const dots: [number, number][] = [];
  [0, 60, 120].forEach((rot, k) => {
    [20 + k * 35, 140 + k * 35, 260 + k * 35].forEach((deg) => {
      const t = (deg * Math.PI) / 180;
      const r = (rot * Math.PI) / 180;
      const ex = 132 * Math.cos(t);
      const ey = 50 * Math.sin(t);
      dots.push([160 + ex * Math.cos(r) - ey * Math.sin(r), 160 + ex * Math.sin(r) + ey * Math.cos(r)]);
    });
  });
  return (
    <svg viewBox="0 0 320 320" fill="none">
      {[0, 60, 120].map((rot) => (
        <ellipse key={rot} {...P} cx="160" cy="160" rx="132" ry="50" transform={`rotate(${rot} 160 160)`} />
      ))}
      <circle {...P} cx="160" cy="160" r="13" />
      {dots.map(([x, y], i) => (
        <circle key={i} data-dot cx={x} cy={y} r="4.5" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

function DayArc() {
  // sunrise on the left, the arc of the day, a crescent moon on the right
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const t = (i + 1) / 12;
    // point on the quadratic M60 250 Q600 -130 1140 250
    const x = (1 - t) ** 2 * 60 + 2 * (1 - t) * t * 600 + t ** 2 * 1140;
    const y = (1 - t) ** 2 * 250 + 2 * (1 - t) * t * -130 + t ** 2 * 250;
    return <path key={i} {...P} d={`M${x} ${y - 6} L${x} ${y + 6}`} />;
  });
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return (
      <path
        key={i}
        {...P}
        d={`M${60 + Math.cos(a) * 24} ${250 + Math.sin(a) * 24} L${60 + Math.cos(a) * 36} ${250 + Math.sin(a) * 36}`}
      />
    );
  });
  return (
    <svg viewBox="0 0 1200 300" fill="none">
      <circle {...P} cx="60" cy="250" r="15" />
      {rays}
      <path {...P} d="M60 250 Q600 -130 1140 250" />
      {ticks}
      <path {...P} d="M1150 226 A 24 24 0 1 0 1164 266 A 19 19 0 1 1 1150 226" />
    </svg>
  );
}

function Citrus() {
  const segs = Array.from({ length: 10 }, (_, i) => (
    <path
      key={i}
      {...P}
      transform={`rotate(${i * 36} 160 160)`}
      d="M160 146 C 178 110, 184 70, 160 44 C 136 70, 142 110, 160 146"
    />
  ));
  return (
    <svg viewBox="0 0 320 320" fill="none">
      <circle {...P} cx="160" cy="160" r="150" />
      <circle {...P} cx="160" cy="160" r="128" />
      {segs}
      <circle {...P} cx="160" cy="160" r="7" />
    </svg>
  );
}

function Lattice() {
  // a fragment of a molecular lattice: fused hexagons with a few open bonds
  const R = 44;
  const hex = (cx: number, cy: number, key: string) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = ((60 * i - 30) * Math.PI) / 180;
      return `${cx + R * Math.cos(a)} ${cy + R * Math.sin(a)}`;
    });
    return <path key={key} {...P} d={`M${pts.join(" L")} Z`} />;
  };
  const dx = R * Math.sqrt(3);
  const cells: [number, number][] = [
    [90, 80],
    [90 + dx, 80],
    [90 + dx * 2, 80],
    [90 + dx / 2, 80 + R * 1.5],
    [90 + dx * 1.5, 80 + R * 1.5],
    [90 + dx, 80 + R * 3],
  ];
  const nodes: [number, number][] = [
    [90 - dx / 2, 80 - R / 2],
    [90 + dx * 2.5, 80 + R / 2],
    [90 + dx, 80 + R * 4],
    [90 + dx * 1.5, 80 - R],
  ];
  return (
    <svg viewBox="0 0 330 300" fill="none">
      {cells.map(([x, y], i) => hex(x, y, `h${i}`))}
      <path {...P} d={`M${90 - dx / 2} ${80 - R / 2} L${90 - dx} ${80 - R}`} />
      <path {...P} d={`M${90 + dx} ${80 + R * 4} L${90 + dx} ${80 + R * 4.8}`} />
      {nodes.map(([x, y], i) => (
        <circle key={i} data-dot cx={x} cy={y} r="4.5" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

function Rays() {
  // a low sun: half-disc with long, fine rays
  const rays = Array.from({ length: 17 }, (_, i) => {
    const a = Math.PI + (i * Math.PI) / 16;
    const r1 = 78;
    const r2 = i % 2 ? 150 : 190;
    return (
      <path
        key={i}
        {...P}
        d={`M${200 + Math.cos(a) * r1} ${200 + Math.sin(a) * r1} L${200 + Math.cos(a) * r2} ${200 + Math.sin(a) * r2}`}
      />
    );
  });
  return (
    <svg viewBox="0 0 400 204" fill="none">
      <path {...P} d="M140 200 A 60 60 0 0 1 260 200" />
      {rays}
      <path {...P} d="M0 200 L400 200" />
    </svg>
  );
}

export const ART: Record<OrnamentArt, () => ReactElement> = {
  sprig: Sprig,
  orbit: Orbit,
  dayArc: DayArc,
  citrus: Citrus,
  lattice: Lattice,
  rays: Rays,
};
