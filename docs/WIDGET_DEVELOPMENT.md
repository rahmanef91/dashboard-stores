# Widget Development Guide

## Introduction

This guide provides comprehensive documentation for developers who want to create and publish widgets for the Enterprise Widget Integration Platform. Widgets are modular components that can be added to the dashboard to display data, provide functionality, or enhance the user experience.

## Widget Structure

### Basic Widget Structure

A widget is a React component that follows a specific structure to be compatible with the platform. Here's the basic structure of a widget:

```typescript
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface WidgetProps {
  id: string;
  title: string;
  onRemove?: (id: string) => void;
  onResize?: (id: string, size: "small" | "medium" | "large") => void;
  size?: "small" | "medium" | "large";
  category?: "analytics" | "data" | "tools" | "custom";
  config?: Record<string, any>;
}

const MyWidget: React.FC<WidgetProps> = ({
  id,
  title,
  onRemove,
  onResize,
  size = "small",
  config = {},
}) => {
  return (
    <div className="h-full">
      {/* Widget content goes here */}
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground text-center">
          My custom widget content
        </p>
      </div>
    </div>
  );
};

export default MyWidget;
```

### Widget Metadata

Each widget must export a metadata object that provides information about the widget:

```typescript
export const widgetMetadata = {
  name: "My Widget",
  description: "A description of what my widget does",
  version: "1.0.0",
  author: "Your Name",
  category: "analytics", // One of: analytics, data, tools, custom
  icon: "BarChart", // A Lucide icon name
  defaultSize: "small", // One of: small, medium, large
  defaultConfig: {
    // Default configuration options
    refreshInterval: 30,
    showLegend: true,
  },
};
```

## Widget Registration

To make your widget available in the platform, you need to register it in the widget registry. Here's how to do it:

1. Create your widget component in the `src/widgets` directory
2. Export the widget and its metadata
3. Register the widget in the `src/widgets/index.ts` file:

```typescript
import MyWidget, { widgetMetadata as myWidgetMetadata } from "./MyWidget";

export const widgetRegistry = {
  "my-widget": {
    component: MyWidget,
    metadata: myWidgetMetadata,
  },
  // Other widgets...
};
```

## Widget Configuration

Widgets can be configured through the Developer Tools panel. The configuration is stored in local storage and is available to the widget through the `config` prop.

### Configuration Schema

It's recommended to define a schema for your widget's configuration to ensure type safety and provide a better developer experience:

```typescript
export interface MyWidgetConfig {
  refreshInterval: number;
  showLegend: boolean;
  dataSource?: string;
  maxItems?: number;
}

// Then use it in your component:
const MyWidget: React.FC<WidgetProps> = ({
  id,
  title,
  config = {},
}) => {
  const typedConfig = config as MyWidgetConfig;
  const { refreshInterval, showLegend } = typedConfig;
  
  // Use the configuration in your widget
  // ...
};
```

## Widget Lifecycle

Widgets have a lifecycle that you can hook into:

### Initialization

When a widget is first added to the dashboard, it's initialized with its default configuration. You can perform any setup tasks in a `useEffect` hook:

```typescript
const MyWidget: React.FC<WidgetProps> = (props) => {
  useEffect(() => {
    // Initialization code
    console.log("Widget initialized", props.id);
    
    return () => {
      // Cleanup code
      console.log("Widget removed", props.id);
    };
  }, [props.id]);
  
  // Widget content
};
```

### Data Fetching

If your widget needs to fetch data, you can use React hooks to manage the data fetching and state:

```typescript
const MyWidget: React.FC<WidgetProps> = ({ config }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data from an API or local storage
        const result = await fetch('/api/data');
        const json = await result.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up a refresh interval if needed
    const interval = setInterval(fetchData, config.refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [config.refreshInterval]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  // Render widget with data
};
```

## Widget Styling

Widgets should use the platform's styling system to ensure a consistent look and feel. The platform uses Tailwind CSS for styling.

### Best Practices

1. Use the provided UI components from `@/components/ui`
2. Follow the platform's color scheme and design language
3. Make your widget responsive to different sizes
4. Use the `size` prop to adjust the widget's content based on its size

