import React, { useState, useEffect, useCallback } from "react";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";

export interface MenuWidgetProps {
  id: string;
  title: string;
  onRemove?: (id: string) => void;
  onResize?: (id: string, size: "small" | "medium" | "large") => void;
  size?: "small" | "medium" | "large";
  category?: "analytics" | "data" | "tools" | "custom";
  config?: MenuWidgetConfig;
}

export interface MenuWidgetConfig {
  menuItems: MenuItem[];
  orientation?: "horizontal" | "vertical";
  showIcons?: boolean;
  theme?: "default" | "minimal" | "bordered";
  collapsible?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
  disabled?: boolean;
}

const MenuWidget: React.FC<MenuWidgetProps> = ({
  id,
  title,
  onRemove,
  onResize,
  size = "medium",
  config = {
    menuItems: [],
    orientation: "vertical",
    showIcons: true,
    theme: "default",
    collapsible: true,
  },
}) => {
  const { menuItems, orientation, showIcons, theme, collapsible } = config;
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);

  // Load state from local storage
  useEffect(() => {
    const loadState = () => {
      try {
        const savedState = localStorage.getItem(`menu-widget-${id}-state`);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setActiveItem(parsedState.activeItem || null);
          setExpandedItems(new Set(parsedState.expandedItems || []));
          setCollapsed(parsedState.collapsed || false);
        }
      } catch (error) {
        console.error("Error loading menu state from local storage", error);
      }
    };

    loadState();
  }, [id]);

  // Save state to local storage
  const saveState = useCallback(() => {
    try {
      const state = {
        activeItem,
        expandedItems: [...expandedItems],
        collapsed,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(`menu-widget-${id}-state`, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving menu state to local storage", error);
    }
  }, [id, activeItem, expandedItems, collapsed]);

  useEffect(() => {
    saveState();
  }, [saveState]);

  // Handle item click
  const handleItemClick = useCallback(
    (itemId: string, hasChildren: boolean) => {
      setActiveItem(itemId);

      if (hasChildren) {
        setExpandedItems((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(itemId)) {
            newSet.delete(itemId);
          } else {
            newSet.add(itemId);
          }
          return newSet;
        });
      }
    },
    [],
  );

  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  // Render a menu item
  const renderMenuItem = useCallback(
    (item: MenuItem, depth = 0) => {
      const isActive = activeItem === item.id;
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedItems.has(item.id);

      // Get theme-specific classes
      const getThemeClasses = () => {
        switch (theme) {
          case "minimal":
            return "hover:bg-transparent hover:text-primary";
          case "bordered":
            return "border border-border rounded-md hover:border-primary";
          default:
            return "hover:bg-muted";
        }
      };

      return (
        <div key={item.id} className={`w-full ${depth > 0 ? "pl-4" : ""}`}>
          <div
            role="menuitem"
            tabIndex={0}
            aria-disabled={item.disabled}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-haspopup={hasChildren}
            aria-current={isActive ? "page" : undefined}
            className={`
            flex items-center justify-between p-2 rounded-md
            ${!item.disabled ? "cursor-pointer" : "cursor-not-allowed"}
            ${isActive ? "bg-primary/10 text-primary" : ""}
            ${item.disabled ? "opacity-50" : ""}
            ${getThemeClasses()}
            transition-colors duration-200
          `}
            onClick={() =>
              !item.disabled && handleItemClick(item.id, hasChildren)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                !item.disabled && handleItemClick(item.id, hasChildren);
              }
            }}
          >
            <div className="flex items-center gap-2">
              {showIcons && item.icon && <Menu className="h-4 w-4" />}
              <span
                className={`${size === "small" ? "text-sm" : "text-base"} truncate`}
              >
                {item.label}
              </span>
            </div>

            {hasChildren &&
              (orientation === "vertical" ? (
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                />
              ) : (
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                />
              ))}
          </div>

          {hasChildren && isExpanded && (
            <div
              role="menu"
              className={`
              mt-1 
              ${orientation === "vertical" ? "ml-2 border-l border-border pl-2" : ""}
              ${orientation === "horizontal" ? "absolute mt-1 bg-background border border-border rounded-md shadow-md z-10 min-w-[200px]" : ""}
            `}
            >
              {item.children!.map((child) => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    },
    [
      activeItem,
      expandedItems,
      handleItemClick,
      orientation,
      showIcons,
      size,
      theme,
    ],
  );

  return (
    <div className="h-full flex flex-col bg-card text-card-foreground rounded-md overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        {collapsible && (
          <button
            onClick={toggleCollapsed}
            className="p-1 rounded-md hover:bg-muted"
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {!collapsed && (
        <div
          className={`
            flex-1 p-3 overflow-auto
            ${orientation === "horizontal" ? "flex flex-row items-start" : "flex flex-col"} 
            gap-1
          `}
          role="menubar"
          aria-orientation={orientation}
        >
          {menuItems && menuItems.length > 0 ? (
            menuItems.map((item) => renderMenuItem(item))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">
                No menu items configured
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const widgetMetadata = {
  name: "Menu Widget",
  description:
    "A customizable menu widget for navigation and hierarchical data",
  version: "1.0.0",
  author: "Enterprise Widget Platform",
  category: "tools",
  icon: "Menu",
  defaultSize: "medium",
  defaultConfig: {
    menuItems: [
      {
        id: "home",
        label: "Home",
        icon: "Home",
      },
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard",
      },
      {
        id: "settings",
        label: "Settings",
        icon: "Settings",
        children: [
          {
            id: "profile",
            label: "Profile",
            icon: "User",
          },
          {
            id: "preferences",
            label: "Preferences",
            icon: "Sliders",
          },
        ],
      },
    ],
    orientation: "vertical",
    showIcons: true,
    theme: "default",
    collapsible: true,
  },
};

export default MenuWidget;
