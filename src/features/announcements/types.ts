export const ANNOUNCEMENT_TYPES = ['GENERAL', 'MAINTENANCE', 'URGENT', 'EMERGENCY'] as const;
export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number];

export type AnnouncementListItem = {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  createdAt: string;
  isRead: boolean;
  createdBy?: { id: string; name: string };
  building?: { id: string; name: string };
};

export type Announcement = AnnouncementListItem;
