"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Code,
  Settings,
  Maximize2,
  Minimize2,
  Save,
  Trash2,
  Play,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DevToolsProps {
  onClose?: () => void;
  initialExpanded?: boolean;
  initialTab?: string;
}

interface WidgetConfig {
  id: string;
  name: string;
  config: Record<string, any>;
}

const DevTools = ({
  onClose = () => {},
  initialExpanded = true,
  initialTab = "widgets",
}: DevToolsProps) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [configJson, setConfigJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([]);

  // Load widget configs from local storage on mount
  useEffect(() => {
    const storedConfigs = localStorage.getItem("widget-configs");
    if (storedConfigs) {
      try {
        setWidgetConfigs(JSON.parse(storedConfigs));
      } catch (e) {
        console.error("Failed to parse stored widget configs", e);
      }
    } else {
      // Set default widget configs if none exist
      const defaultConfigs: WidgetConfig[] = [
        {
          id: "widget-1",
          name: "Analytics Dashboard",
          config: {
            displayMode: "chart",
            refreshInterval: 30,
            showLegend: true,
          },
        },
        {
          id: "widget-2",
          name: "User Activity",
          config: { displayMode: "table", maxItems: 10, sortBy: "date" },
        },
        {
          id: "widget-3",
          name: "System Status",
          config: { alertThreshold: 90, showNotifications: true },
        },
      ];
      setWidgetConfigs(defaultConfigs);
      localStorage.setItem("widget-configs", JSON.stringify(defaultConfigs));
    }

    // Get all local storage keys
    refreshLocalStorageKeys();

    // Check if dark mode is set in local storage
    const storedDarkMode = localStorage.getItem("dark-mode");
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === "true");
    }
  }, []);

  // Update local storage when widget configs change
  useEffect(() => {
    if (widgetConfigs.length > 0) {
      localStorage.setItem("widget-configs", JSON.stringify(widgetConfigs));
    }
  }, [widgetConfigs]);

  // Update local storage when dark mode changes
  useEffect(() => {
    localStorage.setItem("dark-mode", darkMode.toString());
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Update config JSON when selected widget changes
  useEffect(() => {
    if (selectedWidget) {
      const widget = widgetConfigs.find((w) => w.id === selectedWidget);
      if (widget) {
        setConfigJson(JSON.stringify(widget.config, null, 2));
        setJsonError(null);
      }
    } else {
      setConfigJson("");
    }
  }, [selectedWidget, widgetConfigs]);

  const refreshLocalStorageKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    setLocalStorageKeys(keys);
  };

  const handleSaveConfig = () => {
    if (!selectedWidget) return;

    try {
      const updatedConfig = JSON.parse(configJson);
      setWidgetConfigs((prev) =>
        prev.map((widget) =>
          widget.id === selectedWidget
            ? { ...widget, config: updatedConfig }
            : widget,
        ),
      );
      setJsonError(null);
    } catch (e) {
      setJsonError("Invalid JSON format");
    }
  };

  const handleDeleteWidget = () => {
    if (!selectedWidget) return;

    setWidgetConfigs((prev) =>
      prev.filter((widget) => widget.id !== selectedWidget),
    );
    setSelectedWidget(null);
  };

  const handleClearStorage = (key: string) => {
    localStorage.removeItem(key);
    refreshLocalStorageKeys();

    // If we're clearing widget configs, reset the state
    if (key === "widget-configs") {
      setWidgetConfigs([]);
      setSelectedWidget(null);
    }
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      className={cn(
        "fixed bottom-4 right-4 z-50 overflow-hidden transition-all duration-300 bg-background border-border",
        expanded ? "w-[350px] h-[400px]" : "w-[50px] h-[50px]",
      )}
    >
      {expanded ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center space-x-2">
              <Code size={18} />
              <h3 className="font-medium">Developer Tools</h3>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleExpanded}
              >
                <Minimize2 size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={18} />
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid grid-cols-3 mx-2 mt-2">
              <TabsTrigger value="widgets">Widgets</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="widgets" className="h-full">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <Label htmlFor="widget-select">Select Widget</Label>
                    <select
                      id="widget-select"
                      className="w-full p-2 mt-1 rounded-md border bg-background"
                      value={selectedWidget || ""}
                      onChange={(e) =>
                        setSelectedWidget(e.target.value || null)
                      }
                    >
                      <option value="">-- Select a widget --</option>
                      {widgetConfigs.map((widget) => (
                        <option key={widget.id} value={widget.id}>
                          {widget.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedWidget && (
                    <>
                      <div className="mb-4 flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <Label htmlFor="config-json">
                            Widget Configuration
                          </Label>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleSaveConfig}
                            >
                              <Save size={14} className="mr-1" /> Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleDeleteWidget}
                            >
                              <Trash2 size={14} className="mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          id="config-json"
                          value={configJson}
                          onChange={(e) => setConfigJson(e.target.value)}
                          className={cn(
                            "font-mono text-sm h-[180px]",
                            jsonError ? "border-red-500" : "",
                          )}
                        />
                        {jsonError && (
                          <p className="text-red-500 text-xs mt-1">
                            {jsonError}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="storage" className="h-full">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Local Storage</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={refreshLocalStorageKeys}
                    >
                      <RefreshCw size={14} className="mr-1" /> Refresh
                    </Button>
                  </div>

                  <div className="overflow-auto flex-1 border rounded-md">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-2 text-xs font-medium">
                            Key
                          </th>
                          <th className="text-right p-2 text-xs font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {localStorageKeys.length > 0 ? (
                          localStorageKeys.map((key) => (
                            <tr key={key} className="border-b last:border-0">
                              <td className="p-2 text-sm truncate max-w-[200px]">
                                {key}
                              </td>
                              <td className="p-2 text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleClearStorage(key)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={2}
                              className="p-4 text-center text-sm text-muted-foreground"
                            >
                              No items in local storage
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dashboard-name">Dashboard Name</Label>
                    <Input
                      id="dashboard-name"
                      defaultValue="Enterprise Widget Dashboard"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refresh-interval">
                      Auto Refresh Interval (seconds)
                    </Label>
                    <Input
                      id="refresh-interval"
                      type="number"
                      defaultValue="30"
                      min="0"
                      className="w-full"
                    />
                  </div>

                  <div className="pt-4">
                    <Button className="w-full">
                      <Play size={14} className="mr-2" /> Apply Settings
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      ) : (
        <Button
          variant="ghost"
          className="w-full h-full p-0 flex items-center justify-center"
          onClick={handleToggleExpanded}
        >
          <Maximize2 size={24} />
        </Button>
      )}
    </Card>
  );
};

export default DevTools;
