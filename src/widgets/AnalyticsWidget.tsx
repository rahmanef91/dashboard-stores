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
  category: "analytics" as const,
  icon: "BarChart",
  defaultSize: "medium" as const,
  defaultConfig: {
    chartType: "bar",
    showLegend: true,
    data: [],
  },
};

export default AnalyticsWidget;
