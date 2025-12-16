
import EdgeCard from '@/components/EdgeCard';

export default function Home() {
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
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Live Edge Detection</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Our AI continuously analyzes fixtures to find profitable betting opportunities</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <EdgeCard
          homeTeam="Liverpool"
          awayTeam="Nottingham Forest"
          market="Total Goals Conceded - Liverpool"
          selection="Over 1.5 Goals"
          odds={1.98}
          edgeType="HIGH"
          confidence={87}
          reasons={[
            "Van Dijk is injured and not in the starting lineup.",
            "Liverpool concede avg 1.2 goals with Van Dijk, but 2.1 without him.",
            "Nottingham Forest scored in last 4 away games."
          ]}
        />
        <EdgeCard
          homeTeam="Manchester City"
          awayTeam="Arsenal"
          market="Both Teams to Score"
          selection="Yes"
          odds={1.65}
          edgeType="HIGH"
          confidence={82}
          reasons={[
            "Arsenal has scored in 18/20 recent away games.",
            "Man City averages 2.8 goals at home.",
            "Both teams scored in 4/5 recent H2H meetings."
          ]}
        />
        <EdgeCard
          homeTeam="Leeds"
          awayTeam="Aston Villa"
          market="Total Goals"
          selection="Over 2.5"
          odds={1.72}
          edgeType="MEDIUM"
          confidence={76}
          reasons={[
            "Both teams averaging 2.8+ goals in recent matches.",
            "Historical: 82% of meetings had 3+ goals.",
            "Weather conditions favor attacking play."
          ]}
        />
      </div>
    </div>
  );
}

