import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { widgetRegistry } from "@/widgets";

// Type for widget configuration
export interface WidgetConfigData {
  widgetId: string;
  instanceId: string;
  settings: Record<string, any>;
  version: string;
  updatedAt: string;
}

// Options for the useWidgetConfig hook
export interface UseWidgetConfigOptions {
  // The widget ID
  widgetId: string;
  // The instance ID of the widget
  instanceId: string;
  // Initial configuration to use if no config exists in storage
  initialConfig?: Record<string, any>;
  // Whether to sync configuration across tabs
  syncAcrossTabs?: boolean;
}

/**
 * A hook for managing widget configuration with persistence to localStorage
 *
 * @param options Configuration options
 * @returns Object containing the widget configuration and methods to update it
 */
export function useWidgetConfig(options: UseWidgetConfigOptions) {
  const {
    widgetId,
    instanceId,
    initialConfig,
    syncAcrossTabs = false,
  } = options;

  // Get default config from widget registry
  const defaultConfig = useMemo(() => {
    const widget = widgetRegistry[widgetId];
    return widget?.metadata?.defaultConfig || {};
  }, [widgetId]);

  // Create a storage key specific to this widget instance
  const storageKey = useMemo(
    () => `widget-config-${widgetId}-${instanceId}`,
    [widgetId, instanceId],
  );

  // Use localStorage to persist the widget configuration
  const [configData, setConfigData, removeConfig] =
    useLocalStorage<WidgetConfigData>(storageKey, {
      defaultValue: {
        widgetId,
        instanceId,
        settings: initialConfig || defaultConfig,
        version: "1.0.0",
        updatedAt: new Date().toISOString(),
      },
      syncAcrossTabs,
    });

  // Get the current configuration settings
  const config = useMemo(() => {
    return configData?.settings || initialConfig || defaultConfig;
  }, [configData, initialConfig, defaultConfig]);

  // Update the entire configuration
  const updateConfig = useCallback(
    (
      newConfig:
        | Record<string, any>
        | ((prevConfig: Record<string, any>) => Record<string, any>),
    ) => {
      setConfigData((currentData) => {
        if (!currentData) {
          const settings =
            typeof newConfig === "function"
              ? newConfig(initialConfig || defaultConfig)
              : newConfig;

          return {
            widgetId,
            instanceId,
            settings,
            version: "1.0.0",
            updatedAt: new Date().toISOString(),
          };
        }

        const updatedSettings =
          typeof newConfig === "function"
            ? newConfig(currentData.settings)
            : newConfig;

        return {
          ...currentData,
          settings: updatedSettings,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [setConfigData, widgetId, instanceId, initialConfig, defaultConfig],
  );

  // Set a specific configuration property
  const setConfigProperty = useCallback(
    <T>(property: string, value: T) => {
      updateConfig((currentConfig) => ({
        ...currentConfig,
        [property]: value,
      }));
    },
    [updateConfig],
  );

  // Reset the configuration to default values
  const resetConfig = useCallback(() => {
    setConfigData({
      widgetId,
      instanceId,
      settings: initialConfig || defaultConfig,
      version: "1.0.0",
      updatedAt: new Date().toISOString(),
    });
  }, [setConfigData, widgetId, instanceId, initialConfig, defaultConfig]);

  // Clear the configuration completely
  const clearConfig = useCallback(() => {
    removeConfig();
  }, [removeConfig]);

  return {
    config,
    configData,
    updateConfig,
    setConfigProperty,
    resetConfig,
    clearConfig,
  };
}
