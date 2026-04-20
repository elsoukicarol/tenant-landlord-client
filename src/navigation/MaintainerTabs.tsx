import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AnnouncementDetailScreen } from '@/features/announcements/screens/AnnouncementDetailScreen';
import { CreateAnnouncementScreen } from '@/features/announcements/screens/CreateAnnouncementScreen';
import { MaintainerAnnouncementsScreen } from '@/features/announcements/screens/MaintainerAnnouncementsScreen';
import { BuildingDetailScreen } from '@/features/buildings/screens/BuildingDetailScreen';
import { BuildingsListScreen } from '@/features/buildings/screens/BuildingsListScreen';
import { CreateExpenseScreen } from '@/features/expenses/screens/CreateExpenseScreen';
import { ExpensesListScreen } from '@/features/expenses/screens/ExpensesListScreen';
import { InvitationsScreen } from '@/features/invitations/screens/InvitationsScreen';
import { NewInvitationScreen } from '@/features/invitations/screens/NewInvitationScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { LanguagePickerScreen } from '@/features/profile/screens/LanguagePickerScreen';
import { NotificationsSettingsScreen } from '@/features/profile/screens/NotificationsSettingsScreen';
import { PersonalDetailsScreen } from '@/features/profile/screens/PersonalDetailsScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { MaintainerHomeScreen } from '@/features/requests/screens/MaintainerHomeScreen';
import { MaintainerRequestsScreen } from '@/features/requests/screens/MaintainerRequestsScreen';
import { RequestDetailScreen } from '@/features/requests/screens/RequestDetailScreen';
import { ResolveRequestScreen } from '@/features/requests/screens/ResolveRequestScreen';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

import { tabIcon } from './tabIcons';
import type {
  MaintainerBuildingsStackParamList,
  MaintainerExpensesStackParamList,
  MaintainerHomeStackParamList,
  MaintainerInvitationsStackParamList,
  MaintainerProfileStackParamList,
  MaintainerRequestsStackParamList,
  MaintainerTabParamList,
} from './types';

const Tab = createBottomTabNavigator<MaintainerTabParamList>();

const Home = createNativeStackNavigator<MaintainerHomeStackParamList>();
const Requests = createNativeStackNavigator<MaintainerRequestsStackParamList>();
const Buildings = createNativeStackNavigator<MaintainerBuildingsStackParamList>();
const Expenses = createNativeStackNavigator<MaintainerExpensesStackParamList>();
const Invitations = createNativeStackNavigator<MaintainerInvitationsStackParamList>();
const Profile = createNativeStackNavigator<MaintainerProfileStackParamList>();

const stackOptions = {
  headerStyle: { backgroundColor: color.bg },
  headerShadowVisible: false,
  headerTitleStyle: { color: color.ink },
};

function HomeStack() {
  return (
    <Home.Navigator screenOptions={stackOptions}>
      <Home.Screen
        name="MaintainerHomeIndex"
        component={MaintainerHomeScreen}
        options={{ headerShown: false }}
      />
      <Home.Screen
        name="MaintainerRequestDetail"
        component={RequestDetailScreen}
        options={{ title: '' }}
      />
      <Home.Screen
        name="MaintainerResolveRequest"
        component={ResolveRequestScreen}
        options={{ presentation: 'modal', title: '' }}
      />
      <Home.Screen
        name="MaintainerAnnouncementsList"
        component={MaintainerAnnouncementsScreen}
        options={{ title: '' }}
      />
      <Home.Screen
        name="MaintainerAnnouncementDetail"
        component={AnnouncementDetailScreen}
        options={{ title: '' }}
      />
      <Home.Screen
        name="MaintainerCreateAnnouncement"
        component={CreateAnnouncementScreen}
        options={{ presentation: 'modal', headerShown: false }}
      />
      <Home.Screen
        name="MaintainerNotificationsList"
        component={NotificationsScreen}
        options={{ title: '' }}
      />
    </Home.Navigator>
  );
}

function RequestsStack() {
  return (
    <Requests.Navigator screenOptions={stackOptions}>
      <Requests.Screen
        name="MaintainerRequestsList"
        component={MaintainerRequestsScreen}
        options={{ headerShown: false }}
      />
      <Requests.Screen
        name="MaintainerRequestDetail"
        component={RequestDetailScreen}
        options={{ title: '' }}
      />
      <Requests.Screen
        name="MaintainerResolveRequest"
        component={ResolveRequestScreen}
        options={{ presentation: 'modal', title: '' }}
      />
    </Requests.Navigator>
  );
}

function BuildingsStack() {
  return (
    <Buildings.Navigator screenOptions={stackOptions}>
      <Buildings.Screen
        name="MaintainerBuildingsList"
        component={BuildingsListScreen}
        options={{ headerShown: false }}
      />
      <Buildings.Screen
        name="MaintainerBuildingDetail"
        component={BuildingDetailScreen}
        options={{ title: '' }}
      />
    </Buildings.Navigator>
  );
}

function ExpensesStack() {
  return (
    <Expenses.Navigator screenOptions={stackOptions}>
      <Expenses.Screen
        name="MaintainerExpensesList"
        component={ExpensesListScreen}
        options={{ headerShown: false }}
      />
      <Expenses.Screen
        name="MaintainerCreateExpense"
        component={CreateExpenseScreen}
        options={{ presentation: 'modal', title: '' }}
      />
    </Expenses.Navigator>
  );
}

function InvitationsStack() {
  return (
    <Invitations.Navigator screenOptions={stackOptions}>
      <Invitations.Screen
        name="MaintainerInvitationsList"
        component={InvitationsScreen}
        options={{ headerShown: false }}
      />
      <Invitations.Screen
        name="MaintainerNewInvitation"
        component={NewInvitationScreen}
        options={{ presentation: 'modal', title: '' }}
      />
    </Invitations.Navigator>
  );
}

function ProfileStack() {
  return (
    <Profile.Navigator screenOptions={stackOptions}>
      <Profile.Screen
        name="MaintainerProfileIndex"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Profile.Screen
        name="ProfilePersonalDetails"
        component={PersonalDetailsScreen}
        options={{ title: '' }}
      />
      <Profile.Screen
        name="ProfileNotifications"
        component={NotificationsSettingsScreen}
        options={{ title: '' }}
      />
      <Profile.Screen
        name="ProfileLanguage"
        component={LanguagePickerScreen}
        options={{ title: '' }}
      />
    </Profile.Navigator>
  );
}

export function MaintainerTabs() {
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
        name="MaintainerHome"
        component={HomeStack}
        options={{ title: t('nav.home'), tabBarIcon: tabIcon('home-outline') }}
      />
      <Tab.Screen
        name="MaintainerRequests"
        component={RequestsStack}
        options={{ title: t('nav.requests'), tabBarIcon: tabIcon('construct-outline') }}
      />
      <Tab.Screen
        name="MaintainerBuildings"
        component={BuildingsStack}
        options={{ title: t('nav.buildings'), tabBarIcon: tabIcon('business-outline') }}
      />
      <Tab.Screen
        name="MaintainerExpenses"
        component={ExpensesStack}
        options={{ title: t('nav.expenses'), tabBarIcon: tabIcon('receipt-outline') }}
      />
      <Tab.Screen
        name="MaintainerInvitations"
        component={InvitationsStack}
        options={{ title: t('nav.invitations'), tabBarIcon: tabIcon('mail-outline') }}
      />
      <Tab.Screen
        name="MaintainerProfile"
        component={ProfileStack}
        options={{ title: t('nav.profile'), tabBarIcon: tabIcon('person-outline') }}
      />
    </Tab.Navigator>
  );
}
