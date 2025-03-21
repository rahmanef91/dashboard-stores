import { ReactNode } from "react";

// Widget interface
export interface Widget {
  id: string;
  title: string;
  type: string;
  content: ReactNode;
  size: "small" | "medium" | "large";
  category: "analytics" | "data" | "tools" | "custom";
}

// Widget metadata interface
export interface WidgetMetadata {
  name: string;
  description: string;
  version: string;
  author: string;
  category: "analytics" | "data" | "tools" | "custom";
  icon: string;
  defaultSize: "small" | "medium" | "large";
  defaultConfig: Record<string, any>;
}

// Widget registry interface
export interface WidgetRegistry {
  [key: string]: {
    component: React.ComponentType<any>;
    metadata: WidgetMetadata;
  };
}

// Import widgets
import AnalyticsWidget, { widgetMetadata as analyticsWidgetMetadata } from "./AnalyticsWidget";
import StatusWidget, { widgetMetadata as statusWidgetMetadata } from "./StatusWidget";
import CodeEditorWidget, { widgetMetadata as codeEditorWidgetMetadata } from "./CodeEditorWidget";
import DataDisplayWidget, { widgetMetadata as dataDisplayWidgetMetadata } from "./DataDisplayWidget";

// Initialize widget registry with built-in widgets
export const widgetRegistry: WidgetRegistry = {
  "analytics-chart": {
    component: AnalyticsWidget,
    metadata: analyticsWidgetMetadata,
  },
  "status-widget": {
    component: StatusWidget,
    metadata: statusWidgetMetadata,
  },
  "code-editor": {
    component: CodeEditorWidget,
    metadata: codeEditorWidgetMetadata,
  },
  "data-display": {
    component: DataDisplayWidget,
    metadata: dataDisplayWidgetMetadata,
  },
};

// Helper function to register a widget
export function registerWidget(
  id: string,
  component: React.ComponentType<any>,
  metadata: WidgetMetadata
) {
  widgetRegistry[id] = {
    component,
    metadata,
  };
}

// Helper function to get all registered widgets
export function getRegisteredWidgets() {
  return Object.entries(widgetRegistry).map(([id, { metadata }]) => ({
    id,
    ...metadata,
  }));
}

// Helper function to create a widget instance
export function createWidgetInstance(
  widgetId: string,
  instanceId: string,
  title?: string,
  config?: Record<string, any>,
  size?: "small" | "medium" | "large"
): Widget | null {
  const widget = widgetRegistry[widgetId];
  if (!widget) return null;

  const { component: Component, metadata } = widget;

  return {
    id: instanceId,
    title: title || metadata.name,
    type: widgetId,
    content: <Component 
      id={instanceId} 
      title={title || metadata.name} 
      config={config || metadata.defaultConfig} 
      size={size || metadata.defaultSize} 
    />,
    size: size || metadata.defaultSize,
    category: metadata.category,
  };
}
