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
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="flex items-center p-2 border rounded">
              <div
                className={`h-2 w-2 rounded-full ${getStatusColor(item.status)} mr-2`}
              ></div>
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
  category: "tools" as const,
  icon: "Activity",
  defaultSize: "small" as const,
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
