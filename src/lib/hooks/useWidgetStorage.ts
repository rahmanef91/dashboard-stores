import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

// Type for widget storage data
export interface WidgetStorageData<T = any> {
  data: T;
  metadata: {
    widgetId: string;
    instanceId: string;
    version: string;
    createdAt: string;
    updatedAt: string;
    schema?: string;
  };
}

// Options for the useWidgetStorage hook
export interface UseWidgetStorageOptions<T> {
  // The widget ID
  widgetId: string;
  // The instance ID of the widget
  instanceId: string;
  // Storage key suffix (to allow multiple storage areas per widget)
  storageName?: string;
  // Initial data to use if no data exists in storage
  initialData?: T;
  // Schema version for data migrations
  schemaVersion?: string;
  // Whether to sync data across tabs
  syncAcrossTabs?: boolean;
  // Optional migration function for handling schema changes
  migrate?: (data: any, fromVersion: string, toVersion: string) => T;
}

/**
 * A hook for widget-specific data storage with versioning and migration capabilities
 *
 * @param options Configuration options
 * @returns Object containing the widget data and methods to update it
 */
export function useWidgetStorage<T = any>(options: UseWidgetStorageOptions<T>) {
  const {
    widgetId,
    instanceId,
    storageName = "data",
    initialData,
    schemaVersion = "1.0.0",
    syncAcrossTabs = false,
    migrate,
  } = options;

  // Create a storage key specific to this widget instance and storage name
  const storageKey = useMemo(
    () => `widget-storage-${widgetId}-${instanceId}-${storageName}`,
    [widgetId, instanceId, storageName],
  );

  // Use localStorage to persist the widget data
  const [storageData, setStorageData, removeData] = useLocalStorage<
    WidgetStorageData<T>
  >(storageKey, {
    defaultValue:
      initialData !== undefined
        ? {
            data: initialData,
            metadata: {
              widgetId,
              instanceId,
              version: schemaVersion,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              schema: schemaVersion,
            },
          }
        : undefined,
    syncAcrossTabs,
  });

  // Handle schema migrations if needed
  const data = useMemo(() => {
    if (!storageData) {
      return initialData;
    }

    // Check if migration is needed
    if (
      migrate &&
      storageData.metadata.schema &&
      storageData.metadata.schema !== schemaVersion
    ) {
      try {
        const migratedData = migrate(
          storageData.data,
          storageData.metadata.schema,
          schemaVersion,
        );

        // Update the storage with migrated data
        setStorageData({
          data: migratedData,
          metadata: {
            ...storageData.metadata,
            version: schemaVersion,
            schema: schemaVersion,
            updatedAt: new Date().toISOString(),
          },
        });

        return migratedData;
      } catch (error) {
        console.error(
          `Error migrating widget data from ${storageData.metadata.schema} to ${schemaVersion}:`,
          error,
        );
        return storageData.data;
      }
    }

    return storageData.data;
  }, [storageData, initialData, migrate, schemaVersion, setStorageData]);

  // Update the data
  const updateData = useCallback(
    (newData: T | ((prevData: T | undefined) => T)) => {
      setStorageData((currentStorage) => {
        const currentData = currentStorage?.data;
        const updatedData =
          typeof newData === "function"
            ? (newData as Function)(currentData)
            : newData;

        return {
          data: updatedData,
          metadata: {
            widgetId,
            instanceId,
            version: schemaVersion,
            createdAt:
              currentStorage?.metadata.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            schema: schemaVersion,
          },
        };
      });
    },
    [setStorageData, widgetId, instanceId, schemaVersion],
  );

  // Reset the data to initial values
  const resetData = useCallback(() => {
    if (initialData !== undefined) {
      setStorageData({
        data: initialData,
        metadata: {
          widgetId,
          instanceId,
          version: schemaVersion,
          createdAt:
            storageData?.metadata.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          schema: schemaVersion,
        },
      });
    } else {
      removeData();
    }
  }, [
    setStorageData,
    removeData,
    initialData,
    widgetId,
    instanceId,
    schemaVersion,
    storageData,
  ]);

  // Clear the data completely
  const clearData = useCallback(() => {
    removeData();
  }, [removeData]);

  return {
    data,
    metadata: storageData?.metadata,
    updateData,
    resetData,
    clearData,
  };
}
