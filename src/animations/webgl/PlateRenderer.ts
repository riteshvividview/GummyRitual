/**
 * PlateRenderer — a tiny raw-WebGL renderer for full-bleed photographic
 * "plates" with shader-driven transitions between them.
 *
 * Kept framework-free (no React, no three) so the same file can drop into
 * a Shopify theme as a plain ES module later. The caller drives state
 * imperatively with `setState(from, to, mix)` — from scroll progress
 * (hero) or from a tween (ingredients) — and the renderer only redraws
 * while it's visible.
 *
 * Transitions:
 *  - "focus":    a photographic focus pull — the outgoing plate softens
 *                with a gentle exposure lift, the next resolves into
 *                focus (the hero "Light Dial").
 *  - "dissolve": an organic, grain-edged dissolve (ingredient scenes).
 *
 * Fit:
 *  - "cover":  classic object-fit: cover around a focal point.
 *  - "height": the whole plate height is always visible. When the screen
 *              is wider than the plate, the plate is anchored right and
 *              its own left wall is extended (blurred, per row) into the
 *              free space, so nothing at the top or bottom is cropped.
 */

export type PlateTransition = "focus" | "dissolve" | "slats" | "depth" | "depthZoom" | "depthFocus";
export type PlateFit = "cover" | "height";

