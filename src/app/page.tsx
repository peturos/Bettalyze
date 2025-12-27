
import EdgeCard from '@/components/EdgeCard';
import { getMarketSteam } from '@/lib/tools';

export const revalidate = 60; // Refresh every 60 seconds

export default async function Home() {
  const edges = await getMarketSteam(6);

  // Fallback if no live steam exists (e.g. at night or offseason)
  const displayEdges = edges.length > 0 ? edges : [
    {
      homeTeam: "Liverpool",
      awayTeam: "Nottingham Forest",
      market: "Total Goals Conceded - Liverpool",
      selection: "Over 1.5 Goals",
      odds: 1.98,
      edgeType: "HIGH",
      confidence: 87,
      reasons: [
        "Van Dijk is injured and not in the starting lineup.",
        "Liverpool concede avg 1.2 goals with Van Dijk, but 2.1 without him.",
      ]
    },
    // ... keep one mock just in case so page isn't blank
  ];

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1 }}>
          <span style={{ color: 'var(--primary)' }}>Bettalyze</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--muted)', maxWidth: '600px', margin: '0 auto' }}>
          AI-powered football analytics for smarter betting decisions.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
          {edges.length > 0 ? '🔥 Live Market Steam' : 'Live Edge Detection (Demo)'}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          {edges.length > 0
            ? 'Significant odds drops detected in real-time. Follow the smart money.'
            : 'Waiting for market movements... Showing historical examples below.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {displayEdges.map((edge: any, i: number) => (
          <EdgeCard
            key={i}
            homeTeam={edge.homeTeam}
            awayTeam={edge.awayTeam}
            market={edge.market}
            selection={edge.selection}
            odds={edge.odds}
            edgeType={edge.edgeType as any}
            confidence={edge.confidence}
            reasons={edge.reasons}
          />
        ))}
      </div>
    </div>
  );
}
