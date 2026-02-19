import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChipSlot } from './ChipSlot';
import { mockChips } from '../storybookMocks';

const meta: Meta<typeof ChipSlot> = {
  component: ChipSlot,
  title: 'Atoms/ChipSlot',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ChipSlot>;

export const Inactive: Story = {
  name: 'Inactive (panel dimmed)',
  args: { chip: mockChips[0], isActive: false, isCursor: false, isSelected: false },
};

export const Active: Story = {
  args: { chip: mockChips[0], isActive: true, isCursor: false, isSelected: false },
};

export const WithCursor: Story = {
  name: 'Cursor highlight',
  args: { chip: mockChips[0], isActive: true, isCursor: true, isSelected: false },
};

export const Selected: Story = {
  name: 'Selected (✓ badge)',
  args: { chip: mockChips[0], isActive: true, isCursor: false, isSelected: true },
};

export const CursorAndSelected: Story = {
  name: 'Cursor + selected',
  args: { chip: mockChips[1], isActive: true, isCursor: true, isSelected: true },
};

export const EmptySlot: Story = {
  name: 'Empty slot',
  args: { chip: null, isActive: false, isCursor: false, isSelected: false },
};

export const AllElements: Story = {
  name: 'All chip elements',
  render: () => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {mockChips.map((chip) => (
        <ChipSlot key={chip.id} chip={chip} isActive={true} isCursor={false} isSelected={false} />
      ))}
    </div>
  ),
};
