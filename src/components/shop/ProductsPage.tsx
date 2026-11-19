import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, FlaskConical, Leaf, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { gsap, ScrollTrigger } from "../../animations/gsap/gsapConfig";
import { useTilt } from "../../animations/cursor/useTilt";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { catalog, formatINR, type CatalogProduct, type ShopRange } from "../../data/catalog";
import { navigate } from "../../lib/router";
import { useCart } from "../../state/CartContext";
import { packImage, sceneImage } from "./shopImages";
import styles from "./ProductsPage.module.css";

type Filter = "all" | ShopRange;

const kidsRange = catalog.filter((p) => p.range === "kids");
const adultRange = catalog.filter((p) => p.range === "adults");

const TRUST = [
  { icon: ShieldCheck, title: "Third-party tested", note: "Every batch, before it ships" },
  { icon: Leaf, title: "Nothing artificial", note: "No artificial colours or flavours" },
  { icon: FlaskConical, title: "Formulated with experts", note: "Clinically studied ingredients" },
  { icon: Truck, title: "Free shipping", note: "On orders over ₹999" },
];

/**
 * /shop — both ranges on one page. An intro with two "doors" (Kids,
 * Adults) that double as the filter, then each range in its own visual
 * world: Kids as tactile tilt cards on fruit washes, Adults as a quiet
 * editorial index where hovering a pack brings its room photograph in.
 */
