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
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { t } from '@/lib/i18n';
import { color } from '@/theme';

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
        options={{ title: t('nav.dashboard') }}
      />
      <Tab.Screen
        name="LandlordBuildings"
        component={BuildingsStack}
        options={{ title: t('nav.buildings') }}
      />
      <Tab.Screen
        name="LandlordExpenses"
        component={ExpensesStack}
        options={{ title: t('nav.expenses') }}
      />
      <Tab.Screen
        name="LandlordInvitations"
        component={InvitationsStack}
        options={{ title: t('nav.invitations') }}
      />
      <Tab.Screen
        name="LandlordNotifications"
        component={NotificationsStack}
        options={{ title: t('nav.notifications') }}
      />
      <Tab.Screen
        name="LandlordProfile"
        component={ProfileStack}
        options={{ title: t('nav.profile') }}
      />
    </Tab.Navigator>
  );
}
