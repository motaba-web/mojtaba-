
import { User, Listing, Report, AdminConfig, AppLanguage } from '../types';
import { DEFAULT_ADMIN_CONFIG } from '../constants';

const DB_KEYS = {
  USERS: 'sumsar_users',
  LISTINGS: 'sumsar_listings',
  REPORTS: 'sumsar_reports',
  CONFIG: 'sumsar_config',
  CURRENT_USER: 'sumsar_current_user',
  LANGUAGE: 'sumsar_lang'
};

export class DatabaseService {
  static getUsers(): User[] {
    const data = localStorage.getItem(DB_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  static saveUsers(users: User[]) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }

  static getListings(): Listing[] {
    const data = localStorage.getItem(DB_KEYS.LISTINGS);
    return data ? JSON.parse(data) : [];
  }

  static saveListings(listings: Listing[]) {
    localStorage.setItem(DB_KEYS.LISTINGS, JSON.stringify(listings));
  }

  static getReports(): Report[] {
    const data = localStorage.getItem(DB_KEYS.REPORTS);
    return data ? JSON.parse(data) : [];
  }

  static saveReports(reports: Report[]) {
    localStorage.setItem(DB_KEYS.REPORTS, JSON.stringify(reports));
  }

  static getConfig(): AdminConfig {
    const data = localStorage.getItem(DB_KEYS.CONFIG);
    return data ? JSON.parse(data) : DEFAULT_ADMIN_CONFIG;
  }

  static saveConfig(config: AdminConfig) {
    localStorage.setItem(DB_KEYS.CONFIG, JSON.stringify(config));
  }

  static getCurrentUser(): User | null {
    const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  static setCurrentUser(user: User | null) {
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  static getLanguage(): AppLanguage {
    return (localStorage.getItem(DB_KEYS.LANGUAGE) as AppLanguage) || AppLanguage.AR;
  }

  static setLanguage(lang: AppLanguage) {
    localStorage.setItem(DB_KEYS.LANGUAGE, lang);
  }

  static deleteListing(id: string) {
    const listings = this.getListings().filter(l => l.id !== id);
    this.saveListings(listings);
  }

  static addReport(report: Report) {
    const reports = this.getReports();
    reports.push(report);
    this.saveReports(reports);

    // Auto-delete logic: If listing has > 10 reports, delete it
    if (report.type === 'LISTING') {
      const listingReports = reports.filter(r => r.targetId === report.targetId && r.type === 'LISTING');
      if (listingReports.length >= 10) {
        this.deleteListing(report.targetId);
      }
    }
  }
}
