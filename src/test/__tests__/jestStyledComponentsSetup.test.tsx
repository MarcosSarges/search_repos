import { styled } from 'styled-components/native';

import { render, screen } from '@/test';

const Label = styled.Text`
  color: green;
`;

describe('jest-styled-components/native setup', () => {
  it('registers toHaveStyleRule for styled native components', async () => {
    await render(<Label testID="label">ok</Label>);
    expect(screen.getByTestId('label')).toHaveStyleRule('color', 'green');
  });
});
