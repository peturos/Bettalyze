import { getStandings, CURRENT_SEASON } from '@/lib/db';
import styles from './page.module.css';

export const revalidate = 3600; // Cache for 1 hour

export default async function LeaguePage() {
    let standings = [];
    try {
        const data = await getStandings(39, CURRENT_SEASON);
        // Check if data is valid and has the expected structure from the JSON blob
        if (data && data.response && data.response.length > 0) {
            standings = data.response[0].league.standings[0];
        }
    } catch (error) {
        console.error(error);
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Premier <span className={styles.accent}>League</span></h1>
                <p className={styles.subtitle}>Current Standings & Form Analysis</p>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className="text-center">#</th>
                            <th>Team</th>
                            <th className="text-center">MP</th>
                            <th className="text-center">W</th>
                            <th className="text-center">D</th>
                            <th className="text-center">L</th>
                            <th className="text-center">GF</th>
                            <th className="text-center">GA</th>
                            <th className="text-center">GD</th>
                            <th className="text-center">Pts</th>
                            <th>Form</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.length > 0 ? (
                            standings.map((team: any) => (
                                <tr key={team.team.id}>
                                    <td className={styles.rank}>{team.rank}</td>
                                    <td>
                                        <div className={styles.teamCell}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={team.team.logo} alt={team.team.name} className={styles.logo} />
                                            {team.team.name}
                                        </div>
                                    </td>
                                    <td className="text-center">{team.all.played}</td>
                                    <td className="text-center">{team.all.win}</td>
                                    <td className="text-center">{team.all.draw}</td>
                                    <td className="text-center">{team.all.lose}</td>
                                    <td className="text-center">{team.all.goals.for}</td>
                                    <td className="text-center">{team.all.goals.against}</td>
                                    <td className="text-center">{team.goalsDiff}</td>
                                    <td className={`text-center ${styles.points}`}>{team.points}</td>
                                    <td>
                                        {team.form && team.form.split('').map((char: string, i: number) => {
                                            let badgeClass = styles.draw;
                                            if (char === 'W') badgeClass = styles.win;
                                            if (char === 'L') badgeClass = styles.loss;
                                            return <span key={i} className={`${styles.formBadge} ${badgeClass}`}>{char}</span>
                                        })}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                                    Unable to load standings. Check API key or try again later.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
