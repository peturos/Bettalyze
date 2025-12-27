
import { supabase } from './supabase';

// Cluster A: The Justice Engine (Performance vs Expected)
export async function getJusticeMetrics(
    metric: 'unlucky' | 'lucky' = 'unlucky',
    limit: number = 5
) {
    // 'unlucky' = High xG but Low Goals (Positive Diff, Descending)
    // 'lucky' = Low xG but High Goals (Negative Diff, Ascending)
    const isUnlucky = metric === 'unlucky';

    const { data, error } = await supabase
        .from('v_performance_metrics')
        .select('*')
        .order('xg_diff', { ascending: !isUnlucky })
        .limit(limit);

    if (error) {
        console.error(`Error fetching justice metrics (${metric}):`, error);
        return [];
    }

    return data.map(team => ({
        team: team.team_name,
        matches: team.matches_played,
        xG: Number(team.total_xg).toFixed(2),
        goals: team.total_goals,
        diff: Number(team.xg_diff).toFixed(2),
        verdict: isUnlucky ? 'Underperforming (Bad Finishing/Luck)' : 'Overperforming (Clinical/Lucky)'
    }));
}
