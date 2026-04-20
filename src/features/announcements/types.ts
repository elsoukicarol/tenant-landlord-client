export const ANNOUNCEMENT_TYPES = ['GENERAL', 'MAINTENANCE', 'EMERGENCY', 'RULE_UPDATE'] as const;
export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number];

export type AnnouncementListItem = {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  createdAt: string;
  scheduledDate?: string | null;
  /** Tenant view: `readAt` is present (Date | null). Maintainer view: usually absent. */
  readAt?: string | null;
  createdBy?: { id: string; name: string };
  building?: { id: string; name: string };
  buildingId?: string;
};

export type Announcement = AnnouncementListItem;
