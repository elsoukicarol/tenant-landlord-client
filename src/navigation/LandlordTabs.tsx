import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BuildingDetailScreen } from '@/features/buildings/screens/BuildingDetailScreen';
import { BuildingsListScreen } from '@/features/buildings/screens/BuildingsListScreen';
import { LandlordExpenseDetailScreen } from '@/features/expenses/screens/LandlordExpenseDetailScreen';
import { LandlordExpensesScreen } from '@/features/expenses/screens/LandlordExpensesScreen';
import { InvitationsScreen } from '@/features/invitations/screens/InvitationsScreen';
import { NewInvitationScreen } from '@/features/invitations/screens/NewInvitationScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { LandlordDashboardScreen } from '@/features/portfolio/screens/LandlordDashboardScreen';
import { LanguagePickerScreen } from '@/features/profile/screens/LanguagePickerScreen';
import { NotificationsSettingsScreen } from '@/features/profile/screens/NotificationsSettingsScreen';
import { PersonalDetailsScreen } from '@/features/profile/screens/PersonalDetailsScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

import { tabIcon } from './tabIcons';
import type {
  LandlordBuildingsStackParamList,
  LandlordDashboardStackParamList,
  LandlordExpensesStackParamList,
  LandlordInvitationsStackParamList,
  LandlordNotificationsStackParamList,
  LandlordProfileStackParamList,
  LandlordTabParamList,
} from './types';

const Tab = createBottomTabNavigator<LandlordTabParamList>();

const Dashboard = createNativeStackNavigator<LandlordDashboardStackParamList>();
const Buildings = createNativeStackNavigator<LandlordBuildingsStackParamList>();
const Expenses = createNativeStackNavigator<LandlordExpensesStackParamList>();
const Invitations = createNativeStackNavigator<LandlordInvitationsStackParamList>();
const Notifications = createNativeStackNavigator<LandlordNotificationsStackParamList>();
const Profile = createNativeStackNavigator<LandlordProfileStackParamList>();

const stackOptions = {
  headerStyle: { backgroundColor: color.bg },
  headerShadowVisible: false,
  headerTitleStyle: { color: color.ink },
};

function DashboardStack() {
  return (
    <Dashboard.Navigator screenOptions={stackOptions}>
      <Dashboard.Screen
        name="LandlordDashboardIndex"
        component={LandlordDashboardScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="LandlordBuildingDetail"
        component={BuildingDetailScreen}
        options={{ title: '' }}
      />
    </Dashboard.Navigator>
  );
}

function BuildingsStack() {
  return (
    <Buildings.Navigator screenOptions={stackOptions}>
      <Buildings.Screen
        name="LandlordBuildingsList"
        component={BuildingsListScreen}
        options={{ headerShown: false }}
      />
      <Buildings.Screen
        name="LandlordBuildingDetail"
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
        name="LandlordExpensesList"
        component={LandlordExpensesScreen}
        options={{ headerShown: false }}
      />
      <Expenses.Screen
        name="LandlordExpenseDetail"
        component={LandlordExpenseDetailScreen}
        options={{ title: '' }}
      />
    </Expenses.Navigator>
  );
}

function InvitationsStack() {
  return (
    <Invitations.Navigator screenOptions={stackOptions}>
      <Invitations.Screen
        name="LandlordInvitationsList"
        component={InvitationsScreen}
        options={{ headerShown: false }}
      />
      <Invitations.Screen
        name="LandlordNewInvitation"
        component={NewInvitationScreen}
        options={{ presentation: 'modal', title: '' }}
      />
    </Invitations.Navigator>
  );
}

function NotificationsStack() {
  return (
    <Notifications.Navigator screenOptions={stackOptions}>
      <Notifications.Screen
        name="LandlordNotificationsList"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Notifications.Navigator>
  );
}

function ProfileStack() {
  return (
    <Profile.Navigator screenOptions={stackOptions}>
      <Profile.Screen
        name="LandlordProfileIndex"
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

export function LandlordTabs() {
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
        name="LandlordDashboard"
        component={DashboardStack}
        options={{ title: t('nav.dashboard'), tabBarIcon: tabIcon('stats-chart-outline') }}
      />
      <Tab.Screen
        name="LandlordBuildings"
        component={BuildingsStack}
        options={{ title: t('nav.buildings'), tabBarIcon: tabIcon('business-outline') }}
      />
      <Tab.Screen
        name="LandlordExpenses"
        component={ExpensesStack}
        options={{ title: t('nav.expenses'), tabBarIcon: tabIcon('receipt-outline') }}
      />
      <Tab.Screen
        name="LandlordInvitations"
        component={InvitationsStack}
        options={{ title: t('nav.invitations'), tabBarIcon: tabIcon('mail-outline') }}
      />
      <Tab.Screen
        name="LandlordNotifications"
        component={NotificationsStack}
        options={{ title: t('nav.notifications'), tabBarIcon: tabIcon('notifications-outline') }}
      />
      <Tab.Screen
        name="LandlordProfile"
        component={ProfileStack}
        options={{ title: t('nav.profile'), tabBarIcon: tabIcon('person-outline') }}
      />
    </Tab.Navigator>
  );
}
