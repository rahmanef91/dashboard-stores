import React from "react";
import { Database } from "lucide-react";

export interface DataDisplayWidgetProps {
  id: string;
  title: string;
  size?: "small" | "medium" | "large";
  config?: {
    endpoint?: string;
    lastSync?: string;
    recordCount?: number;
    fields?: Array<{
      name: string;
      value: string;
    }>;
  };
}

const DataDisplayWidget: React.FC<DataDisplayWidgetProps> = ({
  title,
  size = "small",
  config = {},
}) => {
  const {
    endpoint = "https://api.example.com/data",
    lastSync = "2 minutes ago",
    recordCount = 1245,
    fields = [],
  } = config;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <Database className="h-5 w-5 mr-2 text-primary" />
        <h3 className="text-lg font-medium">{title}</h3>
      </div>

      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">API Endpoint</span>
          <span className="text-xs text-muted-foreground">Connected</span>
        </div>
        <div className="p-2 bg-muted rounded-md font-mono text-xs mb-4 truncate">
          {endpoint}
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Last Sync</span>
          <span className="text-xs text-muted-foreground">{lastSync}</span>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">Records</span>
          <span className="text-xs text-muted-foreground">
            {recordCount.toLocaleString()}
          </span>
        </div>

        {fields && fields.length > 0 && (
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium">
                    Field
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fields.map((field, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm">{field.name}</td>
                    <td className="px-3 py-2 text-sm font-mono truncate max-w-[150px]">
                      {field.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const widgetMetadata = {
  name: "Data Display",
  description: "A widget to display data from an API endpoint",
  version: "1.0.0",
  author: "Enterprise Widget Platform",
  category: "data" as const,
  icon: "Database",
  defaultSize: "small" as const,
  defaultConfig: {
    endpoint: "https://api.example.com/widgets/data",
    lastSync: "2 minutes ago",
    recordCount: 1245,
    fields: [
      { name: "ID", value: "widget-123" },
      { name: "Status", value: "active" },
      { name: "Created", value: "2023-06-15" },
      { name: "Owner", value: "admin@example.com" },
    ],
  },
};

export default DataDisplayWidget;
