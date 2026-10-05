/**
 * The "critical path" image set the app loader blocks on before first
 * paint — deliberately NOT the whole site. The two scroll-synced frame
 * sequences (Hero: 480 frames/~310MB, WhyGummyRituals benefits: 240
 * frames/~205MB) already have their own lazy/idle-load mechanisms (see
 * Hero/FrameSequence.ts's preloadRemaining and animations/benefitsScroll.ts)
 * and must stay untouched — adding them here would turn a few-second
 * loader into a multi-minute one.
 *
 * This list is built by reusing each section's own existing image
 * resolver/import rather than re-globbing, so there is exactly one source
 * of truth per image.
 */

import { getProductImage, STAND_IMAGE_FILENAME } from "../components/FeaturedCollection/productImages";
import { getIngredientImage } from "../components/Ingredients/ingredientImages";
import { products } from "./products";
import { ingredientsContent } from "./ingredientsContent";

// Our Gummies (section 02) — direct imports, same files OurGummies.tsx
// already imports; Vite dedupes identical asset imports to the same URL,
// so this costs nothing extra and leaves that component untouched.
import ourGummiesSectionImage from "../assets/homepage/02-our-gummies/images/home-page-second-section.png";
import leafFeature from "../assets/homepage/02-our-gummies/images/leaf-feature-img.png";
import strawberryFeature from "../assets/homepage/02-our-gummies/images/strawberry-feature-img.png";
import bearFeature from "../assets/homepage/02-our-gummies/images/orange-bear-feature-img.png";
import sunFeature from "../assets/homepage/02-our-gummies/images/sun-feature-img.png";

// Daily Routine (section 05)
import dailyRoutineBackground from "../assets/homepage/05-daily-routine/images/Day to Night Gummy Dreamscape bg image.png";

// Taste & Texture (section 06)
import tasteTextureBackground from "../assets/homepage/06-taste-texture/images/bg-image.png";
import textureImage from "../assets/homepage/06-taste-texture/images/texture-bear-image.png";
import chewyBiteImage from "../assets/homepage/06-taste-texture/images/chewy-bite-image.png";
import shapeImage from "../assets/homepage/06-taste-texture/images/shape-bear-image.png";
import ingredientsBearImage from "../assets/homepage/06-taste-texture/images/ingredients-bear-image.png";

// Footer
import footerBackground from "../assets/footer/footer-background-image.png";

const featuredCollectionImages = [
  STAND_IMAGE_FILENAME,
  ...products.map((product) => product.image),
]
  .map((filename) => getProductImage(filename))
  .filter((url): url is string => Boolean(url));

const ingredientImages = ingredientsContent.ingredients
  .flatMap((ingredient) => [ingredient.background, ingredient.icon])
  .map((filename) => getIngredientImage(filename))
  .filter((url): url is string => Boolean(url));

export const criticalPreloadImages: string[] = [
  ...featuredCollectionImages,
  ourGummiesSectionImage,
  leafFeature,
  strawberryFeature,
  bearFeature,
  sunFeature,
  ...ingredientImages,
  dailyRoutineBackground,
  tasteTextureBackground,
  textureImage,
  chewyBiteImage,
  shapeImage,
  ingredientsBearImage,
  footerBackground,
];
