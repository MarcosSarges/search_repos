import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Button, Typography } from '@ds/atoms';
import { spacing } from '@ds/tokens';

import { Card } from './Card';

const meta = {
  title: 'DS/Molecules/Card',
  component: Card,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllRegions: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Typography variant="heading">Repository</Typography>
      </Card.Header>
      <Card.Content>
        <Typography variant="body" tone="muted">
          A typed surface with header, content, and footer regions.
        </Typography>
      </Card.Content>
      <Card.Footer>
        <Button size="sm">Open</Button>
      </Card.Footer>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Card>
      <Card.Content>
        <Typography variant="body">Content-only card shell.</Typography>
      </Card.Content>
    </Card>
  ),
};
