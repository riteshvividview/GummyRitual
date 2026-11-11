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

export type PlateTransition = "focus" | "dissolve";
export type PlateFit = "cover" | "height";

export interface PlateRendererOptions {
  canvas: HTMLCanvasElement;
  urls: string[];
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
  float w = imgAspect / screenAspect; // plate width in screen units at full height
  if (uFit == 1 && w < 1.0) {
    p = vec2((uv.x - (1.0 - w)) / w, uv.y);
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
  vec3 fill = wallFill(t, p.y);
  // feather the plate's left edge into the extended wall
  float k = smoothstep(0.0, 0.12, p.x);
  return mix(fill, img, k);
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
      const animateGrain = (this.opts.grain ?? 0) > 0;
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
    gl.uniform1i(u.uMode, this.opts.transition === "dissolve" ? 1 : 0);
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
      "uGrain", "uPointer", "uPointerAmt", "uLight", "uSide", "uMode", "uFit",
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
