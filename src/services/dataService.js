/**
 * JSON Data Management Service
 * Handles CRUD operations for all JSON data files
 * Provides abstraction layer for data persistence and retrieval
 */

import CryptoJS from 'crypto-js';

// Import initial data from JSON files
import usersData from '../../../users.json';
import reportsData from '../../../reports.json';
import securityAlertsData from '../../../security_alerts.json';
import therapySessionsData from '../../../therapy_sessions.json';
import missingPersonsData from '../../../missing_persons.json';
import forumPostsData from '../../../forum_posts.json';
import moodEntriesData from '../../../mood_entries.json';
import notificationsData from '../../../notifications.json';
import campusData from '../../../campus_data.json';
import analyticsData from '../../../analytics_data.json';

class DataService {
  constructor() {
    this.data = {};
    this.initialized = false;
    this.init();
  }

  /**
   * Initialize the data service with default data
   */
  init() {
    if (this.initialized) return;

    // Initialize with imported JSON data
    this.data = {
      users: usersData,
      reports: reportsData,
      security_alerts: securityAlertsData,
      therapy_sessions: therapySessionsData,
      missing_persons: missingPersonsData,
      forum_posts: forumPostsData,
      mood_entries: moodEntriesData,
      notifications: notificationsData,
      campus_data: campusData,
      analytics_data: analyticsData
    };

    // Load any persisted changes from localStorage
    this.loadPersistedData();

    this.initialized = true;
  }

  /**
   * Load persisted data from localStorage
   */
  loadPersistedData() {
    const persistedKeys = [
      'users', 'reports', 'security_alerts', 'therapy_sessions',
      'missing_persons', 'forum_posts', 'mood_entries', 'notifications',
      'campus_data', 'analytics_data'
    ];

    persistedKeys.forEach(key => {
      const persisted = localStorage.getItem(`data_${key}`);
      if (persisted) {
        try {
          const parsedData = JSON.parse(persisted);
          // Deep merge persisted data with initial data
          this.data[key] = this.deepMerge(this.data[key], parsedData);
        } catch (error) {
          console.error(`Error loading persisted data for ${key}:`, error);
        }
      }
    });
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const result = { ...target };
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });
    return result;
  }

  /**
   * Persist data to localStorage
   */
  persistData(key) {
    try {
      localStorage.setItem(`data_${key}`, JSON.stringify(this.data[key]));
    } catch (error) {
      console.error(`Error persisting data for ${key}:`, error);
    }
  }

  /**
   * Get all data for a specific collection
   */
  getAll(collection) {
    this.ensureInitialized();
    return JSON.parse(JSON.stringify(this.data[collection] || {}));
  }

  /**
   * Get a specific item by path (supports nested access like 'posts.post_1')
   */
  getByPath(collection, path) {
    this.ensureInitialized();
    const collectionData = this.data[collection];
    if (!collectionData) return null;

    const keys = path.split('.');
    let current = collectionData;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return null;
      }
    }

    return JSON.parse(JSON.stringify(current));
  }

  /**
   * Set data at a specific path
   */
  setByPath(collection, path, value) {
    this.ensureInitialized();
    const collectionData = this.data[collection];
    if (!collectionData) return false;

    const keys = path.split('.');
    let current = collectionData;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    const finalKey = keys[keys.length - 1];
    current[finalKey] = value;
    this.persistData(collection);
    return true;
  }

  /**
   * Create a new item in a collection
   */
  create(collection, item) {
    this.ensureInitialized();
    const id = item.id || this.generateId();
    const newItem = { ...item, id };

    if (collection === 'users') {
      this.data.users.users[id] = newItem;
    } else {
      // For other collections, assume they have sub-collections
      const subCollection = Object.keys(this.data[collection])[0];
      if (!this.data[collection][subCollection]) {
        this.data[collection][subCollection] = {};
      }
      this.data[collection][subCollection][id] = newItem;
    }

    this.persistData(collection);
    return newItem;
  }

  /**
   * Update an existing item
   */
  update(collection, path, updates) {
    this.ensureInitialized();
    const existingItem = this.getByPath(collection, path);
    if (!existingItem) {
      throw new Error(`Item not found: ${collection}/${path}`);
    }

    const updatedItem = {
      ...existingItem,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.setByPath(collection, path, updatedItem);
    return updatedItem;
  }

  /**
   * Delete an item
   */
  delete(collection, path) {
    this.ensureInitialized();
    const keys = path.split('.');
    const parentPath = keys.slice(0, -1).join('.');
    const keyToDelete = keys[keys.length - 1];

    const parent = this.getByPath(collection, parentPath);
    if (!parent || !(keyToDelete in parent)) {
      throw new Error(`Item not found: ${collection}/${path}`);
    }

    const deletedItem = parent[keyToDelete];
    delete parent[keyToDelete];
    this.setByPath(collection, parentPath, parent);
    return deletedItem;
  }

  /**
   * Query items with filters
   */
  query(collection, filters = {}) {
    this.ensureInitialized();
    const collectionData = this.data[collection];
    if (!collectionData) return [];

    // Get all items from sub-collections
    let allItems = [];
    Object.values(collectionData).forEach(subCollection => {
      if (typeof subCollection === 'object') {
        allItems = allItems.concat(Object.values(subCollection));
      }
    });

    // Apply filters
    return allItems.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (typeof value === 'function') {
          return value(item[key]);
        }
        return item[key] === value;
      });
    });
  }

  /**
   * Authenticate user
   */
  authenticateUser(email, password) {
    const users = Object.values(this.data.users.users || {});
    const hashedPassword = this.hashPassword(password);
    return users.find(user => user.email === email && user.password === hashedPassword) || null;
  }

  /**
   * Hash password
   */
  hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Ensure service is initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      this.init();
    }
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService;

