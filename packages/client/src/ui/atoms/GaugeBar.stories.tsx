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
  name: 'Off',
  args: { value: 0, max: 600 },
};

export const QuarterFull: Story = {
  name: 'Low',
  args: { value: 120, max: 600 },
};

export const HalfFull: Story = {
  name: 'Mid',
  args: { value: 300, max: 600 },
};

export const Full: Story = {
  name: 'Full',
  args: { value: 600, max: 600 },
};

export const CustomScreenOpen: Story = {
  name: 'Custom Screen Open (Glow Off)',
  args: { value: 420, max: 600, customScreenOpen: true },
};
