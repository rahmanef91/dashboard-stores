"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Settings, Monitor, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "./Sidebar";
import WidgetGrid from "./WidgetGrid";
import DevTools from "./DevTools";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps = {}) => {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDevTools, setShowDevTools] = useState(true);
  const [isDashboardMode, setIsDashboardMode] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Load preferences from local storage on mount
  useEffect(() => {
    const storedSidebarState = localStorage.getItem("sidebar-collapsed");
    if (storedSidebarState !== null) {
      setSidebarCollapsed(storedSidebarState === "true");
    }

    const storedDevToolsState = localStorage.getItem("devtools-visible");
    if (storedDevToolsState !== null) {
      setShowDevTools(storedDevToolsState === "true");
    }

    const storedDashboardMode = localStorage.getItem("dashboard-mode");
    if (storedDashboardMode !== null) {
      setIsDashboardMode(storedDashboardMode === "true");
    }

    const storedDarkMode = localStorage.getItem("dark-mode");
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === "true");
      document.documentElement.classList.toggle(
        "dark",
        storedDarkMode === "true",
      );
    } else {
      // Default to dark mode if not set
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Save preferences to local storage when they change
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem("devtools-visible", showDevTools.toString());
  }, [showDevTools]);

  useEffect(() => {
    localStorage.setItem("dashboard-mode", isDashboardMode.toString());
  }, [isDashboardMode]);

  useEffect(() => {
    localStorage.setItem("dark-mode", darkMode.toString());
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleDevTools = () => {
    setShowDevTools(!showDevTools);
  };

  const toggleDashboardMode = () => {
    setIsDashboardMode(!isDashboardMode);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Mode Switcher - Fixed at the top */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4 bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDashboardMode}
            className="flex items-center gap-2"
          >
            <ArrowLeftRight size={16} />
            {isDashboardMode ? "Website Mode" : "Dashboard Mode"}
          </Button>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-2">
          <Switch
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={toggleDarkMode}
          />
          <Label htmlFor="dark-mode" className="text-xs">
            Dark Mode
          </Label>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "h-full transition-all duration-300",
          sidebarCollapsed ? "w-0 opacity-0" : "w-[280px] opacity-100",
        )}
      >
        {!sidebarCollapsed && <Sidebar />}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2"
              aria-label="Toggle sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-menu"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
            <h1 className="text-xl font-semibold">
              Enterprise Widget Integration Platform
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDevTools}
              className="flex items-center gap-2"
            >
              <Settings size={16} />
              {showDevTools ? "Hide DevTools" : "Show DevTools"}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-0">
          {isDashboardMode ? (
            <WidgetGrid />
          ) : (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Website Content</h2>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documentation">
                      Documentation
                    </TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <div className="prose dark:prose-invert max-w-none">
                      <h3>Enterprise Widget Integration Platform</h3>
                      <p>
                        Welcome to the Enterprise Widget Integration Platform.
                        This platform allows you to manage, configure, and
                        monitor widgets across your enterprise applications.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="border rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                              <Monitor size={24} className="text-primary" />
                            </div>
                            <h4 className="text-lg font-medium">
                              Widget Management
                            </h4>
                          </div>
                          <p className="text-muted-foreground">
                            Easily manage and configure widgets with our
                            intuitive drag-and-drop interface.
                          </p>
                        </div>
                        <div className="border rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                              <Settings size={24} className="text-primary" />
                            </div>
                            <h4 className="text-lg font-medium">
                              Developer Tools
                            </h4>
                          </div>
                          <p className="text-muted-foreground">
                            Access powerful developer tools to customize and
                            extend widget functionality.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="documentation">
                    <div className="prose dark:prose-invert max-w-none">
                      <h3>Documentation</h3>
                      <p>
                        Comprehensive documentation for the Enterprise Widget
                        Integration Platform.
                      </p>
                      <h4 className="mt-6">Getting Started</h4>
                      <ol>
                        <li>
                          Navigate to the Dashboard mode to view available
                          widgets
                        </li>
                        <li>Drag and drop widgets to arrange your dashboard</li>
                        <li>Configure widgets using the settings panel</li>
                        <li>
                          Use the Developer Tools to customize widget behavior
                        </li>
                      </ol>
                      <h4 className="mt-6">Widget Configuration</h4>
                      <p>
                        Each widget can be configured through its settings
                        panel. Common configuration options include:
                      </p>
                      <ul>
                        <li>Data sources and API endpoints</li>
                        <li>Refresh intervals and caching behavior</li>
                        <li>Display options and visualization settings</li>
                        <li>Alert thresholds and notification preferences</li>
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="examples">
                    <div className="prose dark:prose-invert max-w-none">
                      <h3>Example Implementations</h3>
                      <p>
                        Explore example implementations of the Enterprise Widget
                        Integration Platform.
                      </p>
                      <div className="grid grid-cols-1 gap-6 mt-6">
                        <div className="border rounded-lg p-6">
                          <h4 className="text-lg font-medium mb-2">
                            Analytics Dashboard
                          </h4>
                          <p className="text-muted-foreground mb-4">
                            A comprehensive analytics dashboard with real-time
                            data visualization.
                          </p>
                          <div className="bg-muted p-4 rounded-md">
                            <pre className="text-sm">{`// Example widget configuration
{
  "id": "analytics-dashboard",
  "name": "Analytics Dashboard",
  "widgets": [
    { "type": "chart", "position": { "x": 0, "y": 0, "w": 2, "h": 1 } },
    { "type": "metrics", "position": { "x": 2, "y": 0, "w": 1, "h": 1 } },
    { "type": "table", "position": { "x": 0, "y": 1, "w": 3, "h": 1 } }
  ]
}`}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Developer Tools */}
      {showDevTools && <DevTools onClose={toggleDevTools} />}
    </div>
  );
};

export default DashboardLayout;
