"use client";

import React, { useState } from "react";
import { Search, Plus, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getRegisteredWidgets } from "@/widgets";

interface WidgetMarketplaceProps {
  onAddWidget: (widgetId: string, title: string) => void;
}

const WidgetMarketplace: React.FC<WidgetMarketplaceProps> = ({
  onAddWidget = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<any | null>(null);
  const [customTitle, setCustomTitle] = useState("");

  const widgets = getRegisteredWidgets();

  const filteredWidgets = widgets.filter((widget) => {
    const matchesSearch =
      widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? widget.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(widgets.map((widget) => widget.category)),
  );

  const handleAddWidget = () => {
    if (selectedWidget) {
      onAddWidget(selectedWidget.id, customTitle || selectedWidget.name);
      setSelectedWidget(null);
      setCustomTitle("");
    }
  };

  const getLucideIcon = (iconName: string) => {
    // This is a simplified approach - in a real app, you'd dynamically import icons
    const iconStyle = "h-5 w-5 text-primary";
    return (
      <div
        className={`bg-primary/10 p-2 rounded-full flex items-center justify-center`}
      >
        <Info className={iconStyle} />
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Widget Marketplace</h2>
        <p className="text-muted-foreground">
          Browse and add widgets to your dashboard
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWidgets.length > 0 ? (
          filteredWidgets.map((widget) => (
            <Card key={widget.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getLucideIcon(widget.icon)}
                      <div>
                        <h3 className="font-medium">{widget.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {widget.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{widget.category}</Badge>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      v{widget.version}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      By {widget.author}
                    </span>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedWidget(widget);
                          setCustomTitle(widget.name);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Widget to Dashboard</DialogTitle>
                        <DialogDescription>
                          Customize the widget before adding it to your
                          dashboard.
                        </DialogDescription>
                      </DialogHeader>

                      {selectedWidget && (
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Widget Title
                            </label>
                            <Input
                              value={customTitle}
                              onChange={(e) => setCustomTitle(e.target.value)}
                              placeholder="Enter widget title"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Widget Size
                            </label>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                Small
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1"
                              >
                                Medium
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                Large
                              </Button>
                            </div>
                          </div>

                          <div className="pt-4 flex justify-end">
                            <Button onClick={handleAddWidget}>
                              Add to Dashboard
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No widgets found matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetMarketplace;
