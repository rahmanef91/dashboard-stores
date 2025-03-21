import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Play, Code, Settings, FileJson } from "lucide-react";
import CodeEditor from "./CodeEditor";
import { useWidgetConfig } from "@/lib/hooks/useWidgetConfig";

// Type for widget editor props
interface WidgetEditorProps {
  widgetId: string;
  instanceId: string;
  onSave?: () => void;
  onPreview?: () => void;
}

/**
 * A comprehensive widget editor component
 */
const WidgetEditor: React.FC<WidgetEditorProps> = ({
  widgetId,
  instanceId,
  onSave,
  onPreview,
}) => {
  // Get widget configuration
  const { config, updateConfig } = useWidgetConfig({
    widgetId,
    instanceId,
  });

  // State for the active tab
  const [activeTab, setActiveTab] = useState("settings");

  // State for the configuration JSON
  const [configJson, setConfigJson] = useState(JSON.stringify(config, null, 2));

  // State for JSON validation error
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Handle JSON editor changes
  const handleJsonChange = (json: string) => {
    setConfigJson(json);
    try {
      JSON.parse(json);
      setJsonError(null);
    } catch (err) {
      setJsonError("Invalid JSON format");
    }
  };

  // Handle JSON save
  const handleJsonSave = () => {
    try {
      const parsedConfig = JSON.parse(configJson);
      updateConfig(parsedConfig);
      setJsonError(null);
      onSave?.();
    } catch (err) {
      setJsonError("Failed to save: Invalid JSON format");
    }
  };

  // Handle settings form submission
  const handleSettingsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues: Record<string, any> = {};

    // Convert form data to object
    for (const [key, value] of formData.entries()) {
      formValues[key] = value;
    }

    updateConfig((currentConfig) => ({
      ...currentConfig,
      ...formValues,
    }));

    onSave?.();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Widget Editor</span>
          <div className="flex space-x-2">
            <Button size="sm" onClick={onSave}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
            {onPreview && (
              <Button size="sm" variant="outline" onClick={onPreview}>
                <Play className="h-4 w-4 mr-1" /> Preview
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-1" /> Settings
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-1" /> Code
            </TabsTrigger>
            <TabsTrigger value="json">
              <FileJson className="h-4 w-4 mr-1" /> JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              {/* This is a simplified form - in a real app, you'd generate this based on the widget's schema */}
              <div className="space-y-2">
                <Label htmlFor="title">Widget Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={config?.title || ""}
                  placeholder="Enter widget title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={config?.description || ""}
                  placeholder="Enter widget description"
                  rows={3}
                />
              </div>

              <Button type="submit">
                <Save className="h-4 w-4 mr-1" /> Save Settings
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="code">
            <div className="space-y-4">
              <CodeEditor
                code={config?.code || "// Widget code goes here\n"}
                language="javascript"
                onChange={(code) =>
                  updateConfig((currentConfig) => ({
                    ...currentConfig,
                    code,
                  }))
                }
                onSave={(code) => {
                  updateConfig((currentConfig) => ({
                    ...currentConfig,
                    code,
                  }));
                  onSave?.();
                }}
                height="300px"
                title="Widget Code"
              />
            </div>
          </TabsContent>

          <TabsContent value="json">
            <div className="space-y-4">
              <CodeEditor
                code={configJson}
                language="json"
                onChange={handleJsonChange}
                onSave={handleJsonSave}
                height="300px"
                title="Widget Configuration"
              />
              {jsonError && (
                <div className="text-sm text-destructive">{jsonError}</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WidgetEditor;
