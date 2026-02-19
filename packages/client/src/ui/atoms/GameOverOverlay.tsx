import { useEffect } from 'react';

interface GameOverOverlayProps {
  winner: 'player1' | 'player2' | null;
  onRestart: () => void;
}

export function GameOverOverlay({ winner, onRestart }: GameOverOverlayProps) {
  const isWin = winner === 'player1';

  // Keyboard shortcut: R to restart — scoped to overlay lifetime
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') onRestart();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRestart]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          color: isWin ? '#4caf50' : '#f44336',
          fontSize: '48px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          letterSpacing: '4px',
          textShadow: `0 0 20px ${isWin ? '#4caf50' : '#f44336'}`,
        }}
      >
        {isWin ? 'YOU WIN!' : 'YOU LOSE'}
      </div>
      <div
        style={{
          color: '#888',
          fontSize: '16px',
          fontFamily: 'monospace',
          marginTop: '16px',
        }}
      >
        Press R to play again
      </div>
    </div>
  );
}
