# Multiple Images Debugging Guide

## Issue: Multiple images not showing in ProductModal

### Step 1: Check Browser Console
When you open a product with multiple images, you should see these logs:
```
Product ID: [product-uuid]
Product Images from DB: [array of image objects]
Valid Images: [array of URLs]
All Images: [array of URLs]
```

If `Product Images from DB` is empty `[]`, it means:
- Images are NOT being saved to the `product_images` table
- Or the product ID is not being passed correctly

### Step 2: Verify Images Were Uploaded to Storage

1. Go to **Supabase Dashboard** → **Storage** → **product-images** bucket
2. Check if image files are there
3. If not → Images never uploaded to storage (issue in MultiImageUpload)

### Step 3: Verify Images Were Saved to Database

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query:
```sql
SELECT * FROM product_images WHERE product_id = '[PRODUCT_ID]' ORDER BY display_order;
```

Replace `[PRODUCT_ID]` with an actual product ID that should have multiple images.

If this returns no results → Images not being inserted into product_images table

### Step 4: Test Complete Flow

1. **Add Product:**
   - Fill in name, category, price, stock
   - Select 3 images
   - **Click "Upload Images" button** ← IMPORTANT
   - Click "Create Product"

2. **Check if images are saved:**
   - Inspect browser console (F12 → Console) when modal opens
   - Look for the logs showing image data

3. **If images show in console but not on screen:**
   - Check if ProductModal is rendering correctly
   - Images are there but UI not displaying them

4. **If images don't show in console:**
   - Images never saved to database
   - Check ProductForm onSubmit logic
   - Verify useAddProductImage hook is being called

## Expected Behavior After Fix

### ProductModal Image Display
✅ Main image (large)
✅ Navigation arrows (← →) if 2+ images
✅ Image counter (1/3, 2/3, etc.)
✅ Thumbnail carousel with quick jump
✅ Bestseller badge (gold) with star icon
✅ Discount badge (red) if sale_price set
✅ Badges should NOT overlap

### ProductForm Upload
✅ Select multiple images
✅ Images appear in grid with # badges (1, 2, 3)
✅ "Upload Images" button appears
✅ Click to upload to storage bucket
✅ Proceed to create product
✅ Images saved with display_order

## Common Issues & Solutions

### Issue: "Upload Images" button not showing
- **Solution:** Add more images to the form. Button only shows when new images are selected.

### Issue: Images upload but don't show in modal
- **Cause:** Query not fetching from product_images table
- **Solution:** Check useProductImages hook is enabled (has productId)

### Issue: Only first image shows
- **Cause:** allImages array only has one item
- **Solution:** Check product_images table has all rows with correct product_id

### Issue: Wrong product ID
- **Cause:** product.id not being passed to useProductImages
- **Solution:** Verify product object has id property in ProductModal

## Verified Working Code

### useProductImages hook
```typescript
export const useProductImages = (productId: string) => {
  return useQuery({
    queryKey: ['productImages', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data as ProductImage[]) || [];
    },
    enabled: !!productId,  // Only run if productId exists
  });
};
```

### ProductModal image fetching
```typescript
const { data: productImages = [] } = useProductImages(product?.id || '');

const validImages = productImages
  .filter((img: any) => img && img.image_url)
  .map((img: any) => img.image_url);

const allImages = validImages.length > 0 
  ? validImages
  : (product?.image_url ? [product.image_url] : ['placeholder.svg']);
```

## Next Steps if Images Still Not Showing

1. Check browser Network tab (F12 → Network):
   - Look for `/product_images` API calls
   - Verify responses have correct data

2. Check Supabase logs:
   - Supabase Dashboard → Logs
   - Look for product_images SELECT queries
   - Check for any permission/RLS errors

3. Verify product_images table structure:
   ```sql
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'product_images';
   ```

Should show:
- id (UUID)
- product_id (UUID)
- image_url (TEXT)
- display_order (INTEGER)
- created_at (TIMESTAMP)