// Export individual collection APIs
export const usersAPI = {
  getAll: () => dataService.getAll('users').users || {},
  getById: (id) => dataService.getByPath('users', `users.${id}`),
  create: (user) => dataService.create('users', user),
  update: (id, updates) => dataService.update('users', `users.${id}`, updates),
  delete: (id) => dataService.delete('users', `users.${id}`),
  authenticate: (email, password) => dataService.authenticateUser(email, password)
};

export const reportsAPI = {
  getAll: () => dataService.getAll('reports'),
  getIncidentReports: () => dataService.getAll('reports').incident_reports || {},
  getSecurityReports: () => dataService.getAll('reports').security_reports || {},
  getMissingPersonReports: () => dataService.getAll('reports').missing_person_reports || {},
  createIncidentReport: (report) => dataService.setByPath('reports', `incident_reports.${report.id}`, report),
  createSecurityReport: (report) => dataService.setByPath('reports', `security_reports.${report.id}`, report),
  createMissingPersonReport: (report) => dataService.setByPath('reports', `missing_person_reports.${report.id}`, report)
};

export const forumAPI = {
  getAllPosts: () => dataService.getAll('forum_posts').posts || {},
  getAllComments: () => dataService.getAll('forum_posts').comments || {},
  getPostById: (id) => dataService.getByPath('forum_posts', `posts.${id}`),
  createPost: (post) => dataService.setByPath('forum_posts', `posts.${post.id}`, post),
  updatePost: (id, updates) => dataService.update('forum_posts', `posts.${id}`, updates),
  deletePost: (id) => dataService.delete('forum_posts', `posts.${id}`),
  createComment: (comment) => dataService.setByPath('forum_posts', `comments.${comment.id}`, comment)
};

export const moodAPI = {
  getAll: () => dataService.getAll('mood_entries').entries || {},
  getUserEntries: (userId) => {
    const allEntries = dataService.getAll('mood_entries').entries || {};
    return Object.values(allEntries).filter(entry => entry.userId === userId);
  },
  saveEntry: (entry) => dataService.setByPath('mood_entries', `entries.${entry.id}`, entry),
  getStreak: (userId) => {
    const userData = dataService.getAll('mood_entries').user_streaks || {};
    return userData[userId] || '0';
  },
  updateStreak: (userId, streak) => {
    const userData = dataService.getAll('mood_entries').user_streaks || {};
    userData[userId] = streak.toString();
    dataService.setByPath('mood_entries', 'user_streaks', userData);
  },
  getBadges: (userId) => {
    const userData = dataService.getAll('mood_entries').user_badges || {};
    return userData[userId] || [];
  },
  updateBadges: (userId, badges) => {
    const userData = dataService.getAll('mood_entries').user_badges || {};
    userData[userId] = badges;
    dataService.setByPath('mood_entries', 'user_badges', userData);
  }
};

