# Menu Widget Development Guide

## Introduction

This guide provides comprehensive documentation for developers who want to create and integrate a Menu Widget for the Enterprise Widget Integration Platform. The Menu Widget allows users to display and interact with navigation menus, dropdown menus, or any hierarchical menu structure within the dashboard.

## Vertical Slice Architecture

This project follows a vertical slice architecture, which means each widget is a self-contained feature with its own:

- UI Components
- Business Logic
- Data Access (Local Storage)

This approach allows for independent development and deployment of widgets without affecting other parts of the system.

## Menu Widget Structure

### Basic Structure

A Menu Widget is a React component that follows the standard widget structure with specific menu-related functionality:

```typescript
import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    theme: "default"
  },
}) => {
  const { menuItems, orientation, showIcons, theme } = config;
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    // Store the active item in local storage
    localStorage.setItem(`menu-widget-${id}-active-item`, itemId);
  };

  // Load active item from local storage on mount
  React.useEffect(() => {
    const savedActiveItem = localStorage.getItem(`menu-widget-${id}-active-item`);
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }
  }, [id]);

  const renderMenuItem = (item: MenuItem) => {
    const isActive = activeItem === item.id;
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div 
        key={item.id}
        className={`menu-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''} ${theme}`}
        onClick={() => !item.disabled && handleItemClick(item.id)}
      >
        <div className="menu-item-content">
          {showIcons && item.icon && (
            <span className="menu-item-icon">
              {/* Use Lucide icon if available */}
              <Menu className="h-4 w-4" />
            </span>
          )}
          <span className="menu-item-label">{item.label}</span>
        </div>
        
        {hasChildren && (
          <div className="menu-item-children">
            {item.children!.map(child => renderMenuItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full menu-widget ${orientation} ${theme}`}>
      <div className="menu-widget-header">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className="menu-widget-content">
        {menuItems.length > 0 ? (
          menuItems.map(item => renderMenuItem(item))
        ) : (
          <div className="empty-state">
            <p className="text-muted-foreground text-center">
              No menu items configured
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const widgetMetadata = {
  name: "Menu Widget",
  description: "A customizable menu widget for navigation and hierarchical data",
  version: "1.0.0",
  author: "Your Name",
  category: "tools",
  icon: "Menu",
  defaultSize: "medium",
  defaultConfig: {
    menuItems: [
      {
        id: "home",
        label: "Home",
        icon: "Home"
      },
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard"
      },
      {
        id: "settings",
        label: "Settings",
        icon: "Settings",
        children: [
          {
            id: "profile",
            label: "Profile",
            icon: "User"
          },
          {
            id: "preferences",
            label: "Preferences",
            icon: "Sliders"
          }
        ]
      }
    ],
    orientation: "vertical",
    showIcons: true,
    theme: "default"
  },
};

export default MenuWidget;
```

## Styling the Menu Widget

Use Tailwind CSS for styling your menu widget. Here's an example of how to style the menu widget with Tailwind:

```typescript
// Enhanced version with Tailwind CSS styling
const MenuWidget: React.FC<MenuWidgetProps> = ({
  id,
  title,
  size = "medium",
  config = {
    menuItems: [],
    orientation: "vertical",
    showIcons: true,
    theme: "default"
  },
}) => {
  const { menuItems, orientation, showIcons, theme } = config;
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Handle item click
  const handleItemClick = (itemId: string, hasChildren: boolean) => {
    setActiveItem(itemId);
    
    // Toggle expanded state for items with children
    if (hasChildren) {
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    }
    
    // Store in local storage
    localStorage.setItem(`menu-widget-${id}-active-item`, itemId);
    localStorage.setItem(`menu-widget-${id}-expanded-items`, JSON.stringify([...expandedItems]));
  };

  // Load from local storage on mount
  React.useEffect(() => {
    const savedActiveItem = localStorage.getItem(`menu-widget-${id}-active-item`);
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }
    
    const savedExpandedItems = localStorage.getItem(`menu-widget-${id}-expanded-items`);
    if (savedExpandedItems) {
      try {
        const parsed = JSON.parse(savedExpandedItems);
        setExpandedItems(new Set(parsed));
      } catch (e) {
        console.error("Failed to parse expanded items from local storage", e);
      }
    }
  }, [id]);

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isActive = activeItem === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    
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
      <div key={item.id} className={`w-full ${depth > 0 ? 'pl-4' : ''}`}>
        <div 
          className={`
            flex items-center justify-between p-2 rounded-md cursor-pointer
            ${isActive ? 'bg-primary/10 text-primary' : ''}
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${getThemeClasses()}
          `}
          onClick={() => !item.disabled && handleItemClick(item.id, hasChildren)}
        >
          <div className="flex items-center gap-2">
            {showIcons && item.icon && (
              <Menu className="h-4 w-4" />
            )}
            <span className={`${size === "small" ? "text-sm" : "text-base"}`}>
              {item.label}
            </span>
          </div>
          
          {hasChildren && (
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 ml-2 border-l border-border pl-2">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card text-card-foreground rounded-md overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className={`flex-1 p-3 overflow-auto ${orientation === "horizontal" ? "flex flex-row" : "flex flex-col"} gap-1`}>
        {menuItems.length > 0 ? (
          menuItems.map(item => renderMenuItem(item))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              No menu items configured
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
```

## Local Storage Integration

The Menu Widget uses local storage to persist user preferences and state:

1. **Active Item**: Stores the currently selected menu item
2. **Expanded Items**: Stores which menu items are expanded (for nested menus)
3. **User Preferences**: Stores user-specific settings for the menu

Example local storage implementation:

```typescript
// Save menu state to local storage
const saveMenuState = () => {
  const menuState = {
    activeItem,
    expandedItems: [...expandedItems],
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(`menu-widget-${id}-state`, JSON.stringify(menuState));
};

// Load menu state from local storage
const loadMenuState = () => {
  const savedState = localStorage.getItem(`menu-widget-${id}-state`);
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      setActiveItem(parsedState.activeItem || null);
      setExpandedItems(new Set(parsedState.expandedItems || []));
    } catch (e) {
      console.error("Failed to parse menu state from local storage", e);
    }
  }
};

// Use in useEffect
React.useEffect(() => {
  loadMenuState();
}, [id]);

// Save state when it changes
React.useEffect(() => {
  saveMenuState();
}, [activeItem, expandedItems]);
```

## Best Practices

### 1. Performance Optimization

- Use React.memo for menu items to prevent unnecessary re-renders
- Implement virtualization for large menus using windowing techniques
- Lazy load nested menu items only when parent items are expanded

```typescript
const MenuItem = React.memo(({ item, depth, isActive, isExpanded, onItemClick }) => {
  // Component implementation
});
```

### 2. Accessibility

- Ensure proper keyboard navigation (arrow keys, Enter, Escape)
- Use appropriate ARIA attributes for menu items
- Support screen readers with descriptive text

```typescript
// Accessible menu item
<div
  role="menuitem"
  tabIndex={0}
  aria-disabled={item.disabled}
  aria-expanded={hasChildren ? isExpanded : undefined}
  aria-haspopup={hasChildren}
  aria-current={isActive ? "page" : undefined}
  onKeyDown={handleKeyDown}
  onClick={handleClick}
>
  {/* Item content */}
</div>
```

### 3. Responsive Design

- Adapt menu layout based on available space
- Implement collapsible menus for mobile views
- Use appropriate font sizes and spacing for different screen sizes

```typescript
// Responsive menu container
<div className={`
  menu-container
  ${size === "small" ? "text-sm space-y-1" : "text-base space-y-2"}
  ${orientation === "horizontal" ? "flex flex-row space-x-2" : "flex flex-col space-y-2"}
  ${isMobile ? "overflow-x-auto" : ""}
`}>
  {/* Menu items */}
</div>
```

### 4. Error Handling

- Gracefully handle missing or malformed menu data
- Provide fallback UI for error states
- Log errors for debugging

```typescript
const renderMenuItems = () => {
  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="empty-state">
        <p>No menu items available</p>
      </div>
    );
  }
  
  try {
    return menuItems.map(item => renderMenuItem(item));
  } catch (error) {
    console.error("Error rendering menu items", error);
    return (
      <div className="error-state">
        <p>Failed to render menu. Please check configuration.</p>
      </div>
    );
  }
};
```

## Widget Registration

To make your Menu Widget available in the platform, register it in the widget registry:

1. Create your Menu Widget in `src/widgets/MenuWidget.tsx`
2. Export the widget and its metadata
3. Register the widget in `src/widgets/index.ts`:

```typescript
// src/widgets/index.ts
import MenuWidget, { widgetMetadata as menuWidgetMetadata } from "./MenuWidget";

export const widgetRegistry = {
  // Existing widgets...
  "menu-widget": {
    component: MenuWidget,
    metadata: menuWidgetMetadata,
  },
};
```

## Testing Your Menu Widget

Before publishing your widget, test it thoroughly:

1. Test with different configurations (horizontal/vertical, with/without icons)
2. Test with nested menu structures of varying depths
3. Test responsive behavior on different screen sizes
4. Test keyboard navigation and accessibility
5. Test local storage persistence across page reloads

## Example Implementation

Here's a complete example of a Menu Widget implementation:

```typescript
// src/widgets/MenuWidget.tsx
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
    collapsible: true
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
        lastUpdated: new Date().toISOString()
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
  const handleItemClick = useCallback((itemId: string, hasChildren: boolean) => {
    setActiveItem(itemId);
    
    if (hasChildren) {
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    }
  }, []);

  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  // Render a menu item
  const renderMenuItem = useCallback((item: MenuItem, depth = 0) => {
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
      <div key={item.id} className={`w-full ${depth > 0 ? 'pl-4' : ''}`}>
        <div 
          role="menuitem"
          tabIndex={0}
          aria-disabled={item.disabled}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-haspopup={hasChildren}
          aria-current={isActive ? "page" : undefined}
          className={`
            flex items-center justify-between p-2 rounded-md
            ${!item.disabled ? 'cursor-pointer' : 'cursor-not-allowed'}
            ${isActive ? 'bg-primary/10 text-primary' : ''}
            ${item.disabled ? 'opacity-50' : ''}
            ${getThemeClasses()}
            transition-colors duration-200
          `}
          onClick={() => !item.disabled && handleItemClick(item.id, hasChildren)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              !item.disabled && handleItemClick(item.id, hasChildren);
            }
          }}
        >
          <div className="flex items-center gap-2">
            {showIcons && item.icon && (
              <Menu className="h-4 w-4" />
            )}
            <span className={`${size === "small" ? "text-sm" : "text-base"} truncate`}>
              {item.label}
            </span>
          </div>
          
          {hasChildren && (
            orientation === "vertical" ? (
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              />
            ) : (
              <ChevronRight 
                className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
              />
            )
          )}
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
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }, [activeItem, expandedItems, handleItemClick, orientation, showIcons, size, theme]);

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
              className={`h-4 w-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} 
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
            menuItems.map(item => renderMenuItem(item))
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
  description: "A customizable menu widget for navigation and hierarchical data",
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
        icon: "Home"
      },
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard"
      },
      {
        id: "settings",
        label: "Settings",
        icon: "Settings",
        children: [
          {
            id: "profile",
            label: "Profile",
            icon: "User"
          },
          {
            id: "preferences",
            label: "Preferences",
            icon: "Sliders"
          }
        ]
      }
    ],
    orientation: "vertical",
    showIcons: true,
    theme: "default",
    collapsible: true
  },
};

export default MenuWidget;
```

## Conclusion

By following this guide, you should be able to create and integrate a Menu Widget for the Enterprise Widget Integration Platform. Remember to follow the best practices outlined in this document to ensure your widget is performant, accessible, and provides a great user experience.

For any questions or support, please refer to the platform documentation or contact the platform team.