```typescript
const MyWidget: React.FC<WidgetProps> = ({ size }) => {
  return (
    <div className="h-full">
      {size === "small" ? (
        <SmallWidgetContent />
      ) : size === "medium" ? (
        <MediumWidgetContent />
      ) : (
        <LargeWidgetContent />
      )}
    </div>
  );
};
```

## Widget Testing

Before publishing your widget, you should test it thoroughly to ensure it works as expected.

### Local Testing

1. Create a test configuration for your widget
2. Add your widget to the dashboard
3. Test all functionality and edge cases
4. Verify that the widget works in different sizes
5. Check that the widget handles configuration changes correctly

## Publishing Your Widget

Once your widget is ready, you can publish it to the platform's widget marketplace:

1. Ensure your widget follows all the guidelines and best practices
2. Update the version number in the widget metadata
3. Add your widget to the widget registry
4. Create a pull request to the platform's repository

## Example Widgets

Here are some example widgets to help you get started:

### Analytics Chart Widget

```typescript
import React from "react";
import { BarChart4 } from "lucide-react";

export interface AnalyticsWidgetProps {
  id: string;
  title: string;
  size?: "small" | "medium" | "large";
  config?: {
    chartType?: "bar" | "line" | "pie";
    showLegend?: boolean;
    data?: any[];
  };
}

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({
  title,
  size = "medium",
  config = {},
}) => {
  const { chartType = "bar", showLegend = true, data = [] } = config;
  
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <BarChart4 className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-center">
        {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart widget
      </p>
      {showLegend && (
        <div className="mt-4 flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-xs">Series 1</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs">Series 2</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const widgetMetadata = {
  name: "Analytics Chart",
  description: "A customizable chart widget for analytics data",
  version: "1.0.0",
  author: "Enterprise Widget Platform",
  category: "analytics",
  icon: "BarChart",
  defaultSize: "medium",
  defaultConfig: {
    chartType: "bar",
    showLegend: true,
    data: [],
  },
};

export default AnalyticsWidget;
```

### Status Widget

```typescript
import React from "react";
import { Activity } from "lucide-react";

export interface StatusWidgetProps {
  id: string;
  title: string;
  size?: "small" | "medium" | "large";
  config?: {
    items?: Array<{
      name: string;
      status: "healthy" | "warning" | "error";
    }>;
  };
}

const StatusWidget: React.FC<StatusWidgetProps> = ({
  title,
  size = "small",
  config = {},
}) => {
  const { items = [] } = config;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <Activity className="h-5 w-5 mr-2 text-primary" />
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2 w-full">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="flex items-center p-2 border rounded">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(item.status)} mr-2`}></div>
              <span className="text-sm">{item.name}</span>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center text-muted-foreground">
            No status items configured
          </div>
        )}
      </div>
    </div>
  );
};

export const widgetMetadata = {
  name: "Status Widget",
  description: "A widget to display status information",
  version: "1.0.0",
  author: "Enterprise Widget Platform",
  category: "tools",
  icon: "Activity",
  defaultSize: "small",
  defaultConfig: {
    items: [
      { name: "Service 1", status: "healthy" },
      { name: "Service 2", status: "healthy" },
      { name: "Service 3", status: "warning" },
      { name: "Service 4", status: "error" },
    ],
  },
};

export default StatusWidget;
```

## Troubleshooting

### Common Issues

1. **Widget not appearing in the dashboard**
   - Check that your widget is properly registered in the widget registry
   - Verify that the widget component is exported correctly

2. **Configuration not updating**
   - Make sure you're using the `config` prop correctly
   - Check that the configuration is being saved to local storage

3. **Widget not resizing properly**
   - Ensure your widget handles different sizes correctly
   - Use responsive design principles

4. **Performance issues**
   - Optimize data fetching and rendering
   - Use memoization to prevent unnecessary re-renders

## Support

If you need help with widget development, please contact the platform team or refer to the platform documentation.

## Conclusion

By following this guide, you should be able to create and publish widgets for the Enterprise Widget Integration Platform. Remember to follow the platform's guidelines and best practices to ensure your widget provides a great user experience.
