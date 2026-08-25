import {
  UserProfileSettings,
  AccountSettings,
  CompanySettings,
  NotificationPreferences,
  EmailSettingsConfig,
  CalendarSettings,
  SecuritySettings,
  CRMPreferences,
} from '../types/settings-types';
import {
  UserProfileFormValues,
  AccountSettingsFormValues,
  CompanySettingsFormValues,
  NotificationPreferencesFormValues,
  CalendarSettingsFormValues,
  ChangePasswordFormValues,
  CRMPreferencesFormValues,
} from '../schemas/settings-schemas';

export class SettingsService {
  // 1. Profile Settings
  static async getProfile(): Promise<UserProfileSettings> {
    const res = await fetch('/api/settings/profile');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch profile settings');
    }
    const data = await res.json();
    return data.profile;
  }

  static async updateProfile(values: UserProfileFormValues): Promise<UserProfileSettings> {
    const res = await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update profile');
    }
    const data = await res.json();
    return data.profile;
  }

  // 2. Account Settings
  static async getAccountSettings(): Promise<AccountSettings> {
    const res = await fetch('/api/settings/account');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch account settings');
    }
    const data = await res.json();
    return data.settings;
  }

  static async updateAccountSettings(values: AccountSettingsFormValues): Promise<AccountSettings> {
    const res = await fetch('/api/settings/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update account settings');
    }
    const data = await res.json();
    return data.settings;
  }

  // 3. Company Settings
  static async getCompanySettings(): Promise<CompanySettings> {
    const res = await fetch('/api/settings/company');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch company settings');
    }
    const data = await res.json();
    return data.company;
  }

  static async updateCompanySettings(values: CompanySettingsFormValues): Promise<CompanySettings> {
    const res = await fetch('/api/settings/company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update company settings');
    }
    const data = await res.json();
    return data.company;
  }

  // 4. Notification Preferences
  static async getNotificationPreferences(): Promise<NotificationPreferences> {
    const res = await fetch('/api/settings/notifications');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch notification preferences');
    }
    const data = await res.json();
    return data.preferences;
  }

  static async updateNotificationPreferences(
    values: NotificationPreferencesFormValues
  ): Promise<NotificationPreferences> {
    const res = await fetch('/api/settings/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update notification preferences');
    }
    const data = await res.json();
    return data.preferences;
  }

  // 5. Email Configuration
  static async getEmailConfig(): Promise<EmailSettingsConfig> {
    const res = await fetch('/api/settings/email');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch email settings');
    }
    const data = await res.json();
    return data.config;
  }

  static async sendTestEmail(recipientEmail: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/settings/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientEmail }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send test email');
    }
    return res.json();
  }

  // 6. Calendar Settings
  static async getCalendarSettings(): Promise<CalendarSettings> {
    const res = await fetch('/api/settings/calendar');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch calendar settings');
    }
    const data = await res.json();
    return data.calendar;
  }

  static async updateCalendarSettings(values: CalendarSettingsFormValues): Promise<CalendarSettings> {
    const res = await fetch('/api/settings/calendar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update calendar settings');
    }
    const data = await res.json();
    return data.calendar;
  }

  // 7. Security Settings & Password Change
  static async getSecuritySettings(): Promise<SecuritySettings> {
    const res = await fetch('/api/settings/security');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch security settings');
    }
    const data = await res.json();
    return data.security;
  }

  static async changePassword(values: ChangePasswordFormValues): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/settings/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to change password');
    }
    return res.json();
  }

  // 8. CRM Preferences
  static async getCRMPreferences(): Promise<CRMPreferences> {
    const res = await fetch('/api/settings/crm');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch CRM preferences');
    }
    const data = await res.json();
    return data.preferences;
  }

  static async updateCRMPreferences(values: CRMPreferencesFormValues): Promise<CRMPreferences> {
    const res = await fetch('/api/settings/crm', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update CRM preferences');
    }
    const data = await res.json();
    return data.preferences;
  }
}
