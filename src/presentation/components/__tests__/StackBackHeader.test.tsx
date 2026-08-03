import { fireEvent, render, screen } from '@/test';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text, View } from 'react-native';

import { StackBackHeader } from '../StackBackHeader';

const Stack = createNativeStackNavigator();

function FirstScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  return (
    <Pressable onPress={() => navigation.navigate('Second')} testID="go-details">
      <Text>Go details</Text>
    </Pressable>
  );
}

function SecondScreen() {
  return (
    <View testID="second-screen">
      <StackBackHeader title="Detalhes" safe />
    </View>
  );
}

function SecondScreenWithTrailing() {
  return (
    <View testID="second-screen-trailing">
      <StackBackHeader
        title="Detalhes"
        safe
        trailing={<View testID="stack-back-header-trailing" />}
      />
    </View>
  );
}

describe('StackBackHeader', () => {
  it('WHEN rendered on a stack screen THEN it shows title and Voltar without source toggle', async () => {
    await render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="First" component={FirstScreen} />
          <Stack.Screen name="Second" component={SecondScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    fireEvent.press(screen.getByTestId('go-details'));

    expect(await screen.findByText('Detalhes')).toBeTruthy();
    expect(screen.getByTestId('ds-back-header')).toBeTruthy();
    expect(screen.getByLabelText('Voltar')).toBeTruthy();
    expect(screen.queryByTestId('ds-source-header-toggle')).toBeNull();
    expect(screen.queryByTestId('ds-source-header')).toBeNull();
  });

  it('WHEN Voltar is pressed THEN it navigates back', async () => {
    await render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="First" component={FirstScreen} />
          <Stack.Screen name="Second" component={SecondScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    fireEvent.press(screen.getByTestId('go-details'));
    await screen.findByTestId('second-screen');

    fireEvent.press(screen.getByLabelText('Voltar'));

    expect(await screen.findByTestId('go-details')).toBeTruthy();
    expect(screen.queryByTestId('second-screen')).toBeNull();
  });

  it('WHEN trailing is provided THEN it is forwarded to BackHeader', async () => {
    await render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="First" component={FirstScreen} />
          <Stack.Screen
            name="Second"
            component={SecondScreenWithTrailing}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    fireEvent.press(screen.getByTestId('go-details'));

    expect(await screen.findByTestId('stack-back-header-trailing')).toBeTruthy();
    expect(screen.getByLabelText('Voltar')).toBeTruthy();
  });
});
