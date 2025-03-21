import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { createWidgetInstance, Widget } from "@/widgets";

// Type for dashboard layout
export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetInstance[];
  createdAt: string;
  updatedAt: string;
}

// Type for widget instance in the dashboard
export interface WidgetInstance {
  id: string;
  widgetId: string;
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  size: "small" | "medium" | "large";
  config?: Record<string, any>;
}

// Type for dashboard context value
interface DashboardContextValue {
  // Current dashboard layout
  currentLayout: DashboardLayout | null;
  // All available layouts
  layouts: DashboardLayout[];
  // Widgets in the current layout
  widgets: Widget[];
  // Loading state
  isLoading: boolean;
  // Error state
  error: Error | null;
  // Create a new layout
  createLayout: (name: string) => DashboardLayout;
  // Switch to a different layout
  switchLayout: (layoutId: string) => void;
  // Delete a layout
  deleteLayout: (layoutId: string) => void;
  // Add a widget to the current layout
  addWidget: (
    widgetId: string,
    title?: string,
    config?: Record<string, any>,
  ) => void;
  // Remove a widget from the current layout
  removeWidget: (instanceId: string) => void;
  // Update a widget in the current layout
  updateWidget: (instanceId: string, updates: Partial<WidgetInstance>) => void;
  // Update widget positions in the current layout
  updateWidgetPositions: (
    updates: Array<{ id: string; position: WidgetInstance["position"] }>,
  ) => void;
}

// Create the context with a default value
const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined,
);

// Default layout dimensions
const DEFAULT_WIDGET_DIMENSIONS = {
  small: { w: 1, h: 1 },
  medium: { w: 2, h: 1 },
  large: { w: 2, h: 2 },
};

// Props for the DashboardProvider component
interface DashboardProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for dashboard context
 */
