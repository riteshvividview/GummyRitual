# Gummy Rituals

## PROJECT
Gummy Rituals — a premium gummy wellness brand with two distinct experiences: **Kids** and **Adults**.

## PURPOSE
This is a React + TypeScript + Vite prototype built to demonstrate visual quality, interactions, animation, and overall experience to the client. It is **not** the production site.

The production store will eventually be rebuilt in **Shopify (Liquid)**. Every architectural decision here should keep that migration cheap:
- Content/product data stays separate from UI (`src/data/`)
- Animation logic stays separate from section markup (`src/animations/`)
- Each major section in `src/sections/` should be self-contained enough to become its own `sections/*.liquid` file later
- No unnecessary backend dependency

## DESIGN PHILOSOPHY
- Apple-inspired product storytelling
- Premium, modern ecommerce — not a generic Shopify template feel
- Cinematic, minimal but visually rich
- Strong whitespace and visual hierarchy
- Sophisticated typography
- High-quality, purposeful motion design
- Excellent mobile experience — never assume desktop dimensions

## ANIMATION PHILOSOPHY
- Animations must have purpose — do not animate for its own sake
- Use scroll-driven storytelling only where it improves the story, not on every section
- Stack: GSAP + ScrollTrigger (timelines, parallax, pinned sections, reveals), Lenis (smooth scroll), Three.js/React Three Fiber (future real-time 3D)
- Image-sequence scroll sync is the architecture for future Blender-rendered cinematic moments (pouch opening, gummy rotation, camera moves, product transformation): `scroll progress → GSAP ScrollTrigger → animation progress → image-sequence frame → canvas`. See `src/animations/sequences/useScrollSequence.ts`.
- Respect `prefers-reduced-motion` everywhere — smooth scroll and heavy scroll animation must degrade gracefully, never break usability
- Interactive elements must remain fully usable without hover (no hover-dependent-only interactions)
- Animation weight should differ by viewport: heavier cinematic treatment on desktop, a lighter equivalent on mobile (branch with `src/hooks/useMediaQuery.ts` / `useIsMobile`)

## KIDS EXPERIENCE
Premium playful, colorful, whimsical, soft, modern. **Never** cheap or cartoonish. Gummies, fruit, clouds, playful 3D elements — rendered with the same production polish as the Adults experience.

## ADULT EXPERIENCE
Sophisticated, luxury wellness, editorial. Muted/elegant colors, premium typography, more restrained animation. Must be visually distinct from Kids — a different visual world under the same brand, not a recolor.

## IMPORTANT CONSTRAINTS
- Do not make every section scroll-driven — only where it improves storytelling
- Do not make every section visually identical — each section should have its own composition/interaction concept while still reading as one brand
- Avoid excessive floating cards, random blobs, unnecessary gradients, generic glassmorphism, excessive text, arrows/pointers, UI clutter, or childish typography in Adult mode
- The site should feel intentionally art-directed, not templated

## TECH STACK (installed)
- React 19 + TypeScript + Vite
- GSAP + @gsap/react + ScrollTrigger — scroll animation, timelines, parallax, pinned sections
- Lenis — smooth scrolling, ticked via GSAP's ticker (see `src/hooks/useLenis.ts`)
- three + @react-three/fiber + @react-three/drei — future real-time 3D product scenes
- clsx — conditional classnames (`src/utils/cn.ts`)

## ARCHITECTURE NOTES
- `src/animations/gsap/` — GSAP plugin registration + reusable scroll-animation patterns (reveal, parallax, pinned sections, scroll timelines). Do not hardcode one-off animations directly in section components; compose from these helpers where possible.
- `src/animations/sequences/` — image-sequence-on-scroll architecture for future Blender-rendered cinematic sections.
- `src/animations/cursor/` — cursor-follow/interaction primitives (skipped on touch devices).
- `src/hooks/useLenis.ts` — single Lenis instance, StrictMode-safe, ticks via `gsap.ticker`, updates `ScrollTrigger` on scroll, cleans up fully on unmount.
- `src/components/layout/SmoothScrollProvider.tsx` — mounts Lenis app-wide, auto-disables under `prefers-reduced-motion`.
- `src/sections/` — one numbered subfolder per homepage section (see HOMEPAGE below), each currently empty except a `.gitkeep`.
- `src/assets/homepage/` — mirrors `src/sections/` 1:1, each section folder has `images/` and `videos/` subfolders for the client's raw media uploads (source files to reference from components, not final optimized build output).
- `src/data/` — content/product data, kept separate from components so it maps onto Shopify product/metafield data later.

## HOMEPAGE (Kids experience)
This is the **Kids** experience homepage ("Nutrition Made for Growing Kids" in section 2 — copy and tone should follow the KIDS EXPERIENCE philosophy above, not Adults). 8 sections, in order, each with a matching `src/sections/NN-slug/` component folder and `src/assets/homepage/NN-slug/{images,videos}/` media folder:

1. `01-hero` — Hero / The Gummy World: scroll-driven product reveal, floating gummies, parallax, opening-pouch animation
2. `02-our-gummies` — Our Gummies: all four gummy products, premium 3D product presentation
3. `03-benefits` — Why Gummy Rituals?: immunity, growth, focus, energy, everyday nutritional support
4. `04-ingredients` — Inside Every Gummy: interactive ingredient exploration (fruits, botanicals, vitamins, nutrients)
5. `05-daily-routine` — Made for Little Rituals: gummies fit into a child's morning/evening routine
6. `06-taste-texture` — Taste & Texture: close-up 3D gummy visuals, flavors, colors, shapes, playful interactions
7. `07-parents-trust` — Parents' Trust: science & safety, quality, formulation, testing, age guidance
8. `08-final-cta` — Final CTA: all products, offer/CTA, "Shop Gummies" close

Not built yet — folders exist only to hold uploaded media and give each section a home once building starts.

## CURRENT STATE
Environment + architecture setup only. **No homepage, hero, or product sections have been built yet.** Do not generate them unless explicitly instructed in a future session — this file is persistent context, not a green light to start building pages.
