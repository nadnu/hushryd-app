import { Platform } from 'react-native';
import { Text, TextProps } from './Themed';

export function MonoText(props: TextProps) {
  const fontFamily = Platform.select({
    web: 'monospace',
    default: 'SpaceMono',
  });

  return <Text {...props} style={[props.style, fontFamily ? { fontFamily } : null]} />;
}