export const notificationsAPI = {
  getAll: () => dataService.getAll('notifications').notifications || {},
  getUserNotifications: (userId) => {
    const allNotifications = dataService.getAll('notifications').notifications || {};
    return Object.values(allNotifications).filter(notif => notif.userId === userId);
  },
  create: (notification) => dataService.setByPath('notifications', `notifications.${notification.id}`, notification),
  markAsRead: (id) => dataService.update('notifications', `notifications.${id}`, { isRead: true })
};

export const therapyAPI = {
  getAllAppointments: () => dataService.getAll('therapy_sessions').appointments || {},
  getAppointmentById: (id) => dataService.getByPath('therapy_sessions', `appointments.${id}`),
  createAppointment: (appointment) => dataService.setByPath('therapy_sessions', `appointments.${appointment.id}`, appointment),
  updateAppointment: (id, updates) => dataService.update('therapy_sessions', `appointments.${id}`, updates),
  getTherapistAvailability: (therapistId) => dataService.getByPath('therapy_sessions', `therapist_availability.${therapistId}`),
  getGroupSessions: () => dataService.getAll('therapy_sessions').group_sessions || {}
};

export const securityAPI = {
  getActiveAlerts: () => dataService.getAll('security_alerts').active_alerts || {},
  getHistoricalAlerts: () => dataService.getAll('security_alerts').historical_alerts || {},
  createAlert: (alert) => dataService.setByPath('security_alerts', `active_alerts.${alert.id}`, alert),
  resolveAlert: (id) => {
    const alert = dataService.getByPath('security_alerts', `active_alerts.${id}`);
    if (alert) {
      dataService.delete('security_alerts', `active_alerts.${id}`);
      const resolvedAlert = { ...alert, status: 'resolved', resolvedAt: new Date().toISOString() };
      dataService.setByPath('security_alerts', `historical_alerts.${id}`, resolvedAlert);
      return resolvedAlert;
    }
    return null;
  }
};

export const resourcesAPI = {
  getAll: () => dataService.getAll('resources') || [],
  create: (resource) => dataService.create('resources', resource),
  update: (id, updates) => dataService.update('resources', `resources.${id}`, updates),
  delete: (id) => dataService.delete('resources', `resources.${id}`)
};

export const systemSettingsAPI = {
  getAll: () => dataService.getAll('system_settings') || {},
  update: (settings) => {
    const current = dataService.getAll('system_settings') || {};
    const updated = { ...current, ...settings };
    dataService.setByPath('system_settings', '', updated);
    return updated;
  }
};

export const auditLogsAPI = {
  getAll: () => dataService.getAll('audit_logs') || [],
  add: (log) => {
    const current = dataService.getAll('audit_logs') || [];
    const updated = [log, ...current];
    dataService.setByPath('audit_logs', '', updated);
    return updated;
  }
};

export const categoriesAPI = {
  getAll: () => dataService.getAll('categories') || ["stress", "depression", "study", "relationships", "anxiety", "sleep", "self-esteem"],
  update: (categories) => {
    dataService.setByPath('categories', '', categories);
    return categories;
  }
};

export const loginAttemptsAPI = {
  getAll: () => dataService.getAll('login_attempts') || [],
  add: (attempt) => {
    const current = dataService.getAll('login_attempts') || [];
    const updated = [...current, attempt];
    dataService.setByPath('login_attempts', '', updated);
    return updated;
  }
};

export const flaggedActivitiesAPI = {
  getAll: () => dataService.getAll('flagged_activities') || [],
  add: (activity) => {
    const current = dataService.getAll('flagged_activities') || [];
    const updated = [...current, activity];
    dataService.setByPath('flagged_activities', '', updated);
    return updated;
  },
  update: (id, updates) => {
    const current = dataService.getAll('flagged_activities') || [];
    const updated = current.map(activity =>
      activity.id === id ? { ...activity, ...updates } : activity
    );
    dataService.setByPath('flagged_activities', '', updated);
    return updated;
  }
};

export const aiChatsAPI = {
  getAll: () => dataService.getAll('ai_chats') || [],
  add: (chat) => {
    const current = dataService.getAll('ai_chats') || [];
    const updated = [...current, chat];
    dataService.setByPath('ai_chats', '', updated);
    return updated;
  }
};