import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Type for code editor props
interface CodeEditorProps {
  code: string;
  language?: string;
  onChange?: (code: string) => void;
  onSave?: (code: string) => void;
  readOnly?: boolean;
  height?: string;
  title?: string;
}

/**
 * A code editor component that uses Monaco Editor
 * This is a simplified version that will be enhanced with Monaco Editor integration
 */
const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language = "javascript",
  onChange,
  onSave,
  readOnly = false,
  height = "300px",
  title = "Code Editor",
}) => {
  const [value, setValue] = useState(code);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize the editor
  useEffect(() => {
    let isMounted = true;

    const initMonaco = async () => {
      try {
        setIsLoading(true);

        // In a real implementation, we would load Monaco Editor here
        // For now, we'll just simulate the loading
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!isMounted) return;

        // This is where we would initialize Monaco Editor
        // For now, we'll just use a textarea
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize Monaco Editor:", err);
        if (isMounted) {
          setError("Failed to load code editor. Please try again.");
          setIsLoading(false);
        }
      }
    };

    initMonaco();

    return () => {
      isMounted = false;
      // Cleanup Monaco Editor instance if needed
    };
  }, []);

  // Update the editor value when the code prop changes
  useEffect(() => {
    if (value !== code) {
      setValue(code);
    }
  }, [code, value]);

  // Handle code changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  };

  // Handle save button click
  const handleSave = () => {
    onSave?.(value);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div
            className="flex items-center justify-center bg-destructive/10 text-destructive"
            style={{ height }}
          >
            {error}
          </div>
        ) : (
          <div ref={containerRef} className="relative" style={{ height }}>
            {/* Placeholder for Monaco Editor */}
            {/* In a real implementation, this would be replaced with Monaco Editor */}
            <textarea
              value={value}
              onChange={handleChange}
              className="w-full h-full p-4 font-mono text-sm bg-muted/50 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              readOnly={readOnly}
              spellCheck={false}
              placeholder={`// Write your ${language} code here...`}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {language.toUpperCase()}
        </div>
        <div className="flex space-x-2">
          {onSave && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading || readOnly}
            >
              Save
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CodeEditor;
