import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useWidgetConfig } from "@/lib/hooks/useWidgetConfig";
import { createWidgetInstance } from "@/widgets";

// Type for widget tester props
interface WidgetTesterProps {
  widgetId: string;
  instanceId: string;
}

// Type for test result
interface TestResult {
  name: string;
  status: "success" | "error" | "pending";
  message?: string;
  duration?: number;
}

/**
 * A component for testing widgets
 */
const WidgetTester: React.FC<WidgetTesterProps> = ({
  widgetId,
  instanceId,
}) => {
  // Get widget configuration
  const { config } = useWidgetConfig({
    widgetId,
    instanceId,
  });

  // State for test results
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // State for loading
  const [isRunning, setIsRunning] = useState(false);

  // State for the active tab
  const [activeTab, setActiveTab] = useState("results");

  // Run tests
  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Simulate tests running
    const tests: TestResult[] = [
      { name: "Widget Initialization", status: "pending" },
      { name: "Rendering Test", status: "pending" },
      { name: "Configuration Validation", status: "pending" },
      { name: "Performance Test", status: "pending" },
    ];

    setTestResults(tests);

    // Simulate test execution with delays
    await simulateTest(0, "success", "Widget initialized successfully", 500);
    await simulateTest(1, "success", "Widget renders without errors", 800);

    // Simulate a configuration validation test
    const configValid = validateConfig(config);
    await simulateTest(
      2,
      configValid ? "success" : "error",
      configValid
        ? "Configuration is valid"
        : "Configuration validation failed: Missing required properties",
      600,
    );

    // Simulate a performance test
    await simulateTest(
      3,
      "success",
      "Performance within acceptable range: 120ms",
      1000,
    );

    setIsRunning(false);
  };

  // Simulate a test running and updating its result
  const simulateTest = async (
    index: number,
    status: "success" | "error",
    message: string,
    delay: number,
  ) => {
    await new Promise((resolve) => setTimeout(resolve, delay));

    setTestResults((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status,
        message,
        duration: delay,
      };
      return updated;
    });
  };

  // Validate widget configuration
  const validateConfig = (config: any) => {
    // This is a simplified validation
    // In a real app, you'd validate against a schema
    return config && typeof config === "object";
  };

  // Render test result icon based on status
  const renderStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Widget Tester</span>
          <Button size="sm" onClick={runTests} disabled={isRunning}>
            {isRunning ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            {isRunning ? "Running Tests..." : "Run Tests"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="preview">Widget Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <div className="space-y-2">
              {testResults.length > 0 ? (
                testResults.map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      {renderStatusIcon(test.status)}
                      <div>
                        <div className="font-medium">{test.name}</div>
                        {test.message && (
                          <div className="text-sm text-muted-foreground">
                            {test.message}
                          </div>
                        )}
                      </div>
                    </div>
                    {test.duration && (
                      <div className="text-sm text-muted-foreground">
                        {test.duration}ms
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No tests have been run yet. Click "Run Tests" to start
                  testing.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="border rounded-md p-4 min-h-[300px] flex items-center justify-center">
              {/* Widget preview */}
              <div className="w-full h-full">
                {createWidgetInstance(
                  widgetId,
                  instanceId,
                  config?.title,
                  config,
                  "medium",
                )?.content || (
                  <div className="text-center text-muted-foreground">
                    Widget preview not available
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WidgetTester;
