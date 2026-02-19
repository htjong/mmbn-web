import type { Meta, StoryObj } from '@storybook/react-vite';
import { GaugeBar } from './GaugeBar';

const meta: Meta<typeof GaugeBar> = {
  component: GaugeBar,
  title: 'Atoms/GaugeBar',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof GaugeBar>;

export const Empty: Story = {
  args: { value: 0, max: 600 },
};

export const QuarterFull: Story = {
  args: { value: 150, max: 600 },
};

export const HalfFull: Story = {
  args: { value: 300, max: 600 },
};

export const AlmostFull: Story = {
  args: { value: 540, max: 600 },
};

export const Full: Story = {
  name: 'Full (lavender + ready)',
  args: { value: 600, max: 600 },
};