export function ProductsPage({ filter }: { filter: Filter }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const setFilter = (f: Filter) => {
    navigate(f === "all" ? "/shop" : `/shop?range=${f}`);
  };

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || reduced) return;
      const q = gsap.utils.selector(root);
      gsap.from(q("[data-intro]"), { y: 36, autoAlpha: 0, duration: 1.1, ease: "power3.out", stagger: 0.08 });
      gsap.from(q("[data-door]"), { y: 60, autoAlpha: 0, duration: 1.2, ease: "power3.out", stagger: 0.12, delay: 0.2 });
      ScrollTrigger.batch(q("[data-reveal]"), {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.from(els, { y: 48, autoAlpha: 0, duration: 1, ease: "power3.out", stagger: 0.09, overwrite: true }),
      });
    },
    { scope: ref, dependencies: [reduced, filter], revertOnUpdate: true }
  );

  const showKids = filter !== "adults";
  const showAdults = filter !== "kids";

  return (
    <div ref={ref} className={styles.page}>
      <section className={styles.intro}>
        <p className={styles.eyebrow} data-intro>
          The Collection
        </p>
        <h1 className={styles.title} data-intro>
          Small rituals,
          <br />
          <em>for every age.</em>
        </h1>
        <p className={styles.lede} data-intro>
          Two ranges, one standard. Bright, fruity daily support for growing kids — and quiet, considered
          rituals for the grown-ups who look after them.
        </p>

        <div className={styles.doors}>
          <Door
            range="kids"
            active={filter}
            onSelect={setFilter}
            label="For Kids"
            count={`${kidsRange.length} gummies · Ages 3+`}
            products={kidsRange}
          />
          <Door
            range="adults"
            active={filter}
            onSelect={setFilter}
            label="For Adults"
            count={`${adultRange.length} rituals · 18+`}
            products={adultRange}
          />
        </div>

        <div className={styles.filterBar} role="tablist" aria-label="Filter products" data-intro>
          {(["all", "kids", "adults"] as Filter[]).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterOn : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? `All · ${catalog.length}` : f === "kids" ? "Kids" : "Adults"}
            </button>
          ))}
        </div>
      </section>

      {showKids && (
        <section className={styles.kidsWorld} id="kids" aria-labelledby="kids-h">
          <header className={styles.kidsHead} data-reveal>
            <p className={styles.kidsEyebrow}>For growing kids</p>
            <h2 id="kids-h" className={styles.kidsTitle}>
              Nutrition they’ll <span>ask for.</span>
            </h2>
            <ul className={styles.kidsPromises}>
              <li>Real fruit</li>
              <li>Zero sugar</li>
              <li>No artificial colours</li>
            </ul>
          </header>
          <div className={styles.kidsGrid}>
            {kidsRange.map((p) => (
              <KidsCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {showAdults && (
        <section className={styles.adultsWorld} id="adults" aria-labelledby="adults-h">
          <header className={styles.adultsHead} data-reveal>
            <p className={styles.adultsEyebrow}>For adults</p>
            <h2 id="adults-h" className={styles.adultsTitle}>
              Rituals for the
              <br />
              everyday you.
            </h2>
            <p className={styles.adultsLede}>
              Four quiet formulas, each for one part of how you feel. Take one, or build a ritual around a few.
            </p>
          </header>
          <ol className={styles.adultsIndex}>
            {adultRange.map((p, i) => (
              <AdultItem key={p.id} product={p} index={i} />
            ))}
          </ol>
        </section>
      )}

      <section className={styles.trust} aria-label="Our promise">
        {TRUST.map(({ icon: Icon, title, note }) => (
          <div key={title} className={styles.trustItem} data-reveal>
            <Icon size={22} strokeWidth={1.6} />
            <p className={styles.trustTitle}>{title}</p>
            <p className={styles.trustNote}>{note}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

/* Intro door — a filter that shows the range it opens onto. */
function Door({
  range,
  active,
  onSelect,
  label,
  count,
  products,
}: {
  range: ShopRange;
  active: Filter;
  onSelect: (f: Filter) => void;
  label: string;
  count: string;
  products: CatalogProduct[];
}) {
  const tilt = useTilt<HTMLButtonElement>({ max: 4, shift: 10 });
  const on = active === range;
  // Entrance animates the wrapper; the tilt owns the button's transform.
  return (
    <div data-door className={styles.doorWrap}>
    <button
      ref={tilt}
      type="button"
      className={`${styles.door} ${range === "kids" ? styles.doorKids : styles.doorAdults} ${on ? styles.doorOn : ""} ${
        active !== "all" && !on ? styles.doorDim : ""
      }`}
      aria-pressed={on}
      onClick={() => onSelect(on ? "all" : range)}
    >
      <span className={styles.doorPacks} data-depth="1.2">
        {products.map((p, i) => (
          <img
            key={p.id}
            src={packImage(p)}
            alt=""
            className={styles.doorPack}
            style={{ ["--i" as string]: i, ["--n" as string]: products.length }}
            draggable={false}
          />
        ))}
      </span>
      <span className={styles.doorText}>
        <span className={styles.doorLabel}>{label}</span>
        <span className={styles.doorCount}>{count}</span>
      </span>
      <span className={styles.doorArrow}>
        <ArrowRight size={18} strokeWidth={2} />
      </span>
    </button>
    </div>
  );
}

function Rating({ p }: { p: CatalogProduct }) {
  return (
    <span className={styles.rating}>
      <Star size={13} strokeWidth={0} fill="currentColor" />
      {p.rating.toFixed(1)}
      <span className={styles.ratingCount}>({p.reviewCount})</span>
    </span>
  );
}

function QuickAdd({ p, className, children }: { p: CatalogProduct; className: string; children: React.ReactNode }) {
  const { add } = useCart();
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        add({ productId: p.id, packSize: 1, subscribe: false, quantity: 1 });
      }}
      aria-label={`Add ${p.title} to bag`}
    >
      {children}
    </button>
  );
}

/* Kids — a tactile card: pack floats over a fruit-wash, tilts with the cursor. */
function KidsCard({ product: p }: { product: CatalogProduct }) {
  const stage = useTilt<HTMLAnchorElement>({ max: 7, lift: 20, shift: 16 });
  const save = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
  return (
    <article className={styles.kidsCard} style={{ ["--tint" as string]: p.tint, ["--deep" as string]: p.tintDeep, ["--wash" as string]: p.wash }} data-reveal>
      <a ref={stage} href={`/shop/${p.id}`} className={styles.kidsStage} aria-label={`${p.title} — view details`}>
        <span className={styles.kidsBlob} data-depth="-0.6" aria-hidden />
        <img src={packImage(p)} alt="" className={styles.kidsPack} data-depth="1" draggable={false} />
        <span className={styles.kidsChips} data-depth="0.4">
          {p.benefits.slice(0, 3).map((b) => (
            <span key={b} className={styles.kidsChip}>
              {b}
            </span>
          ))}
        </span>
        {save > 0 && <span className={styles.kidsSave}>Save {save}%</span>}
      </a>
      <div className={styles.kidsInfo}>
        <div>
          <h3 className={styles.kidsName}>
            <a href={`/shop/${p.id}`}>{p.title}</a>
          </h3>
          <p className={styles.kidsMeta}>
            {p.flavour} · {p.count} · <Rating p={p} />
          </p>
          <p className={styles.kidsDesc}>{p.description}</p>
        </div>
        <div className={styles.kidsBuy}>
          <p className={styles.kidsPrice}>
            {formatINR(p.price)}
            {p.compareAt && <s>{formatINR(p.compareAt)}</s>}
          </p>
          <QuickAdd p={p} className={styles.kidsAdd}>
            Add to bag
          </QuickAdd>
        </div>
      </div>
    </article>
  );
}

/* Adults — editorial index item: number, pack on its wash; hover brings the room in. */
function AdultItem({ product: p, index }: { product: CatalogProduct; index: number }) {
  const stage = useTilt<HTMLAnchorElement>({ max: 3, shift: 10 });
  return (
    <li className={styles.adultItem} style={{ ["--tint" as string]: p.tint, ["--deep" as string]: p.tintDeep, ["--wash" as string]: p.wash }} data-reveal>
      <span className={styles.adultNo}>{String(index + 1).padStart(2, "0")}</span>
      <a ref={stage} href={`/shop/${p.id}`} className={styles.adultStage} aria-label={`${p.title} — view details`}>
        <img src={sceneImage(p)} alt="" className={styles.adultRoom} loading="lazy" draggable={false} />
        <img src={packImage(p)} alt="" className={styles.adultPack} data-depth="1" loading="lazy" draggable={false} />
      </a>
      <div className={styles.adultInfo}>
        <h3 className={styles.adultName}>
          <a href={`/shop/${p.id}`}>{p.title}</a>
        </h3>
        <p className={styles.adultMeta}>
          {p.flavour} · {p.count}
        </p>
        <ul className={styles.adultBenefits}>
          {p.benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div className={styles.adultBuy}>
          <span className={styles.adultPrice}>{formatINR(p.price)}</span>
          <Rating p={p} />
          <QuickAdd p={p} className={styles.adultAdd}>
            <Plus size={16} strokeWidth={1.8} />
          </QuickAdd>
        </div>
      </div>
    </li>
  );
}
