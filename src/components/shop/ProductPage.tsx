import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Leaf, Minus, Plus, RefreshCw, ShieldCheck, Star, Truck } from "lucide-react";
import { gsap, ScrollTrigger } from "../../animations/gsap/gsapConfig";
import { useTilt } from "../../animations/cursor/useTilt";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { catalog, formatINR, getProduct, packPrice, PACKS, SUBSCRIBE_SAVE, type CatalogProduct } from "../../data/catalog";
import { useCart } from "../../state/CartContext";
import { useExperience } from "../../state/ExperienceContext";
import { gallery, packImage } from "./shopImages";
import styles from "./ProductPage.module.css";

/**
 * /shop/:id — the buy page. One template themed by range (Kids: rounded,
 * warm, playful type; Adults: paper, editorial serif), so both feel native
 * to their homepage. Maps to Shopify's product template: gallery = media,
 * packs = variants, subscribe = selling plan, accordions = metafields.
 */
export function ProductPage({ id }: { id: string }) {
  const product = getProduct(id);
  const { setMode } = useExperience();

  // Header + footer follow the product's world.
  useEffect(() => {
    if (product) setMode(product.range);
  }, [product, setMode]);

  if (!product) {
    return (
      <div className={styles.missing}>
        <p>We couldn’t find that gummy.</p>
        <a href="/shop">Back to the collection</a>
      </div>
    );
  }
  return <Product key={product.id} p={product} />;
}

