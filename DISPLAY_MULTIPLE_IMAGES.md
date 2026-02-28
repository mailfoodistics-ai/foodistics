# Display Multiple Product Images - Implementation Guide

After uploading multiple images, you need to update your product display components to show them. This guide shows how.

## Quick Implementation

### Step 1: Update ProductModal Component

Create or update `src/components/ProductModal.tsx`:

```typescript
import { useState } from 'react';
import { useProductImages } from '@/hooks/useProductImages';
import { Product } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onCheckoutOpen?: () => void;
}

export const ProductModal = ({
  product,
  isOpen,
  onClose,
  onCheckoutOpen,
}: ProductModalProps) => {
  const { data: productImages = [] } = useProductImages(product.id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Use all images if available, otherwise use single image_url
  const images = productImages.length > 0
    ? productImages.map((img) => img.image_url)
    : [product.image_url];

  const currentImage = images[selectedImageIndex];

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Image Section */}
        <div className="relative bg-gray-100">
          <img
            src={currentImage}
            alt={product.name}
            className="w-full aspect-square object-cover"
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePreviousImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
              >
                <ChevronRight size={24} />
              </button>

              {/* Image Counter */}
              <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1}/{images.length}
              </div>
            </>
          )}

          {/* Thumbnail Carousel */}
          {images.length > 1 && (
            <div className="p-3 bg-gray-50 border-t flex gap-2 overflow-x-auto">
              {images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === selectedImageIndex
                      ? 'border-tea-gold'
                      : 'border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
              {product.name}
            </h2>
            {product.description && (
              <p className="text-sm text-gray-600 mt-2">{product.description}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            {product.sale_price ? (
              <>
                <span className="text-2xl font-bold text-tea-gold">
                  ₹{product.sale_price.toFixed(2)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
                  {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-tea-gold">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600 font-semibold">✓ In Stock</span>
            ) : (
              <span className="text-red-600 font-semibold">✗ Out of Stock</span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={onCheckoutOpen}
            disabled={product.stock <= 0}
            className="w-full bg-tea-gold hover:bg-tea-gold/90 text-white font-bold py-3 rounded-lg disabled:opacity-50"
          >
            Add to Cart
          </Button>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### Step 2: Update ProductCarousel Component

If you want to show multiple images in carousels, update `src/components/ProductCarousel.tsx`:

```typescript
// Add this at the top with other imports
import { useProductImages } from '@/hooks/useProductImages';

// In the ProductCard rendering section:
{products.map((product) => (
  <div key={product.id} className="flex-shrink-0 w-32 sm:w-40 md:w-44">
    {/* Use ProductImageGallery component instead of simple img */}
    <ProductImageGallery product={product} />
  </div>
))}

// Add this new component or create separate file
interface ProductImageGalleryProps {
  product: Product;
}

const ProductImageGallery = ({ product }: ProductImageGalleryProps) => {
  const { data: productImages = [] } = useProductImages(product.id);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(0);

  const images = productImages.length > 0
    ? productImages.map((img) => img.image_url)
    : [product.image_url];

  const currentImage = images[hoveredImageIndex];

  return (
    <div className="relative">
      <img
        src={currentImage}
        alt={product.name}
        className="w-full aspect-square object-cover rounded-lg"
      />
      
      {/* Show thumbnails on hover if multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-white/90 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHoveredImageIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === hoveredImageIndex
                  ? 'bg-tea-gold'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

### Step 3: Update Category Page (src/pages/Category.tsx)

Add image gallery support:

```typescript
import { useProductImages } from '@/hooks/useProductImages';

// In the product card rendering:
{products.map((product) => (
  <div key={product.id} className="group">
    <ProductImageCarousel product={product} />
    {/* ... rest of product card */}
  </div>
))}

// Helper component
const ProductImageCarousel = ({ product }: { product: Product }) => {
  const { data: productImages = [] } = useProductImages(product.id);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const images = productImages.length > 0
    ? productImages.map((img) => img.image_url)
    : [product.image_url];

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
      <img
        src={images[selectedIdx]}
        alt={product.name}
        className="w-full h-full object-cover"
      />
      
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === selectedIdx ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

## Integration Checklist

- [ ] Update ProductModal to show image gallery with navigation
- [ ] Update ProductCarousel to show product images
- [ ] Update Category page product cards
- [ ] Test image switching on desktop
- [ ] Test image switching on mobile
- [ ] Test navigation arrows work
- [ ] Verify thumbnail carousel displays correctly
- [ ] Test with products having 1 image
- [ ] Test with products having multiple images
- [ ] Deploy to production

## Features to Add (Optional)

### Keyboard Navigation
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePreviousImage();
    if (e.key === 'ArrowRight') handleNextImage();
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### Touch Swipe Support
```typescript
const [touchStart, setTouchStart] = useState(0);

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStart(e.touches[0].clientX);
};

const handleTouchEnd = (e: React.TouchEvent) => {
  const touchEnd = e.changedTouches[0].clientX;
  if (touchStart - touchEnd > 50) handleNextImage();
  if (touchEnd - touchStart > 50) handlePreviousImage();
};
```

### Lazy Loading
```typescript
const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

useEffect(() => {
  const img = new Image();
  img.onload = () => {
    setLoadedImages((prev) => new Set([...prev, selectedImageIndex]));
  };
  img.src = images[selectedImageIndex];
}, [selectedImageIndex]);
```

## Styling Tips

### Mobile-First Design
```typescript
className={`
  w-full aspect-square object-cover
  sm:rounded-lg md:rounded-xl
  sm:border-2 sm:border-gray-200
`}
```

### Dark Mode Support
```typescript
className={`
  bg-gray-100 dark:bg-gray-800
  border-gray-300 dark:border-gray-600
`}
```

### Animation Effects
```typescript
className="transition-opacity duration-200 group-hover:opacity-100"
```

## Performance Optimization

1. **Lazy load images** - Only load visible images
2. **Compress images** - Keep them under 500KB
3. **Use next-gen formats** - WebP with JPEG fallback
4. **Debounce image switching** - Prevent rapid requests
5. **Cache images** - Use browser cache headers

## Testing Checklist

```typescript
// Test cases to cover
1. Single image product - should work as before
2. Multiple images - should show carousel
3. Image switching - arrows and thumbnails
4. Mobile view - responsive layout
5. Loading state - spinner while loading
6. Error state - fallback to placeholder
7. Keyboard navigation - arrow keys work
8. Touch gestures - swipe to change image
9. Performance - images load smoothly
10. Accessibility - proper alt text
```

---

**Next Steps:**
1. Choose which components to update
2. Copy the code examples
3. Test locally
4. Deploy to production
5. Monitor for errors

Need help? Check `QUICK_START_MULTIPLE_IMAGES.md` for setup instructions.
