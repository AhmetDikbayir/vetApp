import { EventSubscription } from 'react-native';

export type EventCallback<T = any> = (event: T) => void;

export class EventManager {
  private listeners: Map<string, EventCallback[]> = new Map();

  addEventListener<T>(eventName: string, callback: EventCallback<T>): EventSubscription {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    const callbacks = this.listeners.get(eventName)!;
    callbacks.push(callback);

    return {
      remove: () => {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  removeEventListener(eventName: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit<T>(eventName: string, event: T): void {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventManager = new EventManager(); 