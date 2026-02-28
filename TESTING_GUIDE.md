# Foodistics - Multi-Image & Admin Panel Testing Guide

## Database Setup (Already Done)
- ✅ `product_images` table created
- ✅ RLS policies configured
- ✅ Foreign key constraints set up

## Testing Multi-Image Upload Feature

### Step 1: Add a Product with Multiple Images
1. Go to **Admin Dashboard** → **Products**
2. Click **Add Product** button
3. Fill in product details:
   - Name: "Premium Assam Tea" (or any name)
   - Category: Select a category
   - Price: 499
   - Stock: 100
   - Description: "Premium quality Assam tea"

4. **Check "Add multiple images"** checkbox
5. Upload 2-3 tea images using drag-and-drop:
   - Images will show with numbered badges (1, 2, 3)
   - You can reorder by dragging
   - Remove individual images by clicking X button
6. Click **Create Product**
7. Should see: "Product created successfully"

### Step 2: View Product with Multiple Images
1. Go to **Home** or **Shop** page
2. Click on the product card you just created
3. ProductModal should open showing:
   - ✅ Main image with full size display
   - ✅ Navigation arrows (← →) if multiple images
   - ✅ Image counter (1/3, 2/3, 3/3)
   - ✅ Thumbnail carousel at bottom
   - ✅ Click thumbnails to jump to that image
   - ✅ Click arrows to navigate

### Step 3: Edit Product Images
1. Go to **Admin Dashboard** → **Products**
2. Find your product, click **Edit**
3. The form should pre-fill with:
   - ✅ Product details
   - ✅ All existing images in MultiImageUpload component
   - ✅ Checkboxes to remove individual images
4. Add/remove images as needed
5. Click **Update Product**
6. Should see: "Product updated successfully"

### Step 4: Delete Product
1. Go to **Admin Dashboard** → **Products**
2. Find your product
3. Click **Delete** button
4. Confirm deletion dialog appears
5. Click **Delete** to confirm
6. Should see: "Product deleted successfully"
7. ✅ Product removed from table
8. ✅ All product images deleted from database

## Bug Fixes Applied

### ✅ Admin Panel Fixes
1. **Edit Dialog State Management**
   - Fixed race condition with `editingProductId` tracking
   - Edit dialog now properly opens/closes
   - Correct product loads in edit form

2. **Delete Functionality**
   - Delete queries now include proper error handling
   - RLS policies updated to allow authenticated DELETE
   - Cascade deletion removes product_images first
   - No more 409 Conflict errors

3. **Form Null Values**
   - All form fields initialize with empty strings
   - Input warnings fixed
   - sale_price field properly coerced with `value={field.value ?? ''}`

### ✅ Product Modal Fixes
1. **Multi-Image Display**
   - Fetches all images from product_images table
   - Shows image counter with total count
   - Navigation arrows for multi-image navigation
   - Thumbnail carousel for quick jumps
   - Fallback to single image if no product_images

2. **Error Handling**
   - Image loading state indicator
   - Fallback to placeholder.svg if image fails to load
   - Validates image index bounds

## Expected Behavior

### Single Image Products
- Product card shows single image
- ProductModal shows single image without navigation
- No arrows or counter visible

### Multi-Image Products
- Product card shows first image
- ProductModal shows full gallery:
  - Main image (large)
  - ← → arrows for navigation
  - "1/3" counter in top-right
  - Thumbnail strip at bottom
  - Click thumbnail to jump to that image
  - Arrows cycle through all images

### Admin Edit/Delete
- Edit button: Opens form pre-filled with product data
- Delete button: Shows confirmation dialog
- Both buttons work without errors
- Form closes after successful update

## Troubleshooting

If images don't show:
1. Check browser console (F12) for errors
2. Verify `product_images` table exists in Supabase
3. Check RLS policies are correct (run SUPABASE_FIX_RLS_POLICIES.sql)
4. Ensure images were saved to `product-images` storage bucket

If delete fails:
1. Check error message in toast notification
2. Verify RLS DELETE policy is enabled
3. Run SUPABASE_FIX_RLS_POLICIES.sql again

If edit dialog won't open:
1. Clear browser cache
2. Hard refresh page (Ctrl+Shift+R)
3. Check no console errors (F12)
