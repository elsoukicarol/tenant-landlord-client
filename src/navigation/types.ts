import type { NavigatorScreenParams } from '@react-navigation/native';

export type UnauthedStackParamList = {
  SignIn: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  InvitationAccept: { token: string };
};

export type TenantHomeStackParamList = {
  TenantHomeIndex: undefined;
  TenantRequestDetail: { id: string };
};

export type TenantRequestsStackParamList = {
  TenantRequestsList: undefined;
  TenantSubmitRequest: undefined;
  TenantRequestDetail: { id: string };
};

export type TenantAnnouncementsStackParamList = {
  TenantAnnouncementsList: undefined;
  TenantAnnouncementDetail: { id: string };
};

export type TenantNotificationsStackParamList = {
  TenantNotificationsList: undefined;
};

export type TenantProfileStackParamList = {
  TenantProfileIndex: undefined;
};

export type TenantTabParamList = {
  TenantHome: NavigatorScreenParams<TenantHomeStackParamList>;
  TenantRequests: NavigatorScreenParams<TenantRequestsStackParamList>;
  TenantAnnouncements: NavigatorScreenParams<TenantAnnouncementsStackParamList>;
  TenantNotifications: NavigatorScreenParams<TenantNotificationsStackParamList>;
  TenantProfile: NavigatorScreenParams<TenantProfileStackParamList>;
};

// ---- Maintainer stacks ----

export type MaintainerHomeStackParamList = {
  MaintainerHomeIndex: undefined;
  MaintainerRequestDetail: { id: string };
  MaintainerResolveRequest: { id: string };
};

export type MaintainerRequestsStackParamList = {
  MaintainerRequestsList: undefined;
  MaintainerRequestDetail: { id: string };
  MaintainerResolveRequest: { id: string };
};

export type MaintainerBuildingsStackParamList = {
  MaintainerBuildingsList: undefined;
  MaintainerBuildingDetail: { id: string };
};

export type MaintainerExpensesStackParamList = {
  MaintainerExpensesList: undefined;
  MaintainerCreateExpense: undefined;
};

export type MaintainerAnnouncementsStackParamList = {
  MaintainerAnnouncementsList: undefined;
  MaintainerAnnouncementDetail: { id: string };
  MaintainerCreateAnnouncement: undefined;
};

export type MaintainerInvitationsStackParamList = {
  MaintainerInvitationsList: undefined;
  MaintainerNewInvitation: undefined;
};

export type MaintainerProfileStackParamList = {
  MaintainerProfileIndex: undefined;
};

export type MaintainerNotificationsStackParamList = {
  MaintainerNotificationsList: undefined;
};

export type MaintainerTabParamList = {
  MaintainerHome: NavigatorScreenParams<MaintainerHomeStackParamList>;
  MaintainerRequests: NavigatorScreenParams<MaintainerRequestsStackParamList>;
  MaintainerBuildings: NavigatorScreenParams<MaintainerBuildingsStackParamList>;
  MaintainerExpenses: NavigatorScreenParams<MaintainerExpensesStackParamList>;
  MaintainerAnnouncements: NavigatorScreenParams<MaintainerAnnouncementsStackParamList>;
  MaintainerInvitations: NavigatorScreenParams<MaintainerInvitationsStackParamList>;
  MaintainerNotifications: NavigatorScreenParams<MaintainerNotificationsStackParamList>;
  MaintainerProfile: NavigatorScreenParams<MaintainerProfileStackParamList>;
};

// ---- Landlord stacks ----

export type LandlordDashboardStackParamList = {
  LandlordDashboardIndex: undefined;
  LandlordBuildingDetail: { id: string };
};

export type LandlordBuildingsStackParamList = {
  LandlordBuildingsList: undefined;
  LandlordBuildingDetail: { id: string };
};

export type LandlordExpensesStackParamList = {
  LandlordExpensesList: undefined;
  LandlordExpenseDetail: { id: string };
};

export type LandlordInvitationsStackParamList = {
  LandlordInvitationsList: undefined;
  LandlordNewInvitation: undefined;
};

export type LandlordNotificationsStackParamList = {
  LandlordNotificationsList: undefined;
};

export type LandlordProfileStackParamList = {
  LandlordProfileIndex: undefined;
};

export type LandlordTabParamList = {
  LandlordDashboard: NavigatorScreenParams<LandlordDashboardStackParamList>;
  LandlordBuildings: NavigatorScreenParams<LandlordBuildingsStackParamList>;
  LandlordExpenses: NavigatorScreenParams<LandlordExpensesStackParamList>;
  LandlordInvitations: NavigatorScreenParams<LandlordInvitationsStackParamList>;
  LandlordNotifications: NavigatorScreenParams<LandlordNotificationsStackParamList>;
  LandlordProfile: NavigatorScreenParams<LandlordProfileStackParamList>;
};

export type RootStackParamList = {
  Unauthed: NavigatorScreenParams<UnauthedStackParamList>;
  TenantRoot: NavigatorScreenParams<TenantTabParamList>;
  MaintainerRoot: NavigatorScreenParams<MaintainerTabParamList>;
  LandlordRoot: NavigatorScreenParams<LandlordTabParamList>;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
