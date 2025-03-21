import React, { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

// Type for theme context value
type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Props for the ThemeProvider component
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

/**
 * Provider component for theme context
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
}) => {
  // Use localStorage to persist theme preference
  const [theme, setTheme] = useLocalStorage<Theme>("theme", {
    defaultValue: defaultTheme,
    syncAcrossTabs: true,
  });

  // State for whether dark mode is active
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>("is-dark-mode", {
    defaultValue: defaultTheme === "dark",
    syncAcrossTabs: true,
  });

  // Update the document class when the theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      setIsDarkMode(systemTheme === "dark");
    } else {
      root.classList.add(theme);
      setIsDarkMode(theme === "dark");
    }
  }, [theme, setIsDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      const systemTheme = mediaQuery.matches ? "dark" : "light";

      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
      setIsDarkMode(systemTheme === "dark");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, setIsDarkMode]);

  // Create the context value
  const contextValue: ThemeContextValue = {
    theme: theme || defaultTheme,
    setTheme,
    isDarkMode: isDarkMode || false,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use the theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
