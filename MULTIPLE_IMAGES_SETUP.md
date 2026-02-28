# Multiple Product Images Setup

This guide explains how to enable multiple product image uploads in your Foodistics application.

## Database Setup

You need to create a `product_images` table in your Supabase database. Execute the following SQL:

```sql
-- Create product_images table
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, display_order)
);

-- Create indexes for faster queries
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_display_order ON product_images(product_id, display_order);

-- Enable RLS (Row Level Security)
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create policies for product_images table
-- Allow authenticated users to insert images
CREATE POLICY "Allow authenticated users to insert product images"
ON product_images FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update images
CREATE POLICY "Allow authenticated users to update product images"
ON product_images FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated users to delete product images"
ON product_images FOR DELETE
USING (auth.role() = 'authenticated');

-- Allow public to view images
CREATE POLICY "Allow public to view product images"
ON product_images FOR SELECT
USING (true);
```

## Features Added

### 1. Multi-Image Upload Component (`MultiImageUpload.tsx`)
- Upload up to 6 images per product
- Drag-and-drop reordering
- Real-time preview
- Progress indicators
- Image deletion capability

### 2. Product Images Hook (`useProductImages.ts`)
- `useProductImages()` - Fetch all images for a product
- `useAddProductImage()` - Add new image to product
- `useUpdateProductImageOrder()` - Reorder images
- `useDeleteProductImage()` - Remove image

### 3. Enhanced Product Form
- Toggle between single and multiple image modes
- Checkbox to enable "Add multiple images"
- First image automatically becomes thumbnail
- Backward compatible with existing single-image setup

## Usage

### In the Admin Panel

1. Navigate to **Products** tab
2. Click **Add Product** or edit an existing product
3. Check **"Add multiple images"** to upload multiple images
4. Click the upload area to select images (or drag & drop)
5. Drag images to reorder (first image = thumbnail)
6. Click **Upload Images** button
7. Fill in other product details
8. Click **Create/Update Product**

### Display Images in Product View

To show multiple images in the product modal or carousel, update your display components:

```typescript
// In ProductModal.tsx or wherever you display product images
import { useProductImages } from '@/hooks/useProductImages';

export const ProductModal = ({ product }: Props) => {
  const { data: images = [] } = useProductImages(product.id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const displayImages = images.length > 0 ? images : [{ image_url: product.image_url }];
  const selectedImage = displayImages[selectedImageIndex];

  return (
    <div>
      {/* Main image display */}
      <img src={selectedImage.image_url} alt={product.name} />
      
      {/* Thumbnail carousel */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 mt-4">
          {displayImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedImageIndex(idx)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                idx === selectedImageIndex ? 'border-tea-gold' : 'border-gray-200'
              }`}
            >
              <img src={img.image_url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

## API Endpoints

### Fetch Product Images
```typescript
const { data: images } = useProductImages(productId);
```

### Add Product Image
```typescript
await addProductImage.mutateAsync({
  productId: 'product-uuid',
  imageUrl: 'https://...',
  displayOrder: 0
});
```

### Update Image Order
```typescript
await updateProductImageOrder.mutateAsync([
  { id: '...', product_id: '...', image_url: '...', display_order: 0 },
  { id: '...', product_id: '...', image_url: '...', display_order: 1 }
]);
```

### Delete Product Image
```typescript
await deleteProductImage.mutateAsync(imageId);
```

## File Structure

```
src/
├── components/
│   ├── MultiImageUpload.tsx (NEW)
│   ├── ImageUpload.tsx (existing single upload)
│   └── admin/
│       └── ProductForm.tsx (UPDATED)
├── hooks/
│   ├── useProductImages.ts (NEW)
│   └── useProducts.ts (existing)
├── lib/
│   └── supabase.ts (UPDATED - added ProductImage type)
```

## Backward Compatibility

- Existing products with single images continue to work
- The `image_url` field in products table remains the thumbnail
- Multiple images are stored separately in `product_images` table
- Both upload modes can be used simultaneously

## Performance Considerations

- Images are ordered by `display_order` for consistent display
- Database queries are indexed on `product_id` and `display_order`
- Images are cached for 1 hour in Supabase Storage
- Maximum 6 images per product to prevent performance issues

## Troubleshooting

### "Bucket not found" error
- Ensure `product-images` storage bucket exists in Supabase
- Bucket must be set to Public visibility
- See STORAGE_BUCKET_SETUP.md for complete storage configuration

### Images not showing
- Check that image URLs are correct in database
- Verify storage bucket permissions allow public read
- Check browser console for CORS errors

### Upload fails
- Maximum file size: 5MB per image
- Allowed formats: JPEG, PNG, WebP, GIF
- Check storage bucket has space available

## Next Steps

1. Run the SQL script in Supabase dashboard
2. Verify `product_images` table was created
3. Test uploading multiple images from admin panel
4. Update your product display components to show all images
5. Deploy changes to production

For more details, see `STORAGE_BUCKET_SETUP.md` for storage configuration.
