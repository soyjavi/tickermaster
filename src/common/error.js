import Store from './store';
import time from './time';

export default {
  FORBIDDEN: (res) => res.status(403).json({ message: 'Forbidden.' }),

  MESSAGE: (res, error = {}) => res.status(400).json({ message: error.message }),

  NOT_FOUND: (res) => res.status(404).json({ message: 'Resource not found.' }),

  REQUIRED_PARAMETERS: (res, parameters) => res.status(400).json({ message: `Required parameters: ${parameters}` }),

  store: (message) => {
    console.log('🔴', message);
    const { now } = time();

    const store = new Store({ filename: 'errors' });
    store.write({ ...store.read(), [now.toISOString()]: message });
  },

  UNKNOWN_SERVICE: (res) => res.status(400).json({ message: 'Unknown service.' }),
};
