import { writable } from 'svelte/store';

// Define types for our store
export interface UserSessionState {
  mantra: string;
  sessionCount: number;
  notificationTimes: string[];
  frequency: 'daily' | 'weekly' | 'custom';
  lastSessionDate: string | null;
  startDate: string;
}

// Get saved data from localStorage or use defaults
const getSavedUserData = (): UserSessionState => {
  if (typeof window !== 'undefined') {
    const savedData = localStorage.getItem('userSessionData');
    
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Error parsing saved user data:', e);
      }
    }
  }
  
  // Default values
  return {
    mantra: '',
    sessionCount: 0,
    notificationTimes: [],
    frequency: 'daily',
    lastSessionDate: null,
    startDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  };
};

// Initialize the store with default or saved values
const initialState: UserSessionState = getSavedUserData();

// Create the user session store
const createUserSessionStore = () => {
  const { subscribe, set, update } = writable<UserSessionState>(initialState);
  
  return {
    subscribe,
    
    // Save mantra
    saveMantra: (text: string) => {
      update(state => {
        const updatedState = {
          ...state,
          mantra: text
        };
        
        localStorage.setItem('userSessionData', JSON.stringify(updatedState));
        return updatedState;
      });
    },
    
    // Add notification time
    addNotificationTime: (time: string) => {
      update(state => {
        // Only add if not already in the array
        if (!state.notificationTimes.includes(time)) {
          const updatedState = {
            ...state,
            notificationTimes: [...state.notificationTimes, time]
          };
          
          localStorage.setItem('userSessionData', JSON.stringify(updatedState));
          return updatedState;
        }
        return state;
      });
    },
    
    // Remove notification time
    removeNotificationTime: (time: string) => {
      update(state => {
        const updatedState = {
          ...state,
          notificationTimes: state.notificationTimes.filter(t => t !== time)
        };
        
        localStorage.setItem('userSessionData', JSON.stringify(updatedState));
        return updatedState;
      });
    },
    
    // Increment session count
    completeSession: () => {
      update(state => {
        const today = new Date().toISOString().split('T')[0];
        const updatedState = {
          ...state,
          sessionCount: state.sessionCount + 1,
          lastSessionDate: today
        };
        
        localStorage.setItem('userSessionData', JSON.stringify(updatedState));
        return updatedState;
      });
    },
    
    // Update frequency setting
    setFrequency: (frequency: 'daily' | 'weekly' | 'custom') => {
      update(state => {
        const updatedState = {
          ...state,
          frequency
        };
        
        localStorage.setItem('userSessionData', JSON.stringify(updatedState));
        return updatedState;
      });
    },
    
    // Reset all data
    reset: () => {
      const defaultState = {
        mantra: '',
        sessionCount: 0,
        notificationTimes: [],
        frequency: 'daily' as const,
        lastSessionDate: null,
        startDate: new Date().toISOString().split('T')[0]
      };
      
      localStorage.setItem('userSessionData', JSON.stringify(defaultState));
      set(defaultState);
    }
  };
};

export const userSessionStore = createUserSessionStore();