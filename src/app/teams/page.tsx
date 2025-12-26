import { getTeams } from '@/lib/db';
import styles from './page.module.css';

// Force dynamic rendering to ensure we get the latest data on request
export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
    const teams = await getTeams();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Team <span className={styles.accent}>Hub</span></h1>
                <p className={styles.subtitle}>Explore Premier League Clubs</p>
            </header>

            <div className={styles.grid}>
                {teams.length > 0 ? (
                    teams.map((team) => (
                        <div key={team.id} className={styles.card}>
                            <div className={styles.iconWrapper}>
                                {/* Placeholder for team logo since we don't have URLs in DB yet, using first letter */}
                                <span className={styles.teamInitial}>{team.name.charAt(0)}</span>
                            </div>
                            <h2 className={styles.teamName}>{team.name}</h2>
                            <div className={styles.stats}>
                                <span className={styles.label}>ID: {team.id}</span>
                            </div>
                            <button className={styles.actionButton}>View Details</button>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty}>
                        No teams found in the database.
                    </div>
                )}
            </div>
        </div>
    );
}
