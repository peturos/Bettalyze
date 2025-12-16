'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { Trophy, BarChart2, Users, User, Calendar, Bot } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', href: '/', icon: Trophy },
        { name: 'League', href: '/league', icon: BarChart2 },
        { name: 'Teams', href: '/teams', icon: Users },
        { name: 'Players', href: '/players', icon: User },
        { name: 'Fixtures', href: '/fixtures', icon: Calendar },
    ];

    return (
        <header className={styles.header}>
            <div className="container">
                <nav className={styles.nav}>
                    <Link href="/" className={styles.logo}>
                        <Trophy size={28} />
                        Bettalyze
                    </Link>

                    <ul className={styles.menu}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`${styles.link} ${isActive ? styles.active : ''}`}
                                    >
                                        <Icon size={18} />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                        <li>
                            <Link href="/wizardinho" className={styles.wizardLink}>
                                <Bot size={18} />
                                Wizardinho AI
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
