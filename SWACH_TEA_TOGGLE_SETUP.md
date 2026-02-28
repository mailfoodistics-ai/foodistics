# Swach Tea Toggle & Image Display Fix - Implementation Guide

## What Was Added

### 1. **Swach Tea Partnership Toggle** 
A feature toggle in the Admin Dashboard to enable/disable all Swach Tea branding on the website.

### 2. **Fixed Product Image Display**
When editing a product, saved product images now display properly as thumbnails.

---

## Installation Steps

### Step 1: Run SQL Migration in Supabase

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire content from `SUPABASE_APP_SETTINGS.sql` file in your project root
5. Paste it into the SQL editor
6. Click **Run**

This creates:
- `app_settings` table for storing feature toggles
- Default setting: `swach_tea_enabled = true`
- RLS policies for security

### Step 2: No Additional Code Required

The implementation is automatically integrated:
- Settings tab appears in Admin Dashboard
- Image display works automatically in product edit forms
- Swach Tea hook available for use throughout the app

---

## How to Use

### Admin Panel Settings Tab

1. Go to **Admin Dashboard** → **Settings tab**
2. Toggle **"Swach Tea Partnership"** on/off
3. When **ON**: All Swach Tea branding shows on the website
4. When **OFF**: All Swach Tea text and references are hidden

### What the Toggle Controls

When the toggle is **ON**:
- ✅ Logo shows: "FOODISTICS × Swach Tea"
- ✅ About section mentions partnership
- ✅ Website title: "FOODISTICS × Swach Tea | Premium Tea Leaves"
- ✅ Footer copyright includes partnership
- ✅ All internal Swach Tea references visible

When the toggle is **OFF**:
- ❌ Logo shows: "FOODISTICS" only
- ❌ About section generic (no partnership mention)
- ❌ Website title: "FOODISTICS | Premium Tea Leaves"
- ❌ Footer copyright without partnership
- ❌ All Swach Tea references hidden

---

## Product Image Fix

### What Was Fixed

Previously when editing a product:
- ❌ Existing product images didn't show in the upload area
- ❌ Confusing to see which images were already uploaded
- ❌ Had to delete and re-upload images

Now when editing a product:
- ✅ All existing product images display as thumbnails immediately
- ✅ Can reorder them by dragging
- ✅ Can remove individual images
- ✅ Can add new images alongside existing ones
- ✅ Clear visual indication of which images are saved vs. new

### How It Works

1. Open Admin → Products → Click edit on a product
2. Scroll to "Product Images" section
3. All previously uploaded images now appear as thumbnail previews
4. You can:
   - **Drag to reorder** images
   - **Hover and click X** to remove an image
   - **Drag new files** or click upload area to add more images

---

## Implementation Details

### Files Created/Modified

**New Files:**
- `src/hooks/useSettings.ts` - Hook to manage app settings
- `src/hooks/useSwachTea.ts` - Hook to check if Swach Tea is enabled
- `src/components/admin/SettingsPanel.tsx` - Settings UI component
- `SUPABASE_APP_SETTINGS.sql` - Database migration

**Modified Files:**
- `src/pages/Admin.tsx` - Added Settings tab
- `src/components/MultiImageUpload.tsx` - Fixed image display on edit

### Database Schema

```sql
CREATE TABLE app_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,           -- 'swach_tea_enabled'
  value JSONB NOT NULL,               -- true/false
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Using the Swach Tea Hook in Components

If you want to conditionally render content based on the Swach Tea toggle:

```tsx
import { useSwachTea } from '@/hooks/useSwachTea';

export function MyComponent() {
  const { isSwachTeaEnabled, isLoading } = useSwachTea();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isSwachTeaEnabled && (
        <p>Proud partners with Swach Tea</p>
      )}
      {!isSwachTeaEnabled && (
        <p>Premium tea collection</p>
      )}
    </div>
  );
}
```

---

## Components to Update (Future)

To fully implement the toggle throughout the site, these components should use the `useSwachTea()` hook:

1. **Navbar.tsx** - Logo text
2. **AboutSection.tsx** - Partnership mentions
3. **Footer.tsx** - Copyright and branding
4. **WhySection.tsx** - Partnership references
5. **CTA buttons and meta tags** - Dynamic titles

Example update:
```tsx
// In Navbar.tsx
import { useSwachTea } from '@/hooks/useSwachTea';

export function Navbar() {
  const { isSwachTeaEnabled } = useSwachTea();
  
  return (
    <div className="logo">
      FOODISTICS {isSwachTeaEnabled && <span>× Swach Tea</span>}
    </div>
  );
}
```

---

## Troubleshooting

### Settings Not Saving
- Check that `admin_users` table exists (from previous admin setup)
- Verify you're logged in as an admin user
- Check browser console for errors

### Images Not Showing on Edit
- Ensure `product_images` table has records
- Images should have non-empty `image_url` field
- Check that URLs are accessible (not 404)

### SQL Migration Failed
- Make sure table doesn't already exist
- Check Supabase permissions
- Try running commands one at a time

---

## Next Steps

1. ✅ Run the SQL migration
2. ✅ Test the Settings tab in Admin Dashboard
3. ✅ Test toggling Swach Tea on/off
4. ✅ Edit a product to verify images show
5. ⏳ (Optional) Update components to use `useSwachTea()` hook
6. ⏳ (Optional) Test with toggle OFF to verify content disappears

---

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify SQL migration ran successfully
3. Ensure all table names and column names are correct
4. Check Supabase RLS policies are enabled
