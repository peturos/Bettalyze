import { getUpcomingFixtures, CURRENT_SEASON } from '@/lib/db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function FixturesPage() {
    const fixtures = await getUpcomingFixtures();

    // Group by date if we wanted to be fancy, but simple list for now
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    };
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Upcoming <span className={styles.accent}>Fixtures</span></h1>
                <p className={styles.subtitle}>Scheduled Matches • Season {CURRENT_SEASON}</p>
            </header>

            <div className={styles.list}>
                {fixtures.length > 0 ? (
                    fixtures.map((match) => (
                        <div key={match.fixture_id} className={styles.card}>
                            <div className={styles.date}>
                                <div>{formatDate(match.kickoff)}</div>
                                <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{formatTime(match.kickoff)}</div>
                            </div>

                            <div className={styles.match}>
                                <span className={`${styles.team} ${styles.home}`}>{match.home_team_name}</span>
                                <span className={styles.vs}>VS</span>
                                <span className={`${styles.team} ${styles.away}`}>{match.away_team_name}</span>
                            </div>

                            <div className={styles.odds}>
                                {/* Placeholder for odds functionality */}
                                <div className={styles.oddButton} title="Home Win">-</div>
                                <div className={styles.oddButton} title="Draw">-</div>
                                <div className={styles.oddButton} title="Away Win">-</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty}>
                        No upcoming fixtures scheduled for this season yet.
                    </div>
                )}
            </div>
        </div>
    );
}
