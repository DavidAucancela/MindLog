import { Tabs } from 'expo-router';
import { T } from '@/constants/theme';

// Iconos SVG línea fina (Phosphor-style) como React Native no soporta SVG inline
// usamos Ionicons como fallback — el trazado es similar al diseño
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function icon(active: IoniconsName, inactive: IoniconsName) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={size} color={color} />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: T.ink,
        tabBarInactiveTintColor: T.ink3,
        tabBarStyle: {
          backgroundColor: T.bg,
          borderTopColor: T.border,
          borderTopWidth: 0.5,
          elevation: 0,
        },
        headerStyle: { backgroundColor: T.bg },
        headerTintColor: T.ink,
        headerShadowVisible: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.3,
          textTransform: 'lowercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'inicio',
          tabBarIcon: icon('home', 'home-outline'),
        }}
      />
      <Tabs.Screen
        name="nueva"
        options={{
          title: 'escribir',
          tabBarIcon: icon('create', 'create-outline'),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'diario',
          tabBarIcon: icon('chatbubble-ellipses', 'chatbubble-ellipses-outline'),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'tú',
          tabBarIcon: icon('person', 'person-outline'),
        }}
      />
    </Tabs>
  );
}
