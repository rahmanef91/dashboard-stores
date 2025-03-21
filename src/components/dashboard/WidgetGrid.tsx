"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Grip,
  Maximize2,
  Minimize2,
  X,
  Settings,
  BarChart4,
  Code,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Widget {
  id: string;
  title: string;
  type: string;
  content: React.ReactNode;
  size: "small" | "medium" | "large";
  category: "analytics" | "data" | "tools";
}

interface WidgetGridProps {
  widgets?: Widget[];
  onWidgetRemove?: (id: string) => void;
  onWidgetResize?: (id: string, size: "small" | "medium" | "large") => void;
  onWidgetDragEnd?: (widgets: Widget[]) => void;
}

const WidgetGrid = ({
  widgets = defaultWidgets,
  onWidgetRemove = () => {},
  onWidgetResize = () => {},
  onWidgetDragEnd = () => {},
}: WidgetGridProps) => {
  const [activeWidgets, setActiveWidgets] = useState<Widget[]>(widgets);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  useEffect(() => {
    // Save widget layout to local storage
    localStorage.setItem("dashboardWidgets", JSON.stringify(activeWidgets));
  }, [activeWidgets]);

  useEffect(() => {
    // Load widget layout from local storage on initial render
    const savedWidgets = localStorage.getItem("dashboardWidgets");
    if (savedWidgets) {
      try {
        setActiveWidgets(JSON.parse(savedWidgets));
      } catch (e) {
        console.error("Failed to parse saved widgets", e);
      }
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.setData("widgetId", widgetId);
    setDraggedWidget(widgetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const widgetId = e.dataTransfer.getData("widgetId");
    const sourceIndex = activeWidgets.findIndex((w) => w.id === widgetId);

    if (sourceIndex === -1) return;

    const newWidgets = [...activeWidgets];
    const [movedWidget] = newWidgets.splice(sourceIndex, 1);
    newWidgets.splice(targetIndex, 0, movedWidget);

    setActiveWidgets(newWidgets);
    setDraggedWidget(null);
    onWidgetDragEnd(newWidgets);
  };

  const handleRemoveWidget = (id: string) => {
    const newWidgets = activeWidgets.filter((widget) => widget.id !== id);
    setActiveWidgets(newWidgets);
    onWidgetRemove(id);
  };

  const handleResizeWidget = (id: string) => {
    const newWidgets = activeWidgets.map((widget) => {
      if (widget.id === id) {
        const sizes: ("small" | "medium" | "large")[] = [
          "small",
          "medium",
          "large",
        ];
        const currentIndex = sizes.indexOf(widget.size);
        const newSize = sizes[(currentIndex + 1) % sizes.length];
        onWidgetResize(id, newSize);
        return { ...widget, size: newSize };
      }
      return widget;
    });
    setActiveWidgets(newWidgets);
  };

  const filteredWidgets =
    activeTab === "all"
      ? activeWidgets
      : activeWidgets.filter((widget) => widget.category === activeTab);

  return (
    <div className="w-full h-full bg-background p-4">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Widgets</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Widget Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configure widget settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWidgets.map((widget, index) => (
              <div
                key={widget.id}
                className={cn(
                  "transition-all duration-200",
                  widget.size === "small"
                    ? "col-span-1"
                    : widget.size === "medium"
                      ? "col-span-1 md:col-span-2"
                      : "col-span-1 md:col-span-2 lg:col-span-3",
                  draggedWidget === widget.id ? "opacity-50" : "opacity-100",
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <Card className="h-full">
                  <div className="flex items-center justify-between p-4 border-b cursor-move">
                    <div className="flex items-center">
                      <Grip className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h3 className="font-medium">{widget.title}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleResizeWidget(widget.id)}
                            >
                              {widget.size === "small" ? (
                                <Maximize2 className="h-4 w-4" />
                              ) : (
                                <Minimize2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {widget.size === "small"
                                ? "Expand widget"
                                : "Shrink widget"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveWidget(widget.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remove widget</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <CardContent className="p-4">{widget.content}</CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWidgets.map((widget, index) => (
              <div
                key={widget.id}
                className={cn(
                  "transition-all duration-200",
                  widget.size === "small"
                    ? "col-span-1"
                    : widget.size === "medium"
                      ? "col-span-1 md:col-span-2"
                      : "col-span-1 md:col-span-2 lg:col-span-3",
                  draggedWidget === widget.id ? "opacity-50" : "opacity-100",
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <Card className="h-full">
                  <div className="flex items-center justify-between p-4 border-b cursor-move">
                    <div className="flex items-center">
                      <Grip className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h3 className="font-medium">{widget.title}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResizeWidget(widget.id)}
                      >
                        {widget.size === "small" ? (
                          <Maximize2 className="h-4 w-4" />
                        ) : (
                          <Minimize2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveWidget(widget.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">{widget.content}</CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="data" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWidgets.map((widget, index) => (
              <div
                key={widget.id}
                className={cn(
                  "transition-all duration-200",
                  widget.size === "small"
                    ? "col-span-1"
                    : widget.size === "medium"
                      ? "col-span-1 md:col-span-2"
                      : "col-span-1 md:col-span-2 lg:col-span-3",
                  draggedWidget === widget.id ? "opacity-50" : "opacity-100",
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <Card className="h-full">
                  <div className="flex items-center justify-between p-4 border-b cursor-move">
                    <div className="flex items-center">
                      <Grip className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h3 className="font-medium">{widget.title}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResizeWidget(widget.id)}
                      >
                        {widget.size === "small" ? (
                          <Maximize2 className="h-4 w-4" />
                        ) : (
                          <Minimize2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveWidget(widget.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">{widget.content}</CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWidgets.map((widget, index) => (
              <div
                key={widget.id}
                className={cn(
                  "transition-all duration-200",
                  widget.size === "small"
                    ? "col-span-1"
                    : widget.size === "medium"
                      ? "col-span-1 md:col-span-2"
                      : "col-span-1 md:col-span-2 lg:col-span-3",
                  draggedWidget === widget.id ? "opacity-50" : "opacity-100",
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <Card className="h-full">
                  <div className="flex items-center justify-between p-4 border-b cursor-move">
                    <div className="flex items-center">
                      <Grip className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h3 className="font-medium">{widget.title}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResizeWidget(widget.id)}
                      >
                        {widget.size === "small" ? (
                          <Maximize2 className="h-4 w-4" />
                        ) : (
                          <Minimize2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveWidget(widget.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">{widget.content}</CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Default widgets for demonstration
const defaultWidgets: Widget[] = [
  {
    id: "widget-1",
    title: "Performance Overview",
    type: "chart",
    content: (
      <div className="h-64 flex flex-col items-center justify-center">
        <BarChart4 className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center text-muted-foreground">
          Performance metrics visualization
        </p>
      </div>
    ),
    size: "medium",
    category: "analytics",
  },
  {
    id: "widget-2",
    title: "Widget Health Status",
    type: "status",
    content: (
      <div className="h-48 flex flex-col items-center justify-center">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span>All widgets operational</span>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          <div className="flex items-center p-2 border rounded">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm">Widget 1</span>
          </div>
          <div className="flex items-center p-2 border rounded">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm">Widget 2</span>
          </div>
          <div className="flex items-center p-2 border rounded">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm">Widget 3</span>
          </div>
          <div className="flex items-center p-2 border rounded">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm">Widget 4</span>
          </div>
        </div>
      </div>
    ),
    size: "small",
    category: "analytics",
  },
  {
    id: "widget-3",
    title: "Widget Code Editor",
    type: "editor",
    content: (
      <div className="h-64 flex flex-col">
        <div className="bg-muted p-2 rounded-md font-mono text-sm overflow-auto h-full">
          <Code className="h-6 w-6 text-muted-foreground float-right" />
          <pre className="text-xs">
            {`// Widget configuration
export default {
  name: "Custom Widget",
  version: "1.0.0",
  render: (props) => {
    return (
      <div className="p-4">
        <h3>{props.title}</h3>
        <p>{props.description}</p>
      </div>
    );
  }
}`}
          </pre>
        </div>
      </div>
    ),
    size: "large",
    category: "tools",
  },
  {
    id: "widget-4",
    title: "Data Integration",
    type: "data",
    content: (
      <div className="h-48 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">API Endpoint</span>
            <span className="text-xs text-muted-foreground">Connected</span>
          </div>
          <div className="p-2 bg-muted rounded-md font-mono text-xs mb-4">
            https://api.example.com/widgets/data
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Last Sync</span>
            <span className="text-xs text-muted-foreground">2 minutes ago</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Records</span>
            <span className="text-xs text-muted-foreground">1,245</span>
          </div>
        </div>
      </div>
    ),
    size: "small",
    category: "data",
  },
];

export default WidgetGrid;
