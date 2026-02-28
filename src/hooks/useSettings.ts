import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface AppSetting {
  id: string;
  key: string;
  value: any;
  updated_at: string;
}

export const useSettings = () => {
  const queryClient = useQueryClient();

  // Fetch all settings
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');
      
      if (error) throw error;
      return data as AppSetting[];
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 3000, // Consider data stale after 3 seconds
  });

  // Fetch specific setting
  const getSetting = (key: string) => {
    const settings = settingsQuery.data || [];
    const setting = settings.find(s => s.key === key);
    
    if (!setting) return null;
    
    const value = setting.value;
    
    // Handle different value types
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
      return value;
    }
    
    return value;
  };

  // Update setting
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      // Normalize boolean values
      const normalizedValue = typeof value === 'boolean' ? value : value;
      
      // First try to update
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .eq('key', key)
        .single();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('app_settings')
          .update({ value: normalizedValue, updated_at: new Date().toISOString() })
          .eq('key', key)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('app_settings')
          .insert({
            key,
            value: normalizedValue,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      // Invalidate and immediately refetch
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.refetchQueries({ queryKey: ['settings'] });
    },
  });

  return {
    settings: settingsQuery.data || [],
    isLoading: settingsQuery.isLoading,
    getSetting,
    updateSetting,
  };
};
