import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ProductImage } from '@/lib/supabase';

export const useProductImages = (productId: string) => {
  return useQuery({
    queryKey: ['productImages', productId],
    queryFn: async () => {
      console.log('=== FETCHING PRODUCT IMAGES ===');
      console.log('Product ID:', productId);
      
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching product images:', error);
        throw error;
      }
      
      console.log('Product images fetched:', data);
      return (data as ProductImage[]) || [];
    },
    enabled: !!productId,
  });
};

export const useAddProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      imageUrl,
      displayOrder,
    }: {
      productId: string;
      imageUrl: string;
      displayOrder: number;
    }) => {
      console.log('=== ADDING PRODUCT IMAGE ===');
      console.log('Product ID:', productId);
      console.log('Image URL:', imageUrl);
      console.log('Display Order:', displayOrder);
      
      const { data, error } = await supabase
        .from('product_images')
        .insert([
          {
            product_id: productId,
            image_url: imageUrl,
            display_order: displayOrder,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error inserting product image:', error);
        throw error;
      }
      
      console.log('Product image added successfully:', data);
      return data;
    },
    onSuccess: (_, { productId }) => {
      console.log('Invalidating cache for productImages:', productId);
      queryClient.invalidateQueries({ queryKey: ['productImages', productId] });
    },
  });
};

export const useUpdateProductImageOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (images: ProductImage[]) => {
      const updates = images.map((img) => ({
        id: img.id,
        product_id: img.product_id,
        image_url: img.image_url,
        display_order: img.display_order,
      }));

      const { error } = await supabase
        .from('product_images')
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: (_, images) => {
      if (images.length > 0) {
        queryClient.invalidateQueries({
          queryKey: ['productImages', images[0].product_id],
        });
      }
    },
  });
};

export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
    },
    onSuccess: (_, __, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['productImages', productId] });
    },
    onMutate: async (imageId) => {
      // This will be provided in the mutation call
      return imageId;
    },
  });
};
