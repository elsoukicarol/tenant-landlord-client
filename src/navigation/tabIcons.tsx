import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Returns a `tabBarIcon` factory for a single tab. Pass the Ionicons name to
 * use when unfocused; we render the filled variant when focused.
 *
 * Ionicons names follow the pattern `<name>` (filled) / `<name>-outline`.
 * We take the outline name and drop the suffix for focused.
 */
export function tabIcon(outlineName: IconName): BottomTabNavigationOptions['tabBarIcon'] {
  const TabIcon: BottomTabNavigationOptions['tabBarIcon'] = ({ focused, color: c, size }) => {
    const name = focused ? (outlineName.replace(/-outline$/, '') as IconName) : outlineName;
    return <Ionicons name={name} size={size} color={c} />;
  };
  return TabIcon;
}
