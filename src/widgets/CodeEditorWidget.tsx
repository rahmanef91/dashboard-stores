import React, { useState } from "react";
import { Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface CodeEditorWidgetProps {
  id: string;
  title: string;
  size?: "small" | "medium" | "large";
  config?: {
    language?: "javascript" | "typescript" | "json" | "html" | "css";
    initialCode?: string;
    readOnly?: boolean;
  };
}

const CodeEditorWidget: React.FC<CodeEditorWidgetProps> = ({
  title,
  size = "large",
  config = {},
}) => {
  const {
    language = "javascript",
    initialCode = "// Write your code here\n",
    readOnly = false,
  } = config;

  const [code, setCode] = useState<string>(initialCode);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    // In a real implementation, this would save to local storage or a backend
    console.log("Saving code:", code);
    setIsSaved(true);

    // Save to local storage
    try {
      const storageKey = `widget-code-${language}`;
      localStorage.setItem(storageKey, code);
    } catch (error) {
      console.error("Failed to save code to local storage", error);
    }
  };

  const handleRun = () => {
    // In a real implementation, this would execute the code in a sandbox
    console.log("Running code:", code);
    alert(
      "Code execution is simulated. In a real implementation, this would run in a sandbox.",
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Code className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          {language.toUpperCase()}
        </div>
      </div>

      <Textarea
        value={code}
        onChange={handleCodeChange}
        className="flex-1 font-mono text-sm resize-none bg-muted/50 min-h-[150px]"
        readOnly={readOnly}
      />

      <div className="flex justify-between mt-2">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaved || readOnly}
          >
            {isSaved ? "Saved" : "Save"}
          </Button>
        </div>
        <div>
          <Button
            variant="default"
            size="sm"
            onClick={handleRun}
            disabled={readOnly}
          >
            Run
          </Button>
        </div>
      </div>
    </div>
  );
};

export const widgetMetadata = {
  name: "Code Editor",
  description: "A simple code editor widget",
  version: "1.0.0",
  author: "Enterprise Widget Platform",
  category: "tools" as const,
  icon: "Code",
  defaultSize: "large" as const,
  defaultConfig: {
    language: "javascript",
    initialCode:
      '// Widget configuration\nexport default {\n  name: "Custom Widget",\n  version: "1.0.0",\n  render: (props) => {\n    return (\n      <div className="p-4">\n        <h3>{props.title}</h3>\n        <p>{props.description}</p>\n      </div>\n    );\n  }\n}',
    readOnly: false,
  },
};

export default CodeEditorWidget;
