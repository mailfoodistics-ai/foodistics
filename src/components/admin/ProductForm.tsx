import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCategories, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useProductImages, useAddProductImage, useDeleteProductImage } from '@/hooks/useProductImages';
import { Product } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { MultiImageUpload } from '@/components/MultiImageUpload';
import { uploadProductImage, deleteProductImage } from '@/lib/imageUpload';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect, useCallback } from 'react';

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  category_id: z.string().min(1, 'Please select a category'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  sale_price: z.coerce.number().optional(),
  weight: z.coerce.number().min(0, 'Weight must be 0 or greater').optional(),
  weight_unit: z.enum(['g', 'kg']).optional().default('g'),
  image_url: z.string().optional(),
  stock: z.coerce.number().min(0, 'Stock must be 0 or greater'),
  is_bestseller: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

export const ProductForm = ({ product, onSuccess }: ProductFormProps) => {
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const addProductImage = useAddProductImage();
  const deleteProductImageMutation = useDeleteProductImage();
  const { data: existingImages = [] } = useProductImages(product?.id || '');
  const { toast } = useToast();
  
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [originalImageIds, setOriginalImageIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (product?.id) {
      const imgs = existingImages.map((img: any) => ({
        id: img.id,
        url: img.image_url,
        isNew: false,
      }));
      setUploadedImages(imgs);
      setOriginalImageIds(new Set(imgs.map((img) => img.id)));
    }
  }, [existingImages, product?.id]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product 
      ? {
          name: product.name || '',
          category_id: product.category_id || '',
          description: product.description || '',
          price: product.price || 0,
          sale_price: product.sale_price || undefined,
          weight: product.weight || undefined,
          weight_unit: product.weight_unit || 'g',
          image_url: product.image_url || '',
          stock: product.stock || 0,
          is_bestseller: product.is_bestseller || false,
        }
      : {
          name: '',
          category_id: '',
          description: '',
          price: 0,
          sale_price: undefined,
          weight: undefined,
          weight_unit: 'g',
          image_url: '',
          stock: 0,
          is_bestseller: false,
        },
  });

  // Wrapped callback to prevent flushSync warning
  const handleImagesUpload = useCallback((images: any[]) => {
    setUploadedImages(images);
    // Set the first image as thumbnail
    if (images.length > 0) {
      form.setValue('image_url', images[0].url);
    }
  }, [form]);

  async function onSubmit(values: ProductFormValues) {
    try {
      console.log('=== FORM SUBMIT START ===');
      console.log('Uploaded Images:', uploadedImages);
      console.log('Form Values:', values);
      
      // If updating, detect and delete removed images
      if (product) {
        const currentImageIds = new Set(uploadedImages.map((img) => img.id));
        const removedImageIds = Array.from(originalImageIds).filter((id) => !currentImageIds.has(id));
        
        console.log('Original Image IDs:', originalImageIds);
        console.log('Current Image IDs:', currentImageIds);
        console.log('Removed Image IDs:', removedImageIds);
        
        // Delete removed images from storage and DB
        for (const removedId of removedImageIds) {
          try {
            // Find the image URL from the current state before it was removed
            const existingImg = existingImages.find((img: any) => img.id === removedId);
            if (existingImg) {
              console.log('Deleting image from storage:', existingImg.image_url);
              await deleteProductImage(existingImg.image_url);
              console.log('Image deleted from storage successfully');
            }
            
            // Delete from database
            console.log('Deleting image record from DB:', removedId);
            await deleteProductImageMutation.mutateAsync(removedId);
            console.log('Image record deleted from DB successfully');
          } catch (err) {
            console.error('Error deleting image:', err);
            toast({
              title: 'Warning',
              description: 'Some images could not be deleted from storage',
              variant: 'destructive',
            });
          }
        }
      }
      
      // If there are new images (selected but not uploaded), upload them now
      const imagesCopy = [...uploadedImages];
      let hasUploadedImages = false;
      
      for (let i = 0; i < imagesCopy.length; i++) {
        const img = imagesCopy[i];
        if (img?.isNew && img.file) {
          try {
            const url = await uploadProductImage(img.file as File, values.name || 'product');
            imagesCopy[i] = { ...img, url, isNew: false };
            hasUploadedImages = true;
            console.log('Uploaded new image:', url);
          } catch (err) {
            console.error('Failed to upload image during submit:', err);
            toast({ title: 'Error', description: (err as Error).message || 'Image upload failed', variant: 'destructive' });
            return;
          }
        } else if (!img?.isNew && img?.url && !img.url.startsWith('data:')) {
          // Existing image from DB
          hasUploadedImages = true;
        }
      }

      // update state with uploaded urls
      if (imagesCopy.length > 0) setUploadedImages(imagesCopy);

      // Use first actual uploaded image URL (after upload), otherwise fall back to tea-leaf placeholder
      // Only consider URLs that are actual storage URLs (not data URLs)
      const uploadedImageUrl = imagesCopy.find((img) => img.url && !img.url.startsWith('data:'))?.url;
      const thumbnailUrl = uploadedImageUrl || '/tea-leaf.svg';
      console.log('Image Copy:', imagesCopy);
      console.log('Has Uploaded Images:', hasUploadedImages);
      console.log('Uploaded Image URL:', uploadedImageUrl);
      console.log('Thumbnail URL:', thumbnailUrl);
      
      if (product) {
        console.log('=== UPDATING PRODUCT ===');
        await updateProduct.mutateAsync({
          ...product,
          ...values,
          image_url: thumbnailUrl,
        });
        
        // Add any new images to the product
        if (uploadedImages.some((img: any) => img.isNew)) {
          console.log('Updating product with new images:', uploadedImages);
          for (let i = 0; i < uploadedImages.length; i++) {
            const img = uploadedImages[i];
            if (img.isNew) {
              console.log(`Adding image ${i}:`, img.url);
              await addProductImage.mutateAsync({
                productId: product.id,
                imageUrl: img.url,
                displayOrder: i,
              });
            }
          }
        }
        
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        console.log('=== CREATING NEW PRODUCT ===');
        const newProduct = await createProduct.mutateAsync({
          ...values,
          image_url: thumbnailUrl,
        } as any);
        
        console.log('New Product Created:', newProduct.id);
        
        // Add ALL uploaded images to newly created product
        if (uploadedImages.length > 0) {
          console.log('Adding images to new product:', newProduct.id);
          console.log('Total images to add:', uploadedImages.length);
          
          for (let i = 0; i < uploadedImages.length; i++) {
            const img = uploadedImages[i];
            console.log(`Adding image ${i}:`, img.url);
            try {
              const result = await addProductImage.mutateAsync({
                productId: newProduct.id,
                imageUrl: img.url,
                displayOrder: i,
              });
              console.log(`Image ${i} added successfully:`, result);
            } catch (err) {
              console.error(`Failed to add image ${i}:`, err);
            }
          }
        } else {
          console.log('No images to add');
        }
        
        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
      }
      
      form.reset();
      setUploadedImages([]);
      console.log('=== FORM SUBMIT END ===');
      onSuccess?.();
    } catch (error) {
      console.error('Product submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Product Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Assam Black Tea" 
                  className="rounded-lg border-gray-200"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-lg border-gray-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-lg">
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Product description..."
                  className="resize-none rounded-lg border-gray-200 min-h-[60px]"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price & Sale Price & Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Price (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="rounded-lg border-gray-200"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sale_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Sale Price (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="rounded-lg border-gray-200"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription className="text-xs mt-1">Leave empty if not on sale</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Weight & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Weight</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 250"
                    className="rounded-lg border-gray-200"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-lg border-gray-200">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Upload */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Product Images</FormLabel>
              <FormControl>
                <div className="rounded-lg border border-gray-200 p-3">
                  <MultiImageUpload
                    onImagesUpload={handleImagesUpload}
                    currentImages={uploadedImages}
                    disabled={createProduct.isPending || updateProduct.isPending}
                    maxImages={6}
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs">
                Upload up to 6 images. The first image will be used as the thumbnail.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stock */}
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Stock Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="rounded-lg border-gray-200"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bestseller */}
        <FormField
          control={form.control}
          name="is_bestseller"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium">Mark as Bestseller</FormLabel>
                <FormDescription className="text-xs">Show this product as a bestseller on the product page</FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-tea-gold hover:bg-tea-gold/90 text-white font-semibold rounded-lg py-2 transition-colors text-sm"
          disabled={createProduct.isPending || updateProduct.isPending}
        >
          {createProduct.isPending || updateProduct.isPending ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              {product ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            product ? 'Update Product' : 'Create Product'
          )}
        </Button>
      </form>
    </Form>
  );
};