export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  // State for loading and error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use localStorage to persist dashboard layouts
  const [layouts, setLayouts] = useLocalStorage<DashboardLayout[]>(
    "dashboard-layouts",
    {
      defaultValue: [],
    },
  );

  // State for the current layout ID
  const [currentLayoutId, setCurrentLayoutId] = useLocalStorage<string>(
    "current-dashboard-layout",
    {
      defaultValue: "",
    },
  );

  // Get the current layout object
  const currentLayout =
    layouts?.find((layout) => layout.id === currentLayoutId) || null;

  // State for the widgets in the current layout
  const [widgets, setWidgets] = useState<Widget[]>([]);

  // Initialize widgets based on the current layout
  useEffect(() => {
    if (!currentLayout) {
      setWidgets([]);
      return;
    }

    try {
      // Create widget instances from the layout
      const widgetInstances = currentLayout.widgets
        .map((instance) => {
          return createWidgetInstance(
            instance.widgetId,
            instance.id,
            instance.title,
            instance.config,
            instance.size,
          );
        })
        .filter((widget): widget is Widget => widget !== null);

      setWidgets(widgetInstances);
      setError(null);
    } catch (err) {
      console.error("Error initializing widgets:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to initialize widgets"),
      );
      setWidgets([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLayout]);

  // Create a new dashboard layout
  const createLayout = useCallback(
    (name: string): DashboardLayout => {
      const newLayout: DashboardLayout = {
        id: `layout-${Date.now()}`,
        name,
        widgets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLayouts((prevLayouts = []) => [...prevLayouts, newLayout]);
      setCurrentLayoutId(newLayout.id);

      return newLayout;
    },
    [setLayouts, setCurrentLayoutId],
  );

  // Switch to a different layout
  const switchLayout = useCallback(
    (layoutId: string) => {
      if (layouts?.some((layout) => layout.id === layoutId)) {
        setCurrentLayoutId(layoutId);
      } else {
        setError(new Error(`Layout with ID ${layoutId} not found`));
      }
    },
    [layouts, setCurrentLayoutId],
  );

  // Delete a layout
  const deleteLayout = useCallback(
    (layoutId: string) => {
      setLayouts((prevLayouts = []) => {
        const updatedLayouts = prevLayouts.filter(
          (layout) => layout.id !== layoutId,
        );

        // If we're deleting the current layout, switch to another one
        if (layoutId === currentLayoutId && updatedLayouts.length > 0) {
          setCurrentLayoutId(updatedLayouts[0].id);
        } else if (updatedLayouts.length === 0) {
          setCurrentLayoutId("");
        }

        return updatedLayouts;
      });
    },
    [setLayouts, currentLayoutId, setCurrentLayoutId],
  );

  // Add a widget to the current layout
  const addWidget = useCallback(
    (widgetId: string, title?: string, config?: Record<string, any>) => {
      if (!currentLayout) {
        // Create a default layout if none exists
        const newLayout = createLayout("Default Layout");
        setCurrentLayoutId(newLayout.id);
      }

      setLayouts((prevLayouts = []) => {
        return prevLayouts.map((layout) => {
          if (layout.id !== currentLayoutId) return layout;

          // Generate a unique instance ID
          const instanceId = `widget-${widgetId}-${Date.now()}`;

          // Create the widget instance
          const widgetInstance = createWidgetInstance(
            widgetId,
            instanceId,
            title,
            config,
          );
          if (!widgetInstance) {
            throw new Error(`Widget with ID ${widgetId} not found in registry`);
          }

          // Get default dimensions based on widget size
          const { w, h } = DEFAULT_WIDGET_DIMENSIONS[widgetInstance.size];

          // Find a suitable position for the new widget
          // This is a simple implementation - in a real app, you'd use a more sophisticated algorithm
          const position = findAvailablePosition(layout.widgets, w, h);

          // Add the widget to the layout
          const newWidgetInstance: WidgetInstance = {
            id: instanceId,
            widgetId,
            title: title || widgetInstance.title,
            position,
            size: widgetInstance.size,
            config,
          };

          return {
            ...layout,
            widgets: [...layout.widgets, newWidgetInstance],
            updatedAt: new Date().toISOString(),
          };
        });
      });
    },
    [
      currentLayout,
      currentLayoutId,
      createLayout,
      setCurrentLayoutId,
      setLayouts,
    ],
  );

  // Helper function to find an available position for a new widget
  const findAvailablePosition = (
    widgets: WidgetInstance[],
    width: number,
    height: number,
  ) => {
    // Simple grid-based positioning
    // In a real app, you'd implement a more sophisticated algorithm
    const grid: boolean[][] = [];
    const gridWidth = 4; // Assuming a 4-column grid
    const gridHeight = 10; // Assuming a 10-row grid

    // Initialize grid
    for (let y = 0; y < gridHeight; y++) {
      grid[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        grid[y][x] = false; // false means the cell is empty
      }
    }

    // Mark occupied cells
    widgets.forEach((widget) => {
      const { x, y, w, h } = widget.position;
      for (let i = y; i < y + h; i++) {
        for (let j = x; j < x + w; j++) {
          if (i < gridHeight && j < gridWidth) {
            grid[i][j] = true; // true means the cell is occupied
          }
        }
      }
    });

    // Find first available position
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth - width + 1; x++) {
        let canFit = true;

        // Check if the widget can fit at this position
        for (let i = y; i < y + height; i++) {
          for (let j = x; j < x + width; j++) {
            if (i >= gridHeight || j >= gridWidth || grid[i][j]) {
              canFit = false;
              break;
            }
          }
          if (!canFit) break;
        }

        if (canFit) {
          return { x, y, w: width, h: height };
        }
      }
    }

    // If no position found, place at the bottom
    return { x: 0, y: gridHeight, w: width, h: height };
  };

  // Remove a widget from the current layout
  const removeWidget = useCallback(
    (instanceId: string) => {
      setLayouts((prevLayouts = []) => {
        return prevLayouts.map((layout) => {
          if (layout.id !== currentLayoutId) return layout;

          return {
            ...layout,
            widgets: layout.widgets.filter(
              (widget) => widget.id !== instanceId,
            ),
            updatedAt: new Date().toISOString(),
          };
        });
      });
    },
    [currentLayoutId, setLayouts],
  );

  // Update a widget in the current layout
  const updateWidget = useCallback(
    (instanceId: string, updates: Partial<WidgetInstance>) => {
      setLayouts((prevLayouts = []) => {
        return prevLayouts.map((layout) => {
          if (layout.id !== currentLayoutId) return layout;

          return {
            ...layout,
            widgets: layout.widgets.map((widget) => {
              if (widget.id !== instanceId) return widget;

              return {
                ...widget,
                ...updates,
              };
            }),
            updatedAt: new Date().toISOString(),
          };
        });
      });
    },
    [currentLayoutId, setLayouts],
  );

  // Update widget positions in the current layout
  const updateWidgetPositions = useCallback(
    (updates: Array<{ id: string; position: WidgetInstance["position"] }>) => {
      setLayouts((prevLayouts = []) => {
        return prevLayouts.map((layout) => {
          if (layout.id !== currentLayoutId) return layout;

          return {
            ...layout,
            widgets: layout.widgets.map((widget) => {
              const update = updates.find((u) => u.id === widget.id);
              if (!update) return widget;

              return {
                ...widget,
                position: update.position,
              };
            }),
            updatedAt: new Date().toISOString(),
          };
        });
      });
    },
    [currentLayoutId, setLayouts],
  );

  // Create the context value
  const contextValue: DashboardContextValue = {
    currentLayout,
    layouts: layouts || [],
    widgets,
    isLoading,
    error,
    createLayout,
    switchLayout,
    deleteLayout,
    addWidget,
    removeWidget,
    updateWidget,
    updateWidgetPositions,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

/**
 * Hook to use the dashboard context
 */
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
