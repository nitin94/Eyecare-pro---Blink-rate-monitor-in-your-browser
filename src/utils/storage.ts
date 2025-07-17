// Local storage utilities for data persistence

export interface SessionData {
  date: string;
  duration: number;
  totalBlinks: number;
  averageBlinkRate: number;
  eyeStrainLevel: 'low' | 'moderate' | 'high';
  breaksTaken: number;
}

export interface UserSettings {
  blinkThreshold: number;
  breakInterval: number; // in seconds
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  nudgesEnabled: boolean;
  nudgeFrequency: 'low' | 'medium' | 'high';
}

const STORAGE_KEYS = {
  SESSIONS: 'eyecare_sessions',
  SETTINGS: 'eyecare_settings',
  COMPLETED_EXERCISES: 'eyecare_exercises'
};

export class StorageManager {
  static saveSessions(sessions: SessionData[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  }

  static getSessions(): SessionData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        blinkThreshold: 0.25,
        breakInterval: 1200, // 20 minutes
        notificationsEnabled: true,
        soundEnabled: true,
        nudgesEnabled: true,
        nudgeFrequency: 'medium'
      };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {
        blinkThreshold: 0.25,
        breakInterval: 1200,
        notificationsEnabled: true,
        soundEnabled: true,
        nudgesEnabled: true,
        nudgeFrequency: 'medium'
      };
    }
  }

  static saveCompletedExercises(exercises: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_EXERCISES, JSON.stringify([...exercises]));
    } catch (error) {
      console.error('Failed to save completed exercises:', error);
    }
  }

  static getCompletedExercises(): Set<string> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_EXERCISES);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch (error) {
      console.error('Failed to load completed exercises:', error);
      return new Set();
    }
  }

  static addSession(session: SessionData): void {
    const sessions = this.getSessions();
    sessions.push(session);
    
    // Keep only last 30 sessions
    if (sessions.length > 30) {
      sessions.splice(0, sessions.length - 30);
    }
    
    this.saveSessions(sessions);
  }
}