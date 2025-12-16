import styles from './EdgeCard.module.css';
import { Target, TrendingUp } from 'lucide-react';

interface EdgeCardProps {
    homeTeam: string;
    awayTeam: string;
    market: string;
    selection: string;
    odds: number;
    edgeType: 'HIGH' | 'MEDIUM';
    confidence: number;
    reasons: string[];
}

export default function EdgeCard({
    homeTeam,
    awayTeam,
    market,
    selection,
    odds,
    edgeType,
    confidence,
    reasons
}: EdgeCardProps) {
    return (
        <div className={`${styles.card} ${edgeType === 'HIGH' ? styles.highEdge : ''}`}>
            <div className={styles.header}>
                <div>
                    <div className={styles.matchTitle}>{homeTeam} vs {awayTeam}</div>
                    <div className={styles.meta}>
                        <span className={styles.valueTag}>
                            <Target size={14} /> Value {odds.toFixed(2)}
                        </span>
                    </div>
                </div>
                <span className={edgeType === 'HIGH' ? `${styles.badge} ${styles.badgeHigh}` : `${styles.badge} ${styles.badgeMedium}`}>
                    {edgeType} EDGE
                </span>
            </div>

            <div className={styles.marketBox}>
                <div className={styles.marketLabel}>Market: {market}</div>
                <div className={styles.marketValue}>{selection}</div>
                <div className={styles.recommendation}>
                    BACK {selection} @ {odds.toFixed(2)}
                </div>
            </div>

            <div className={styles.reasoning}>
                <span className={styles.reasonTitle}>Key Reasoning:</span>
                <ul className={styles.reasonList}>
                    {reasons.map((reason, i) => (
                        <li key={i} className={styles.reasonItem}>{reason}</li>
                    ))}
                </ul>
            </div>

            <div className={styles.confidence}>
                <span>AI Confidence</span>
                <span className={styles.confidenceValue}>{confidence}%</span>
            </div>
        </div>
    );
}
