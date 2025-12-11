import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Statistics {
  totalTrees: number;
  activePlanters: number;
  treeSpecies: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useStatistics = (): Statistics => {
  const [statistics, setStatistics] = useState<Statistics>({
    totalTrees: 0,
    activePlanters: 0,
    treeSpecies: 0,
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchStatistics = useCallback(async () => {
    try {
      setStatistics(prev => ({ ...prev, loading: true, error: null }));

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Authenticated users use the trees table
        const [treesResult, plantersResult, speciesResult] = await Promise.all([
          supabase.from('trees').select('tree_count'),
          supabase.from('trees').select('user_id'),
          supabase.from('trees').select('species').not('species', 'is', null)
        ]);

        if (treesResult.error) throw treesResult.error;
        if (plantersResult.error) throw plantersResult.error;
        if (speciesResult.error) throw speciesResult.error;

        const totalTreesPlanted = treesResult.data?.reduce((sum, tree) => sum + (tree.tree_count || 0), 0) || 0;
        const uniquePlanters = new Set(plantersResult.data?.map(tree => tree.user_id)).size;
        const uniqueSpecies = new Set(
          speciesResult.data?.map(tree => tree.species?.toLowerCase().trim()).filter(Boolean)
        ).size;

        setStatistics(prev => ({
          ...prev,
          totalTrees: totalTreesPlanted,
          activePlanters: uniquePlanters,
          treeSpecies: uniqueSpecies,
          loading: false,
          error: null,
        }));
      } else {
        // Anonymous users use trees_public view (no user_id)
        const [treesResult, speciesResult, profilesResult] = await Promise.all([
          supabase.from('trees_public').select('tree_count'),
          supabase.from('trees_public').select('species').not('species', 'is', null),
          supabase.from('profiles_public').select('id')
        ]);

        if (treesResult.error) throw treesResult.error;
        if (speciesResult.error) throw speciesResult.error;
        if (profilesResult.error) throw profilesResult.error;

        const totalTreesPlanted = treesResult.data?.reduce((sum, tree) => sum + (tree.tree_count || 0), 0) || 0;
        const uniquePlanters = profilesResult.data?.length || 0;
        const uniqueSpecies = new Set(
          speciesResult.data?.map(tree => tree.species?.toLowerCase().trim()).filter(Boolean)
        ).size;

        setStatistics(prev => ({
          ...prev,
          totalTrees: totalTreesPlanted,
          activePlanters: uniquePlanters,
          treeSpecies: uniqueSpecies,
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load statistics',
      }));
    }
  }, []);

  useEffect(() => {
    fetchStatistics();

    // Set up real-time subscription for trees table
    const subscription = supabase
      .channel('trees_stats')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trees' },
        () => {
          // Refetch statistics when trees data changes
          fetchStatistics();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchStatistics]);

  return {
    ...statistics,
    refetch: fetchStatistics,
  };
};