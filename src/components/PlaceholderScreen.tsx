import { useRoute } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { color, typography } from '@/theme';

export function PlaceholderScreen() {
  const route = useRoute();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.bg }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Text style={typography['display/screen-title']}>{route.name}</Text>
        <Text style={[typography['body/default'], { marginTop: 8 }]}>
          Screen stub — implemented in the phase that owns it.
        </Text>
      </View>
    </SafeAreaView>
  );
}
