export interface AccountNotificationPrefs {
  emailSummary: boolean;
  push: boolean;
  dueReminder: boolean;
}

export interface AccountProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  cdiBaseRate: number;
  notifications: AccountNotificationPrefs;
}
