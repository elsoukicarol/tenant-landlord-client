export type DeepLink = {
  requestId?: string;
  announcementId?: string;
  proposalId?: string;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  deepLink?: DeepLink | null;
  isRead: boolean;
  createdAt: string;
};