export interface PlateRendererOptions {
  canvas: HTMLCanvasElement;
  urls: string[];
  /** Optional depth maps (white = near), one per url — enables "depth". */
  depthUrls?: string[];
  /** Strength of the depth parallax (pointer + idle drift). */
  parallax?: number;
  /**
   * Optional cylinder to spin on transitions ("depth" mode): the product
   * tin, in image coordinates (0..1, top-left origin). Its front half is
   * the current plate's tin, its back half the next plate's tin.
   */
  spin?: { cx: number; r: number; top: number; bottom: number };
  transition?: PlateTransition;
  fit?: PlateFit;
  /** Normalised focal point kept in frame when the plate is cropped. */
  focus?: [number, number];
  /** Film grain amount (0 disables). */
  grain?: number;
  /** Cursor-following light amount (0 disables). */
  pointerLight?: number;
  /**
   * Per-plate light on the left side of the frame, behind the headline:
   * > 0 lifts the wall (a soft key light, for dark text), < 0 deepens it
   * (for light text). Interpolated across transitions.
   */
  wallLight?: number[];
  /** Which side of the frame the wall light falls on (where the text is). */
  lightSide?: "left" | "right";
  onReady?: () => void;
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform sampler2D uDA;
uniform sampler2D uDB;
uniform float uParallax;
uniform vec4 uTin;        // cx, r, y0, y1 in plate uv (bottom-up)
uniform float uSpin;      // ±1 = spin the tin (sign = direction), 0 = off
uniform vec2 uAspectA;   // image aspect (w/h)
uniform vec2 uAspectB;
uniform vec2 uRes;
uniform vec2 uFocus;
uniform float uMix;
uniform float uTime;
uniform float uGrain;
uniform vec2 uPointer;
uniform float uPointerAmt;
uniform float uLight;
uniform float uSide;     // 0 = left, 1 = right
uniform int uMode;
uniform int uFit;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

// Screen uv -> image uv. x < 0 means "left of the plate" (height fit).
vec2 placeUv(vec2 uv, float imgAspect, float scale) {
  float screenAspect = uRes.x / uRes.y;
  vec2 p;
  // Height fit leaves headroom: the plate fills the lower part of the
  // frame and its own wall is extended above it.
  float h = 1.0 - (uFit == 1 ? 0.14 : 0.0);
  float w = imgAspect * h / screenAspect; // plate width in screen units
  if (uFit == 1 && w < 1.0) {
    p = vec2((uv.x - (1.0 - w)) / w, uv.y / h);
  } else if (uFit == 1) {
    float off = (w - 1.0) * uFocus.x;
    p = vec2((uv.x * 1.0 + off) / w, uv.y / h);
  } else {
    vec2 s = vec2(1.0);
    if (screenAspect > imgAspect) s.y = imgAspect / screenAspect;
    else s.x = screenAspect / imgAspect;
    vec2 offset = (vec2(1.0) - s) * uFocus;
    p = uv * s + offset;
  }
  // scale about the plate's focal point
  return (p - uFocus) / scale + uFocus;
}

vec3 tap(sampler2D t, vec2 p) {
  return texture2D(t, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb;
}

// Soft disk blur; r = 0 is a single tap.
vec3 sampleSoft(sampler2D t, vec2 p, float r, float aspect) {
  if (r < 0.0005) return tap(t, p);
  vec3 acc = tap(t, p) * 2.0;
  float wsum = 2.0;
  for (int i = 0; i < 10; i++) {
    float a = float(i) * 2.39996;            // golden angle
    float rr = r * sqrt((float(i) + 0.5) / 10.0);
    vec2 o = vec2(cos(a) / aspect, sin(a)) * rr;
    acc += tap(t, p + o);
    wsum += 1.0;
  }
  return acc / wsum;
}

// The plate's own wall, blurred per row, used to extend it leftwards.
vec3 wallFill(sampler2D t, float y) {
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 7; i++) {
    float dy = (float(i) - 3.0) * 0.035;
    acc += tap(t, vec2(0.02, y + dy)) + tap(t, vec2(0.07, y + dy));
  }
  return acc / 14.0;
}

vec3 plate(sampler2D t, vec2 p, float r, float aspect) {
  vec3 img = sampleSoft(t, p, r, aspect);
  if (uFit == 0) return img;
  vec3 fill = wallFill(t, min(p.y, 0.96));
  // feather the plate's left edge into the extended wall
  float k = smoothstep(0.0, 0.12, p.x);
  vec3 col = mix(fill, img, k);
  // and its top edge into the wall extended upward
  vec3 top = tap(t, vec2(p.x, 0.97)) * 0.5 + tap(t, vec2(p.x + 0.03, 0.95)) * 0.25 + tap(t, vec2(p.x - 0.03, 0.95)) * 0.25;
  top = mix(fill, top, k);
  return mix(col, top, smoothstep(0.9, 1.0, p.y));
}

void main() {
  vec2 uv = vUv;
  float m = clamp(uMix, 0.0, 1.0);
  float pulse = sin(3.14159 * m);            // 0 at rest, 1 mid-transition

  vec3 col;
  if (uMode == 0) {
    // Focus pull: both plates defocus toward the midpoint with a slight
    // breathing push, crossfade, then the new plate resolves.
    float blur = 0.022 * pulse;
    vec2 pA = placeUv(uv, uAspectA.x, 1.0 + 0.025 * m);
    vec2 pB = placeUv(uv, uAspectB.x, 1.025 - 0.025 * m);
    vec3 a = plate(uA, pA, blur, uAspectA.x);
    vec3 b = plate(uB, pB, blur, uAspectB.x);
    float t = smoothstep(0.2, 0.8, m);
    col = mix(a, b, t);
    col *= 1.0 + 0.1 * pulse;                // a breath of exposure
  } else if (uMode == 3) {
    // Depth: parallax by depth; on change, the far wall resolves first and
    // the near objects arrive last, easing in from a gentle depth push.
    vec2 pA0 = placeUv(uv, uAspectA.x, 1.0);
    vec2 pB0 = placeUv(uv, uAspectB.x, 1.0);
    float dA = texture2D(uDA, vec2(clamp(pA0.x, 0.0, 1.0), 1.0 - clamp(pA0.y, 0.0, 1.0))).r;
    float dB = texture2D(uDB, vec2(clamp(pB0.x, 0.0, 1.0), 1.0 - clamp(pB0.y, 0.0, 1.0))).r;
    vec2 drift = vec2(sin(uTime * 0.25), cos(uTime * 0.19)) * 0.25;
    vec2 look = (uPointer - 0.5) + drift;
    vec2 parA = look * uParallax * dA;
    vec2 parB = look * uParallax * dB;
    // outgoing: near layers ease forward (scale up about the focal point)
    vec2 pA = pA0 - parA + (pA0 - uFocus) * (-0.10 * m * dA);
    // incoming: near layers settle back from a slight push
    vec2 pB = pB0 - parB + (pB0 - uFocus) * (-0.08 * (1.0 - m) * dB);
    vec3 a = plate(uA, pA, 0.0, uAspectA.x);
    vec3 b = plate(uB, pB, 0.0, uAspectB.x);
    float front = m * 1.5 - 0.25;            // sweeps far -> near
    float k = smoothstep(dB - 0.18, dB + 0.18, front);
    col = mix(a, b, k);
    col *= 1.0 + 0.06 * pulse * dA * (1.0 - k);

    // Tin spin: re-sample the tin as a cylinder turning about its axis.
    // Its shape follows the outgoing plate at the start of the turn and
    // the incoming plate at the end, so both rest states match exactly.
    if (abs(uSpin) > 0.5) {
      vec2 pT = mix(pA, pB, m);
      float dT = mix(dA, dB, m);
      float nx = (pT.x - uTin.x) / uTin.y;
      float inY = step(uTin.z, pT.y) * step(pT.y, uTin.w);
      float inside = step(abs(nx), 0.999) * inY * smoothstep(0.38, 0.55, dT);
      if (inside > 0.0) {
        float phi = asin(clamp(nx, -1.0, 1.0)) + sign(uSpin) * 3.14159265 * m;
        // never sample the tin's very edge: those texels are squashed and
        // smeared, and they read as a bright band where the labels meet
        float sA = clamp(sin(phi), -0.985, 0.985);
        vec3 colA = tap(uA, vec2(uTin.x + uTin.y * sA, pT.y));
        vec3 colB = tap(uB, vec2(uTin.x - uTin.y * sA, pT.y));
        // the two labels meet softly where they pass the side
        float w = smoothstep(-0.12, 0.12, cos(phi));
        vec3 tinCol = mix(colB, colA, w);
        // rounder shading: light falls off toward the cylinder's edges
        float srcN = abs(sA);
        float lamScreen = 0.62 + 0.38 * sqrt(max(0.0, 1.0 - nx * nx));
        float lamSrc = 0.62 + 0.38 * sqrt(max(0.0, 1.0 - srcN * srcN));
        // the photo's own edge is shaded dark: lift it back a little where it
        // lands mid-tin, capped so the seam never glows
        float ratio = min(lamScreen / lamSrc, 1.18);
        // the label edge passing through reads as the tin's turned-away side
        float c = cos(phi);
        ratio *= 1.0 - 0.04 * exp(-c * c / 0.03);
        tinCol *= mix(1.0, ratio, sin(3.14159265 * m));
        col = mix(col, tinCol, inside);
      }
    }
  } else if (uMode == 4) {
    // Depth melt: the two subjects never share the screen and nothing is
    // warped. First half: the outgoing scene melts into its own backdrop,
    // nearest objects first. Middle: backdrop colour shifts. Second half:
    // the new scene builds up from its backdrop, far to near.
    vec2 pA0 = placeUv(uv, uAspectA.x, 1.0);
    vec2 pB0 = placeUv(uv, uAspectB.x, 1.0);
    float dA = texture2D(uDA, vec2(clamp(pA0.x, 0.0, 1.0), 1.0 - clamp(pA0.y, 0.0, 1.0))).r;
    float dB = texture2D(uDB, vec2(clamp(pB0.x, 0.0, 1.0), 1.0 - clamp(pB0.y, 0.0, 1.0))).r;
    vec2 drift = vec2(sin(uTime * 0.25), cos(uTime * 0.19)) * 0.25;
    vec2 look = (uPointer - 0.5) + drift;
    vec3 a = plate(uA, pA0 - look * uParallax * dA, 0.0, uAspectA.x);
    vec3 b = plate(uB, pB0 - look * uParallax * dB, 0.0, uAspectB.x);
    // each scene's backdrop: its wall, softly blurred, at this height
    vec3 bgA = sampleSoft(uA, vec2(0.88, mix(0.55, 0.92, uv.y)), 0.06, uAspectA.x);
    vec3 bgB = sampleSoft(uB, vec2(0.88, mix(0.55, 0.92, uv.y)), 0.06, uAspectB.x);
    vec3 bg = mix(bgA, bgB, smoothstep(0.35, 0.65, m));
    float p1 = clamp(m * 2.0, 0.0, 1.0);
    float p2 = clamp(m * 2.0 - 1.0, 0.0, 1.0);
    float kA = smoothstep((1.0 - dA) - 0.25, (1.0 - dA) + 0.25, p1 * 1.5 - 0.25);
    float kB = smoothstep(dB - 0.25, dB + 0.25, p2 * 1.5 - 0.25);
    col = m < 0.5 ? mix(a, bg, kA) : mix(bg, b, kB);
  } else if (uMode == 5) {
    // Depth rack-focus: parallax by depth at rest. On change the lens racks
    // focus — the outgoing scene drifts out of focus away from its subject,
    // the whole frame crossfades evenly (no per-object reveal), and the new
    // scene pulls into focus with a slow depth dolly settling back.
    vec2 pA0 = placeUv(uv, uAspectA.x, 1.0);
    vec2 pB0 = placeUv(uv, uAspectB.x, 1.0);
    float dA = texture2D(uDA, vec2(clamp(pA0.x, 0.0, 1.0), 1.0 - clamp(pA0.y, 0.0, 1.0))).r;
    float dB = texture2D(uDB, vec2(clamp(pB0.x, 0.0, 1.0), 1.0 - clamp(pB0.y, 0.0, 1.0))).r;
    vec2 drift = vec2(sin(uTime * 0.25), cos(uTime * 0.19)) * 0.25;
    vec2 look = (uPointer - 0.5) + drift;
    float ea = smoothstep(0.0, 1.0, m);
    vec2 pA = pA0 - look * uParallax * dA + (pA0 - uFocus) * (-0.035 * ea * (0.4 + dA));
    vec2 pB = pB0 - look * uParallax * dB + (pB0 - uFocus) * (0.035 * (1.0 - ea) * (0.4 + dB));
    // focal plane: subject sharp longest, background softens first
    float bA = 0.024 * smoothstep(0.0, 0.6, m) * (0.35 + 0.65 * (1.0 - dA * (1.0 - m)));
    float bB = 0.024 * (1.0 - smoothstep(0.4, 1.0, m)) * (0.35 + 0.65 * (1.0 - dB * m));
    vec3 a = plate(uA, pA, bA, uAspectA.x);
    vec3 b = plate(uB, pB, bB, uAspectB.x);
    col = mix(a, b, smoothstep(0.3, 0.7, m));
  } else if (uMode == 2) {
    // Slats: vertical strips open from their centres, staggered left → right.
    vec2 pA = placeUv(uv, uAspectA.x, 1.0 + 0.02 * m);
    vec2 pB = placeUv(uv, uAspectB.x, 1.03 - 0.03 * m);
    vec3 a = plate(uA, pA, 0.0, uAspectA.x);
    vec3 b = plate(uB, pB, 0.0, uAspectB.x);
    float n = 9.0;
    float idx = floor(uv.x * n);
    float delay = idx / n * 0.45;
    float t = clamp((m - delay) / 0.55, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    float d = abs(fract(uv.x * n) - 0.5) * 2.0;
    // soft edge that is fully closed at t = 0 and fully open at t = 1
    float e = t * 1.12 - 0.06;
    float edge = smoothstep(e - 0.05, e + 0.05, d);
    col = mix(b, a * (1.0 - 0.12 * t), edge);
  } else {
    vec2 pA = placeUv(uv, uAspectA.x, 1.0 + 0.035 * m);
    vec2 pB = placeUv(uv, uAspectB.x, 1.035 - 0.035 * m);
    vec3 a = plate(uA, pA, 0.0, uAspectA.x);
    vec3 b = plate(uB, pB, 0.0, uAspectB.x);
    float n = fbm(uv * 4.0 + 3.7);
    float g = hash(uv * uRes + 0.5) * 0.08;
    float t = smoothstep(m * 1.25 - 0.2, m * 1.25, n + g);
    col = mix(b, a, t);
  }

  // Wall light behind the text column (left or right side of frame)
  float sx = mix(uv.x, 1.0 - uv.x, uSide);
  float band = smoothstep(0.62, 0.0, sx);
  float side = band * smoothstep(-0.1, 0.35, uv.y);
  if (uLight > 0.0) {
    vec3 lifted = 1.0 - (1.0 - col) * 0.62;  // screen toward warm white
    lifted *= vec3(1.0, 0.985, 0.96);
    col = mix(col, lifted, uLight * side);
  } else {
    col *= 1.0 + uLight * band;
  }

  // cursor light — a soft studio fill that follows the pointer
  float d = distance(uv * vec2(uRes.x / uRes.y, 1.0), uPointer * vec2(uRes.x / uRes.y, 1.0));
  col *= 1.0 + uPointerAmt * exp(-d * d * 5.5);

  // subtle vignette
  vec2 q = uv - 0.5;
  col *= 1.0 - dot(q, q) * 0.22;

  // animated film grain (luma)
  float gr = hash(uv * uRes + fract(uTime * 7.31) * 113.0) - 0.5;
  col += gr * uGrain;

  gl_FragColor = vec4(col, 1.0);
}`;

interface Tex {
  tex: WebGLTexture;
  aspect: number;
}

export class PlateRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private textures: (Tex | null)[];
  private depth: (Tex | null)[] = [];
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private raf = 0;
  private running = false;
  private visible = true;
  private disposed = false;
  private start = performance.now();
  private observer: IntersectionObserver;
  private resizeObserver: ResizeObserver;

  private from = 0;
  private to = 0;
  private mix = 0;
  private pointer = { x: 0.7, y: 0.45, tx: 0.7, ty: 0.45 };
  private dirty = true;
  private lastGrainDraw = 0;

  private opts: PlateRendererOptions;

  constructor(opts: PlateRendererOptions) {
    this.opts = opts;
    const gl = opts.canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl || gl.isContextLost()) throw new Error("WebGL unavailable");
    this.gl = gl;
    this.program = this.createProgram();
    this.textures = opts.urls.map(() => null);
    this.setupGeometry();
    this.loadTextures();
    this.depth = (opts.depthUrls ?? []).map(() => null);
    opts.depthUrls?.forEach((url, i) => this.loadImage(url, (t) => (this.depth[i] = t)));

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(opts.canvas);
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        if (this.visible) this.loop();
      },
      { rootMargin: "100px" }
    );
    this.observer.observe(opts.canvas);
    this.resize();
  }

  /** Show `from` → `to` at `mix` (0 = fully `from`, 1 = fully `to`). */
  setState(from: number, to: number, mix: number) {
    if (from === this.from && to === this.to && mix === this.mix) return;
    this.from = from;
    this.to = to;
    this.mix = mix;
    this.dirty = true;
    this.loop();
  }

  /** Normalised pointer position over the canvas (0..1, top-left origin). */
  setPointer(x: number, y: number) {
    this.pointer.tx = x;
    this.pointer.ty = y;
    this.loop();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    this.resizeObserver.disconnect();
    const gl = this.gl;
    this.textures.forEach((t) => t && gl.deleteTexture(t.tex));
    gl.deleteProgram(this.program);
    // Deliberately no loseContext(): React StrictMode remounts reuse the
    // same <canvas>, and a lost context can't be recovered on it.
  }

  /* ---------------------------------------------------------------- */

  private loop = () => {
    if (this.running || this.disposed || !this.visible) return;
    this.running = true;
    const tick = () => {
      if (this.disposed || !this.visible) {
        this.running = false;
        return;
      }
      // Grain animates continuously only when grain is on; otherwise we
      // render on demand and stop once the pointer light has settled.
      const p = this.pointer;
      p.x += (p.tx - p.x) * 0.08;
      p.y += (p.ty - p.y) * 0.08;
      const settling = Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.0005;
      const animateGrain =
        (this.opts.grain ?? 0) > 0 || this.opts.transition === "depth" || this.opts.transition === "depthZoom" || this.opts.transition === "depthFocus";
      // Grain alone ticks at film cadence (24fps) rather than every frame.
      const now = performance.now();
      const grainDue = animateGrain && now - this.lastGrainDraw > 1000 / 24;
      if (this.dirty || settling || grainDue) {
        this.draw();
        this.dirty = false;
        this.lastGrainDraw = now;
      }
      if (!settling && !animateGrain) {
        this.running = false;
        return;
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  };

  private draw() {
    const gl = this.gl;
    const a = this.textures[this.from] ?? this.textures.find(Boolean);
    const b = this.textures[this.to] ?? a;
    if (!a || !b) return;
    const u = this.uniforms;
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, a.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, b.tex);
    gl.uniform1i(u.uA, 0);
    gl.uniform1i(u.uB, 1);
    gl.uniform2f(u.uAspectA, a.aspect, 1);
    gl.uniform2f(u.uAspectB, b.aspect, 1);
    gl.uniform2f(u.uRes, gl.drawingBufferWidth, gl.drawingBufferHeight);
    const focus = this.opts.focus ?? [0.5, 0.5];
    gl.uniform2f(u.uFocus, focus[0], focus[1]);
    gl.uniform1f(u.uMix, this.mix);
    gl.uniform1f(u.uTime, (performance.now() - this.start) / 1000);
    gl.uniform1f(u.uGrain, this.opts.grain ?? 0);
    gl.uniform2f(u.uPointer, this.pointer.x, 1 - this.pointer.y);
    gl.uniform1f(u.uPointerAmt, this.opts.pointerLight ?? 0);
    const lights = this.opts.wallLight;
    const lightA = lights?.[this.from] ?? 0;
    const lightB = lights?.[this.to] ?? lightA;
    gl.uniform1f(u.uLight, lightA + (lightB - lightA) * this.mix);
    gl.uniform1f(u.uSide, this.opts.lightSide === "right" ? 1 : 0);
    const hasDepth = !!(this.depth[this.from] && this.depth[this.to]);
    const mode =
      this.opts.transition === "depth" ? (hasDepth ? 3 : 1)
      : this.opts.transition === "depthZoom" ? (hasDepth ? 4 : 1)
      : this.opts.transition === "depthFocus" ? (hasDepth ? 5 : 0)
      : this.opts.transition === "dissolve" ? 1
      : this.opts.transition === "slats" ? 2 : 0;
    gl.uniform1i(u.uMode, mode);
    if (hasDepth) {
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.depth[this.from]!.tex);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, this.depth[this.to]!.tex);
      gl.uniform1i(u.uDA, 2);
      gl.uniform1i(u.uDB, 3);
    }
    gl.uniform1f(u.uParallax, this.opts.parallax ?? 0.02);
    const sp = this.opts.spin;
    // going back turns the tin the other way, so it reads as returning
    gl.uniform1f(u.uSpin, sp ? (this.to < this.from ? -1 : 1) : 0);
    if (sp) gl.uniform4f(u.uTin, sp.cx, sp.r, 1 - sp.bottom, 1 - sp.top);
    gl.uniform1i(u.uFit, this.opts.fit === "height" ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private resize() {
    const canvas = this.opts.canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
    this.dirty = true;
    this.loop();
  }

  private loadTextures() {
    let loaded = 0;
    this.opts.urls.forEach((url, i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      img
        .decode()
        .catch(() => undefined)
        .then(() => {
          if (this.disposed || !img.naturalWidth) return;
          const gl = this.gl;
          const tex = gl.createTexture()!;
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
          this.textures[i] = { tex, aspect: img.naturalWidth / img.naturalHeight };
          loaded++;
          this.dirty = true;
          this.loop();
          if (i === 0 || loaded === this.opts.urls.length) this.opts.onReady?.();
        });
    });
  }

  private loadImage(url: string, done: (t: Tex) => void) {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    img
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (this.disposed || !img.naturalWidth) return;
        const gl = this.gl;
        const tex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        done({ tex, aspect: img.naturalWidth / img.naturalHeight });
        this.dirty = true;
        this.loop();
      });
  }

  private setupGeometry() {
    const gl = this.gl;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(this.program, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const name of [
      "uA", "uB", "uAspectA", "uAspectB", "uRes", "uFocus", "uMix", "uTime",
      "uGrain", "uPointer", "uPointerAmt", "uLight", "uSide", "uMode", "uFit", "uDA", "uDB", "uParallax", "uTin", "uSpin",
    ]) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }
  }

  private createProgram() {
    const gl = this.gl;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(s) ?? "shader compile failed");
      }
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) ?? "program link failed");
    }
    return p;
  }
}
