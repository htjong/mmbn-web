import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'game-dark',
      values: [
        { name: 'game-dark', value: '#111' },
        { name: 'white', value: '#fff' },
      ],
    },
  },
};

export default preview;
