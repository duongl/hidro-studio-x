import { Project } from '../types';

// Native Promise-based IndexedDB interface for HidroStudioDB
const DB_NAME = 'HidroStudioDB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export const openDB = (): Promise<IDBDatabase> => {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('[DATABASE ERROR] Failed to open HidroStudioDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        
        // Create store for projects (indexed by unique id)
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        
        // Create store for brand assets
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
        
        // Create store for scripts/narrations
        if (!db.objectStoreNames.contains('scripts')) {
          db.createObjectStore('scripts', { keyPath: 'id' });
        }
        
        // Create store for video renders
        if (!db.objectStoreNames.contains('renders')) {
          db.createObjectStore('renders', { keyPath: 'id' });
        }
        
        console.log('[DATABASE UPGRADE] HidroStudioDB schemes initialized safely.');
      };
    } catch (e) {
      reject(e);
    }
  });
};

// Generates a robust UUID
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return 'pj_' + crypto.randomUUID().replace(/-/g, '').substring(0, 12);
  }
  return 'pj_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36).substring(4);
};

// --- PROJECTS STORE OPERATIONS ---

export const getStoredProjects = (): Promise<Project[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction('projects', 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.getAll();

      request.onsuccess = () => {
        const res = request.result || [];
        console.log('[PROJECT LOADED] Raw assets fetched from index:', res.length);
        resolve(res);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (err) {
      reject(err);
    }
  });
};

export const saveProjectToDB = (project: Project): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction('projects', 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.put(project);

      request.onsuccess = () => {
        console.log(`[PROJECT SAVED] Successfully committed ID: ${project.id} | Name: "${project.name}"`);
        resolve();
      };

      request.onerror = () => {
        console.error(`[DATABASE ERROR] Failed writing ID: ${project.id}`, request.error);
        reject(request.error);
      };
    } catch (err) {
      reject(err);
    }
  });
};

export const deleteProjectFromDB = (id: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction('projects', 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`[PROJECT DELETED] Purged project ID: ${id}`);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (err) {
      reject(err);
    }
  });
};

// --- MISC STORES HELPERS (assets, scripts, renders) ---

export const saveAssetItem = (id: string, assetData: any): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction('assets', 'readwrite');
      const store = transaction.objectStore('assets');
      const request = store.put({ id, ...assetData });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
};

export const getAssetItem = (id: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction('assets', 'readonly');
      const store = transaction.objectStore('assets');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
};
