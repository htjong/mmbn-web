import type { Meta, StoryObj } from '@storybook/react-vite';
import { TitleScreen } from './TitleScreen';

const meta: Meta<typeof TitleScreen> = {
  component: TitleScreen,
  title: 'Organisms/TitleScreen',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TitleScreen>;

export const Default: Story = {
  name: 'Title Screen',
};

export const KeyboardStart: Story = {
  name: 'Keyboard Prompt',
  args: {
    initialModality: 'keyboard',
  },
};

export const TouchStart: Story = {
  name: 'Touch Prompt',
  args: {
    initialModality: 'pointer',
  },
};
