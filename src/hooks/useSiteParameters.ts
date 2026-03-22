import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SiteParameter {
  key: string;
  value: string;
  display_label: string;
}

export function useSiteParameters() {
  return useQuery({
    queryKey: ['site-parameters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_parameters')
        .select('key, value, display_label');
      if (error) throw error;
      return Object.fromEntries(
        (data || []).map((p: SiteParameter) => [p.key, p])
      ) as Record<string, SiteParameter>;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache — these barely change
  });
}
