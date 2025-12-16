import ChatInterface from '@/components/ChatInterface';

export default function WizardinhoPage() {
    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Ask Wizardinho</h1>
                <p style={{ color: 'var(--muted)' }}>The all-knowing AI betting assistant.</p>
            </div>
            <ChatInterface />
        </div>
    );
}
