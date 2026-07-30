import { type ReactNode } from 'react';
import { Linking, Pressable } from 'react-native';

type Props = {
  href: string;
  children: ReactNode;
};

export function ExternalLink({ href, children }: Props) {
  return (
    <Pressable
      onPress={() => {
        void Linking.openURL(href);
      }}>
      {children}
    </Pressable>
  );
}
