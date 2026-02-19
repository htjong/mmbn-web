import type { Meta, StoryObj } from '@storybook/react-vite';
import { HpBar } from './HpBar';

const meta: Meta<typeof HpBar> = {
  component: HpBar,
  title: 'Atoms/HpBar',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof HpBar>;

export const FullHealth: Story = {
  args: { name: 'P1', hp: 100, maxHp: 100, side: 'left' },
};

export const HalfHealth: Story = {
  args: { name: 'P1', hp: 50, maxHp: 100, side: 'left' },
};

export const LowHealth: Story = {
  args: { name: 'P1', hp: 15, maxHp: 100, side: 'left' },
};

export const Critical: Story = {
  args: { name: 'P1', hp: 3, maxHp: 100, side: 'left' },
};

export const RightSide: Story = {
  name: 'Right Side (P2)',
  args: { name: 'P2', hp: 80, maxHp: 100, side: 'right' },
};

export const BothSides: Story = {
  name: 'Both Sides (layout reference)',
  render: () => (
    <div style={{ display: 'flex', width: '400px' }}>
      <HpBar name="P1" hp={72} maxHp={100} side="left" />
      <HpBar name="P2" hp={35} maxHp={100} side="right" />
    </div>
  ),
};
