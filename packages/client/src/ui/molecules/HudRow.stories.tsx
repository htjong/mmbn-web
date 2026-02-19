import type { Meta, StoryObj } from '@storybook/react-vite';
import { HudRow } from './HudRow';
import { mockChips } from '../storybookMocks';

const meta: Meta<typeof HudRow> = {
  component: HudRow,
  title: 'Molecules/HudRow',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HudRow>;

export const BothHealthy: Story = {
  name: 'Both players healthy, no chips',
  args: {
    player1Hp: 100,
    player1MaxHp: 100,
    player2Hp: 100,
    player2MaxHp: 100,
    selectedChips: [],
    activeChipIndex: 0,
  },
};

export const WithLoadedChips: Story = {
  name: 'With 3 chips loaded (first focused)',
  args: {
    player1Hp: 80,
    player1MaxHp: 100,
    player2Hp: 60,
    player2MaxHp: 100,
    selectedChips: mockChips.slice(0, 3),
    activeChipIndex: 0,
  },
};

export const LowHpBattle: Story = {
  name: 'Late battle — both low HP',
  args: {
    player1Hp: 22,
    player1MaxHp: 100,
    player2Hp: 8,
    player2MaxHp: 100,
    selectedChips: mockChips.slice(0, 2),
    activeChipIndex: 1,
  },
};

export const FullChipLoad: Story = {
  name: 'Max 5 chips loaded',
  args: {
    player1Hp: 100,
    player1MaxHp: 100,
    player2Hp: 100,
    player2MaxHp: 100,
    selectedChips: mockChips.slice(0, 5),
    activeChipIndex: 0,
  },
};
