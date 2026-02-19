import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChipCard } from './ChipCard';
import { mockChips } from '../storybookMocks';

const meta: Meta<typeof ChipCard> = {
  component: ChipCard,
  title: 'Atoms/ChipCard',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ChipCard>;

export const Default: Story = {
  args: { chip: mockChips[0], isFocused: false },
};

export const Focused: Story = {
  name: 'Focused (active / red border)',
  args: { chip: mockChips[0], isFocused: true },
};

export const FireElement: Story = {
  args: { chip: mockChips[1], isFocused: false },
};

export const AquaElement: Story = {
  args: { chip: mockChips[2], isFocused: false },
};

export const ElecElement: Story = {
  args: { chip: mockChips[3], isFocused: false },
};

export const WoodElement: Story = {
  args: { chip: mockChips[4], isFocused: false },
};

export const LoadedStack: Story = {
  name: 'Loaded chip stack (3 chips)',
  render: () => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {mockChips.slice(0, 3).map((chip, i) => (
        <ChipCard key={chip.id} chip={chip} isFocused={i === 0} />
      ))}
    </div>
  ),
};
