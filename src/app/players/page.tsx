import { getTopScorers } from '@/lib/db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function PlayersPage() {
    const players = await getTopScorers();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Top <span className={styles.accent}>Scorers</span></h1>
                <p className={styles.subtitle}>Premier League Golden Boot Race</p>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className="text-center">Rank</th>
                            <th>Player</th>
                            <th className="text-center">Goals</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.length > 0 ? (
                            players.map((player, index) => (
                                <tr key={index}>
                                    <td className={styles.rank}>{index + 1}</td>
                                    <td>
                                        <div className={styles.playerCell}>
                                            <span className={styles.playerName}>{player.name}</span>
                                            <span className={styles.teamName}>{player.team}</span>
                                        </div>
                                    </td>
                                    <td className={styles.goals}>{player.goals}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                                    No player stats available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
