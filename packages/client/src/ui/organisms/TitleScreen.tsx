import { InputModality, useTitleScreen } from '../hooks/useTitleScreen';

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a1a',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    fontFamily: 'monospace',
    cursor: 'pointer',
  },
  title: {
    color: '#4fc3f7',
    fontSize: '36px',
    fontWeight: 'bold' as const,
    letterSpacing: '4px',
    textShadow: '0 0 20px #4fc3f7',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#81d4fa',
    fontSize: '14px',
    letterSpacing: '2px',
    marginBottom: '48px',
    textShadow: '0 0 10px #81d4fa',
  },
  prompt: {
    color: '#ffffff',
    fontSize: '16px',
    letterSpacing: '3px',
    animation: 'mmbn-blink 1.2s step-start infinite',
  },
};

interface TitleScreenProps {
  initialModality?: InputModality;
}

export function TitleScreen({ initialModality = 'keyboard' }: TitleScreenProps) {
  const { promptText } = useTitleScreen(initialModality);

  return (
    <>
      <style>{`
        @keyframes mmbn-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      <div style={styles.overlay}>
        <div style={styles.title}>MEGA MAN BATTLE NETWORK</div>
        <div style={styles.subtitle}>WEB EDITION</div>
        <div style={styles.prompt}>{promptText}</div>
      </div>
    </>
  );
}
