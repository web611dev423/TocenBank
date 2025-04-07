let storage: Storage | null = null;

if (typeof window !== 'undefined') {
  storage = window.localStorage;
}

export default storage;