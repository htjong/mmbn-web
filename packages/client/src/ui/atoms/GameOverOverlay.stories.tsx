import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameOverOverlay } from './GameOverOverlay';

const meta: Meta<typeof GameOverOverlay> = {
  component: GameOverOverlay,
  title: 'Atoms/GameOverOverlay',
  tags: ['autodocs'],
  parameters: {
    // Overlay covers the full viewport — use fullscreen layout
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof GameOverOverlay>;

export const YouWin: Story = {
  name: 'YOU WIN!',
  args: {
    winner: 'player1',
    onRestart: () => alert('Restart pressed'),
  },
};

export const YouLose: Story = {
  name: 'YOU LOSE',
  args: {
    winner: 'player2',
    onRestart: () => alert('Restart pressed'),
  },
};
