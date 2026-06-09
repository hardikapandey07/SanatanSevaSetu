import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useT } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

const BRAND = {
  primary: '#E8731C',
  text: '#1F1A14',
  textMuted: '#9A9085',
  border: '#EEE8DC',
  bg: '#FFFFFF',
};

type IconKey = 'home' | 'services' | 'events' | 'profile';

const ICONS: Record<IconKey, { ios: string; android: string; web: string }> = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  services: { ios: 'square.grid.2x2.fill', android: 'apps', web: 'apps' },
  events: { ios: 'calendar', android: 'event', web: 'event' },
  profile: { ios: 'person.fill', android: 'person', web: 'person' },
};

const TABS: { name: string; icon: IconKey; labelKey: TranslationKey }[] = [
  { name: 'home', icon: 'home', labelKey: 'tabHome' },
  { name: 'services', icon: 'services', labelKey: 'tabServices' },
  { name: 'events', icon: 'events', labelKey: 'tabEvents' },
  { name: 'profile', icon: 'profile', labelKey: 'tabProfile' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}>
      {TABS.map(tab => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const t = useT();

  return (
    <SafeAreaView edges={['bottom']} style={styles.barWrap}>
      <View style={styles.bar}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const tabMeta = TABS.find(tb => tb.name === route.name);
          if (!tabMeta) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
              <SymbolView
                name={ICONS[tabMeta.icon]}
                tintColor={focused ? BRAND.primary : BRAND.textMuted}
                size={22}
              />
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: focused ? BRAND.primary : BRAND.textMuted },
                ]}>
                {t(tabMeta.labelKey)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    backgroundColor: BRAND.bg,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 4 : 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  pressed: { opacity: 0.7 },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
