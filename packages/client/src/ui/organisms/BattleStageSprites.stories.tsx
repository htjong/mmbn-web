import type { Meta, StoryObj } from '@storybook/react-vite';

const playerReady = new URL(
  '../../../../../assets/MMBN3_MM_LEFT_FIELD_READY_1.png',
  import.meta.url
).href;
const playerMove = new URL('../../../../../assets/MMBN3_MM_LEFT_FIELD_MOVE_2.png', import.meta.url)
  .href;
const playerBuster = new URL(
  '../../../../../assets/MMBN3_MM_LEFT_FIELD_BUSTER_4.png',
  import.meta.url
).href;
const aiReady = new URL(
  '../../../../../assets/MMBN3_FORTE_RIGHT_FIELD_READY_1.png',
  import.meta.url
).href;
const aiMove = new URL('../../../../../assets/MMBN3_FORTE_RIGHT_FIELD_MOVE_2.png', import.meta.url)
  .href;
const aiBuster = new URL(
  '../../../../../assets/MMBN3_FORTE_RIGHT_FIELD_BUSTER_4.png',
  import.meta.url
).href;

const SpriteGrid = () => (
  <div style={{ background: '#101820', color: '#fff', fontFamily: 'monospace', padding: 16 }}>
    <h3>Battle Sprite Frames</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 90px)', gap: 16 }}>
      <img alt="Player Ready" src={playerReady} width={80} height={80} />
      <img alt="Player Move" src={playerMove} width={80} height={80} />
      <img alt="Player Buster" src={playerBuster} width={80} height={80} />
      <img alt="AI Ready" src={aiReady} width={80} height={80} />
      <img alt="AI Move" src={aiMove} width={80} height={80} />
      <img alt="AI Buster" src={aiBuster} width={80} height={80} />
    </div>
  </div>
);

const meta: Meta<typeof SpriteGrid> = {
  title: 'Organisms/BattleStageSprites',
  component: SpriteGrid,
};

export default meta;

type Story = StoryObj<typeof SpriteGrid>;

export const Default: Story = {};
