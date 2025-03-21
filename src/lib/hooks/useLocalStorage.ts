import { useState, useEffect, useCallback } from "react";

// Type for the storage options
type UseLocalStorageOptions = {
  // If true, will parse the value as JSON
  parseJson?: boolean;
  // If provided, will be used as the default value when the key doesn't exist
  defaultValue?: any;
  // If true, will sync the value across tabs
  syncAcrossTabs?: boolean;
  // Optional serializer function
  serializer?: (value: any) => string;
  // Optional deserializer function
  deserializer?: (value: string) => any;
};

/**
 * A hook for interacting with localStorage with type safety and error handling
 *
 * @param key The localStorage key to use
 * @param options Configuration options
 * @returns A tuple containing the value and setter function
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions = {},
): [
  T | undefined,
  (value: T | ((val: T | undefined) => T)) => void,
  () => void,
] {
  const {
    parseJson = true,
    defaultValue = undefined,
    syncAcrossTabs = false,
    serializer = JSON.stringify,
    deserializer = JSON.parse,
  } = options;

  // Create a function to get the value from localStorage
  const getStoredValue = useCallback((): T | undefined => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);

      // Parse stored json or return as-is
      if (item) {
        if (parseJson) {
          return deserializer(item);
        }
        return item as unknown as T;
      }

      // If no stored value, return the default
      return defaultValue as T;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue as T;
    }
  }, [key, parseJson, defaultValue, deserializer]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T | undefined>();

  // Initialize the state on mount
  useEffect(() => {
    setStoredValue(getStoredValue());
  }, [getStoredValue]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T | undefined) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (valueToStore === undefined) {
          window.localStorage.removeItem(key);
        } else {
          const serialized = parseJson
            ? serializer(valueToStore)
            : String(valueToStore);
          window.localStorage.setItem(key, serialized);
        }

        // Dispatch a custom event for cross-tab sync if enabled
        if (syncAcrossTabs) {
          window.dispatchEvent(
            new StorageEvent("storage", {
              key,
              newValue:
                valueToStore === undefined ? null : String(valueToStore),
              storageArea: localStorage,
            }),
          );
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, parseJson, serializer, storedValue, syncAcrossTabs],
  );

  // Function to remove the item from localStorage
  const removeItem = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(undefined);

      // Dispatch a custom event for cross-tab sync if enabled
      if (syncAcrossTabs) {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key,
            newValue: null,
            storageArea: localStorage,
          }),
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, syncAcrossTabs]);

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === localStorage) {
        try {
          const newValue = e.newValue
            ? parseJson
              ? deserializer(e.newValue)
              : e.newValue
            : undefined;
          setStoredValue(newValue as T);
        } catch (error) {
          console.error(
            `Error handling storage change for key "${key}":`,
            error,
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, parseJson, deserializer, syncAcrossTabs]);

  return [storedValue, setValue, removeItem];
}
