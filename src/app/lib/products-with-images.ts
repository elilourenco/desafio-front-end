
"use client";
import productHero from '/product.jpg';

export const productImages = {
  hero: productHero,
};

// Alternative approach using Next.js Image with static imports
export const ProductAssets = {
  hero: {
    src: productHero,
    alt: 'Produto em destaque',
    width: 1200,
    height: 600,
  },
} as const;

// For multiple product images
export const productGallery = [
  {
    id: 1,
    src: productHero,
    alt: 'Vista frontal do produto',
    width: 800,
    height: 600,
  },
  // Add more images as needed
] as const;

// Types for better TypeScript support
export type ProductImage = {
  src: any; // Using any for static imports compatibility
  alt: string;
  width?: number;
  height?: number;
};

export type ProductGallery = Array<ProductImage & { id: number }>;

// Utility function to generate image props for Next.js Image component
export const getImageProps = (image: ProductImage) => ({
  src: image.src,
  alt: image.alt,
  width: image.width,
  height: image.height,
});

// Hook for managing product images (if needed)
export const useProductImages = () => {
  const images = {
    hero: ProductAssets.hero,
    gallery: productGallery,
  };

  return {
    images,
    getImageProps,
  };
};