function Product({ p }: { p: CatalogProduct }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const kids = p.range === "kids";

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || reduced) return;
      const q = gsap.utils.selector(root);
      gsap.from(q("[data-in]"), { y: 28, autoAlpha: 0, duration: 1, ease: "power3.out", stagger: 0.06, delay: 0.1 });
      gsap.from(q("[data-stage]"), { scale: 0.96, autoAlpha: 0, duration: 1.3, ease: "power3.out" });
      ScrollTrigger.batch(q("[data-reveal]"), {
        start: "top 88%",
        once: true,
        onEnter: (els) => gsap.from(els, { y: 44, autoAlpha: 0, duration: 1, ease: "power3.out", stagger: 0.08 }),
      });
    },
    { scope: ref, dependencies: [reduced] }
  );

  const vars = { ["--tint" as string]: p.tint, ["--deep" as string]: p.tintDeep, ["--wash" as string]: p.wash };
  const related = catalog.filter((o) => o.id !== p.id).sort((a, b) => Number(b.range === p.range) - Number(a.range === p.range)).slice(0, 3);

  return (
    <div ref={ref} className={`${styles.page} ${kids ? styles.kids : styles.adults}`} style={vars}>
      <nav className={styles.crumbs} aria-label="Breadcrumb" data-in>
        <a href="/shop">Shop</a>
        <span>/</span>
        <a href={`/shop?range=${p.range}`}>{kids ? "Kids" : "Adults"}</a>
        <span>/</span>
        <span aria-current="page">{p.title}</span>
      </nav>

      <section className={styles.top}>
        <Gallery p={p} />
        <BuyPanel p={p} />
      </section>

      <section className={styles.story} data-reveal>
        <p className={styles.storyEyebrow}>The ritual</p>
        <p className={styles.storyText}>{p.story}</p>
      </section>

      <section className={styles.inside}>
        <header className={styles.sectionHead} data-reveal>
          <p className={styles.sectionEyebrow}>Inside every gummy</p>
          <h2 className={styles.sectionTitle}>{kids ? "Good stuff, made fun." : "What’s inside, and why."}</h2>
        </header>
        <ul className={styles.ingredients}>
          {p.keyIngredients.map((ing, i) => (
            <li key={ing.name} className={styles.ingredient} data-reveal>
              <span className={styles.ingNo}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.ingName}>{ing.name}</span>
              {ing.note && <span className={styles.ingNote}>{ing.note}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.howto}>
        <header className={styles.sectionHead} data-reveal>
          <p className={styles.sectionEyebrow}>How to enjoy</p>
          <h2 className={styles.sectionTitle}>{kids ? "As easy as one, two, chew." : "A small, steady habit."}</h2>
        </header>
        <ol className={styles.steps}>
          {p.howTo.map((step, i) => (
            <li key={step} className={styles.step} data-reveal>
              <span className={styles.stepNo}>{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.related}>
        <header className={styles.relatedHead} data-reveal>
          <h2 className={styles.sectionTitle}>Pairs well with</h2>
          <a href="/shop" className={styles.allLink}>
            Explore the collection <ArrowRight size={16} />
          </a>
        </header>
        <div className={styles.relatedGrid}>
          {related.map((o) => (
            <a
              key={o.id}
              href={`/shop/${o.id}`}
              className={`${styles.relCard} ${o.range === "kids" ? styles.relKids : styles.relAdults}`}
              style={{ ["--wash" as string]: o.wash, ["--deep" as string]: o.tintDeep }}
              data-reveal
            >
              <span className={styles.relStage}>
                <img src={packImage(o)} alt="" loading="lazy" draggable={false} />
              </span>
              <span className={styles.relRange}>{o.range === "kids" ? "Kids" : "Adults"}</span>
              <span className={styles.relName}>{o.title}</span>
              <span className={styles.relPrice}>{formatINR(o.price)}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

/* Gallery ------------------------------------------------------------- */

function Gallery({ p }: { p: CatalogProduct }) {
  const images = gallery(p);
  const [index, setIndex] = useState(0);
  const stageRef = useTilt<HTMLDivElement>({ max: 5, shift: 12 });
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const reduced = useReducedMotion();

  // Crossfade with a little scale settle — slower out than in.
  useEffect(() => {
    imgRefs.current.forEach((img, i) => {
      if (!img) return;
      const on = i === index;
      if (reduced) {
        gsap.set(img, { autoAlpha: on ? 1 : 0 });
        return;
      }
      gsap.to(img, {
        autoAlpha: on ? 1 : 0,
        scale: on ? 1 : 1.04,
        duration: on ? 0.9 : 0.6,
        ease: "power3.out",
        overwrite: true,
      });
    });
  }, [index, reduced]);

  const go = (d: number) => setIndex((i) => (i + d + images.length) % images.length);

  return (
    <div className={styles.gallery}>
      <div className={styles.thumbs} role="tablist" aria-label="Product images" data-in>
        {images.map((img, i) => (
          <button
            key={img.src}
            role="tab"
            aria-selected={i === index}
            aria-label={img.alt}
            className={`${styles.thumb} ${i === index ? styles.thumbOn : ""} ${img.kind === "cutout" ? styles.thumbCutout : ""}`}
            onClick={() => setIndex(i)}
          >
            <img src={img.src} alt="" loading="lazy" draggable={false} />
          </button>
        ))}
      </div>

      <div className={styles.stageWrap} data-stage>
      <div ref={stageRef} className={styles.stage}>
        {images.map((img, i) => (
          <img
            key={img.src}
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            src={img.src}
            alt={i === index ? img.alt : ""}
            aria-hidden={i !== index}
            className={img.kind === "cutout" ? styles.stageCutout : styles.stagePhoto}
            style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
            data-depth={img.kind === "cutout" ? 1 : 0.3}
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
          />
        ))}
        <div className={styles.stageNav}>
          <button type="button" aria-label="Previous image" onClick={() => go(-1)}>
            <ArrowLeft size={18} />
          </button>
          <span>
            {index + 1} / {images.length}
          </span>
          <button type="button" aria-label="Next image" onClick={() => go(1)}>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

/* Buy panel ------------------------------------------------------------ */

function BuyPanel({ p }: { p: CatalogProduct }) {
  const { add } = useCart();
  const [pack, setPack] = useState(1);
  const [subscribe, setSubscribe] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const kids = p.range === "kids";

  const unit = packPrice(p, pack, subscribe);
  const oneTime = packPrice(p, pack, false);
  const total = unit * qty;
  const fullPrice = (p.compareAt ?? p.price) * pack * qty;

  const addToBag = () => {
    add({ productId: p.id, packSize: pack, subscribe, quantity: qty });
    setAdded(true);
  };
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  // Mobile sticky bar shows once the main button has scrolled away.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.panel}>
      <div className={styles.panelInner}>
        <p className={styles.panelEyebrow} data-in>
          {kids ? `Kids · ${p.ageNote}` : "Adults · Daily ritual"}
        </p>
        <h1 className={styles.name} data-in>
          {p.title}
        </h1>
        <p className={styles.ratingRow} data-in>
          <span className={styles.stars} aria-label={`${p.rating} out of 5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={14} strokeWidth={0} fill={i < Math.round(p.rating) ? "currentColor" : "#ddd"} />
            ))}
          </span>
          {p.rating.toFixed(1)} · {p.reviewCount} reviews
        </p>
        <p className={styles.desc} data-in>
          {p.description}
        </p>

        <ul className={styles.benefits} data-in>
          {p.benefits.map((b) => (
            <li key={b}>
              <Check size={14} strokeWidth={2.4} />
              {b}
            </li>
          ))}
        </ul>

        <dl className={styles.facts} data-in>
          <div>
            <dt>Flavour</dt>
            <dd>{p.flavour}</dd>
          </div>
          <div>
            <dt>Pouch</dt>
            <dd>{p.count}</dd>
          </div>
          <div>
            <dt>Daily</dt>
            <dd>{p.howTo[0]}</dd>
          </div>
        </dl>

        <fieldset className={styles.group} data-in>
          <legend>Choose your pack</legend>
          <div className={styles.packs}>
            {PACKS.map((k) => {
              const price = packPrice(p, k.size, false);
              return (
                <label key={k.size} className={`${styles.pack} ${pack === k.size ? styles.on : ""}`}>
                  <input type="radio" name="pack" checked={pack === k.size} onChange={() => setPack(k.size)} />
                  {k.save > 0 && <span className={styles.packSave}>Save {Math.round(k.save * 100)}%</span>}
                  <span className={styles.packLabel}>{k.label}</span>
                  <span className={styles.packNote}>{k.note}</span>
                  <span className={styles.packPrice}>{formatINR(price)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className={styles.group} data-in>
          <legend>How often</legend>
          <label className={`${styles.mode} ${!subscribe ? styles.on : ""}`}>
            <input type="radio" name="mode" checked={!subscribe} onChange={() => setSubscribe(false)} />
            <span className={styles.radio} />
            <span className={styles.modeText}>
              <span className={styles.modeTitle}>One-time purchase</span>
            </span>
            <span className={styles.modePrice}>{formatINR(oneTime)}</span>
          </label>
          <label className={`${styles.mode} ${subscribe ? styles.on : ""}`}>
            <input type="radio" name="mode" checked={subscribe} onChange={() => setSubscribe(true)} />
            <span className={styles.radio} />
            <span className={styles.modeText}>
              <span className={styles.modeTitle}>
                Subscribe & save {Math.round(SUBSCRIBE_SAVE * 100)}%
                <RefreshCw size={13} />
              </span>
              <span className={styles.modeNote}>Delivered every {pack * 30} days · skip or cancel anytime</span>
            </span>
            <span className={styles.modePrice}>{formatINR(packPrice(p, pack, true))}</span>
          </label>
        </fieldset>

        <div className={styles.buyRow} data-in>
          <div className={styles.qty} aria-label="Quantity">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty === 1}>
              <Minus size={15} />
            </button>
            <span aria-live="polite">{qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(9, q + 1))}>
              <Plus size={15} />
            </button>
          </div>
          <button ref={buttonRef} type="button" className={`${styles.addBtn} ${added ? styles.addDone : ""}`} onClick={addToBag}>
            <span className={styles.addLabel}>{added ? "Added to bag" : "Add to bag"}</span>
            <span className={styles.addPrice}>
              {added ? <Check size={18} strokeWidth={2.6} /> : formatINR(total)}
            </span>
          </button>
        </div>
        {fullPrice > total && (
          <p className={styles.saving} data-in>
            You save {formatINR(fullPrice - total)} on this order
          </p>
        )}

        <ul className={styles.assurances} data-in>
          <li>
            <Truck size={17} strokeWidth={1.6} /> Free shipping over ₹999
          </li>
          <li>
            <ShieldCheck size={17} strokeWidth={1.6} /> Third-party tested
          </li>
          <li>
            <Leaf size={17} strokeWidth={1.6} /> No artificial colours
          </li>
        </ul>

        <div className={styles.accordions} data-in>
          <Accordion title="Key ingredients" defaultOpen>
            <ul className={styles.accList}>
              {p.keyIngredients.map((i) => (
                <li key={i.name}>
                  <strong>{i.name}</strong>
                  {i.note && ` — ${i.note}`}
                </li>
              ))}
            </ul>
          </Accordion>
          <Accordion title="How to use">
            <ul className={styles.accList}>
              {p.howTo.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Accordion>
          <Accordion title="Good to know">
            <ul className={styles.accList}>
              {p.goodToKnow.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Accordion>
          <Accordion title="Shipping & returns">
            <p>
              Dispatched within 24 hours. Free shipping on orders over ₹999, cash on delivery available. Unopened
              pouches can be returned within 15 days.
            </p>
          </Accordion>
        </div>
      </div>

      <div className={`${styles.stickyBar} ${barVisible ? styles.stickyOn : ""}`} aria-hidden={!barVisible}>
        <img src={packImage(p)} alt="" />
        <span className={styles.stickyText}>
          <span>{p.title}</span>
          <strong>{formatINR(total)}</strong>
        </span>
        <button type="button" onClick={addToBag} tabIndex={barVisible ? 0 : -1}>
          {added ? "Added" : "Add to bag"}
        </button>
      </div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    gsap.to(el, { height: open ? "auto" : 0, duration: 0.5, ease: "power3.inOut" });
  }, [open]);

  return (
    <div className={`${styles.acc} ${open ? styles.accOpen : ""}`}>
      <button type="button" className={styles.accHead} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {title}
        <ChevronDown size={18} />
      </button>
      <div ref={bodyRef} className={styles.accBody} style={{ height: defaultOpen ? "auto" : 0 }}>
        <div className={styles.accInner}>{children}</div>
      </div>
    </div>
  );
}
