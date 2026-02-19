import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChipSelectPanel } from './ChipSelectPanel';
import { mockChips } from '../storybookMocks';

const meta: Meta<typeof ChipSelectPanel> = {
  component: ChipSelectPanel,
  title: 'Molecules/ChipSelectPanel',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ChipSelectPanel>;

export const Inactive: Story = {
  name: 'Inactive (dimmed, awaiting gauge)',
  args: {
    hand: mockChips.slice(0, 5),
    isActive: false,
    cursorIndex: 0,
    selectedIndices: [],
    okFocused: false,
    previewChip: null,
    onOk: () => {},
  },
};

export const ActiveNoneSelected: Story = {
  name: 'Active — cursor on first chip, none selected',
  args: {
    hand: mockChips.slice(0, 5),
    isActive: true,
    cursorIndex: 0,
    selectedIndices: [],
    okFocused: false,
    previewChip: mockChips[0],
    onOk: () => alert('OK pressed'),
  },
};

export const ActiveCursorMiddle: Story = {
  name: 'Active — cursor on 3rd chip',
  args: {
    hand: mockChips.slice(0, 5),
    isActive: true,
    cursorIndex: 2,
    selectedIndices: [],
    okFocused: false,
    previewChip: mockChips[2],
    onOk: () => alert('OK pressed'),
  },
};

export const TwoChipsSelected: Story = {
  name: 'Two chips selected',
  args: {
    hand: mockChips.slice(0, 5),
    isActive: true,
    cursorIndex: 2,
    selectedIndices: [0, 1],
    okFocused: false,
    previewChip: mockChips[2],
    onOk: () => alert('OK pressed'),
  },
};

export const MaxSelected: Story = {
  name: 'Max 5 chips selected',
  args: {
    hand: mockChips.slice(0, 5),
    isActive: true,
    cursorIndex: 4,
    selectedIndices: [0, 1, 2, 3, 4],
    okFocused: false,
    previewChip: mockChips[4],
    onOk: () => alert('OK pressed'),
  },
};

export const SmallHand: Story = {
  name: 'Small hand (2 chips)',
  args: {
    hand: mockChips.slice(0, 2),
    isActive: true,
    cursorIndex: 0,
    selectedIndices: [0],
    okFocused: false,
    previewChip: mockChips[0],
    onOk: () => alert('OK pressed'),
  },
};

export const OkFocused: Story = {
  name: 'OK button focused (keyboard)',
  args: {
    hand: mockChips.slice(0, 5),
    isActive: true,
    cursorIndex: 4,
    selectedIndices: [0, 2],
    okFocused: true,
    previewChip: null,
    onOk: () => alert('OK pressed'),
  },
};

export const TenChipHand: Story = {
  name: '2-row layout (10 chips)',
  args: {
    hand: mockChips,
    isActive: true,
    cursorIndex: 6,
    selectedIndices: [0, 5],
    okFocused: false,
    previewChip: mockChips[6],
    onOk: () => alert('OK pressed'),
  },
};
