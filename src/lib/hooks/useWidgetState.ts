import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

// Types for widget state
export interface WidgetState {
  isActive?: boolean;
  isExpanded?: boolean;
  isCollapsed?: boolean;
  isSelected?: boolean;
  lastUpdated?: string;
  customState?: Record<string, any>;
}

// Options for the useWidgetState hook
export interface UseWidgetStateOptions {
  // The widget ID
  widgetId: string;
  // The instance ID of the widget
  instanceId: string;
  // Initial state to use if no state exists in storage
  initialState?: WidgetState;
  // Whether to sync state across tabs
  syncAcrossTabs?: boolean;
}

/**
 * A hook for managing widget state (active, expanded, collapsed, etc.)
 * with persistence to localStorage
 *
 * @param options Configuration options
 * @returns Object containing the widget state and methods to update it
 */
export function useWidgetState(options: UseWidgetStateOptions) {
  const {
    widgetId,
    instanceId,
    initialState = {},
    syncAcrossTabs = false,
  } = options;

  // Create a storage key specific to this widget instance
  const storageKey = useMemo(
    () => `widget-state-${widgetId}-${instanceId}`,
    [widgetId, instanceId],
  );

  // Use localStorage to persist the widget state
  const [state, setState, removeState] = useLocalStorage<WidgetState>(
    storageKey,
    {
      defaultValue: initialState,
      syncAcrossTabs,
    },
  );

  // Update the entire state
  const updateState = useCallback(
    (newState: WidgetState | ((prevState: WidgetState) => WidgetState)) => {
      setState((currentState = {}) => {
        const updatedState =
          typeof newState === "function" ? newState(currentState) : newState;

        return {
          ...currentState,
          ...updatedState,
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [setState],
  );

  // Set a specific state property
  const setStateProperty = useCallback(
    <K extends keyof WidgetState>(property: K, value: WidgetState[K]) => {
      updateState((currentState) => ({
        ...currentState,
        [property]: value,
      }));
    },
    [updateState],
  );

  // Toggle a boolean state property
  const toggleStateProperty = useCallback(
    (property: keyof WidgetState) => {
      updateState((currentState) => ({
        ...currentState,
        [property]: !currentState[property],
      }));
    },
    [updateState],
  );

  // Reset the state to initial values
  const resetState = useCallback(() => {
    setState({
      ...initialState,
      lastUpdated: new Date().toISOString(),
    });
  }, [setState, initialState]);

  // Clear the state completely
  const clearState = useCallback(() => {
    removeState();
  }, [removeState]);

  // Set custom state data
  const setCustomState = useCallback(
    (customData: Record<string, any>) => {
      updateState((currentState) => ({
        ...currentState,
        customState: {
          ...currentState.customState,
          ...customData,
        },
      }));
    },
    [updateState],
  );

  return {
    state: state || initialState,
    updateState,
    setStateProperty,
    toggleStateProperty,
    resetState,
    clearState,
    setCustomState,
  };
}
