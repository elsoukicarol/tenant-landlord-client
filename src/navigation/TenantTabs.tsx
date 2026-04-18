import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AnnouncementDetailScreen } from '@/features/announcements/screens/AnnouncementDetailScreen';
import { AnnouncementsListScreen } from '@/features/announcements/screens/AnnouncementsListScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { TenantHomeScreen } from '@/features/requests/screens/HomeScreen';
import { MyRequestsScreen } from '@/features/requests/screens/MyRequestsScreen';
import { RequestDetailScreen } from '@/features/requests/screens/RequestDetailScreen';
import { SubmitRequestScreen } from '@/features/requests/screens/SubmitRequestScreen';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

import type {
  TenantAnnouncementsStackParamList,
  TenantHomeStackParamList,
  TenantNotificationsStackParamList,
  TenantProfileStackParamList,
  TenantRequestsStackParamList,
  TenantTabParamList,
} from './types';

const Tab = createBottomTabNavigator<TenantTabParamList>();
const HomeStack = createNativeStackNavigator<TenantHomeStackParamList>();
const RequestsStack = createNativeStackNavigator<TenantRequestsStackParamList>();
const AnnouncementsStack = createNativeStackNavigator<TenantAnnouncementsStackParamList>();
const NotificationsStack = createNativeStackNavigator<TenantNotificationsStackParamList>();
const ProfileStack = createNativeStackNavigator<TenantProfileStackParamList>();

const stackOptions = {
  headerStyle: { backgroundColor: color.bg },
  headerShadowVisible: false,
  headerTitleStyle: { color: color.ink },
};

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen
        name="TenantHomeIndex"
        component={TenantHomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="TenantRequestDetail"
        component={RequestDetailScreen}
        options={{ title: '' }}
      />
    </HomeStack.Navigator>
  );
}

function RequestsStackScreen() {
  return (
    <RequestsStack.Navigator screenOptions={stackOptions}>
      <RequestsStack.Screen
        name="TenantRequestsList"
        component={MyRequestsScreen}
        options={{ headerShown: false }}
      />
      <RequestsStack.Screen
        name="TenantSubmitRequest"
        component={SubmitRequestScreen}
        options={{ presentation: 'modal', title: '' }}
      />
      <RequestsStack.Screen
        name="TenantRequestDetail"
        component={RequestDetailScreen}
        options={{ title: '' }}
      />
    </RequestsStack.Navigator>
  );
}

function AnnouncementsStackScreen() {
  return (
    <AnnouncementsStack.Navigator screenOptions={stackOptions}>
      <AnnouncementsStack.Screen
        name="TenantAnnouncementsList"
        component={AnnouncementsListScreen}
        options={{ headerShown: false }}
      />
      <AnnouncementsStack.Screen
        name="TenantAnnouncementDetail"
        component={AnnouncementDetailScreen}
        options={{ title: '' }}
      />
    </AnnouncementsStack.Navigator>
  );
}

function NotificationsStackScreen() {
  return (
    <NotificationsStack.Navigator screenOptions={stackOptions}>
      <NotificationsStack.Screen
        name="TenantNotificationsList"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </NotificationsStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={stackOptions}>
      <ProfileStack.Screen
        name="TenantProfileIndex"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );
}

export function TenantTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.ink,
        tabBarInactiveTintColor: color.inkMute,
        tabBarStyle: { backgroundColor: color.paper, borderTopColor: color.line },
      }}
    >
      <Tab.Screen
        name="TenantHome"
        component={HomeStackScreen}
        options={{ title: t('nav.home') }}
      />
      <Tab.Screen
        name="TenantRequests"
        component={RequestsStackScreen}
        options={{ title: t('nav.requests') }}
      />
      <Tab.Screen
        name="TenantAnnouncements"
        component={AnnouncementsStackScreen}
        options={{ title: t('nav.announcements') }}
      />
      <Tab.Screen
        name="TenantNotifications"
        component={NotificationsStackScreen}
        options={{ title: t('nav.notifications') }}
      />
      <Tab.Screen
        name="TenantProfile"
        component={ProfileStackScreen}
        options={{ title: t('nav.profile') }}
      />
    </Tab.Navigator>
  );
}
