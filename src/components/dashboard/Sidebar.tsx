import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  History,
  Star,
  Code,
  FileText,
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  className?: string;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const NavItem = ({
  href,
  icon,
  label,
  active = false,
  expanded = false,
  onClick,
  children,
}: NavItemProps) => {
  const hasChildren = Boolean(children);

  return (
    <div className="w-full">
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground",
        )}
        onClick={onClick}
      >
        <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
        <span className="flex-1">{label}</span>
        {hasChildren && (
          <span className="flex h-5 w-5 items-center justify-center">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </Link>
      {hasChildren && expanded && (
        <div className="ml-6 mt-1 space-y-1">{children}</div>
      )}
    </div>
  );
};

const Sidebar = ({ className = "" }: SidebarProps) => {
  const pathname = usePathname();
  const [platformExpanded, setPlatformExpanded] = React.useState(true);
  const [projectsExpanded, setProjectsExpanded] = React.useState(true);

  return (
    <div
      className={cn(
        "flex h-full w-[280px] flex-col bg-background p-4",
        className,
      )}
    >
      {/* Company Logo and Name */}
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
          <Boxes size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold">Acme Inc</span>
          <span className="text-xs text-muted-foreground">Enterprise</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8"
          aria-label="Refresh"
        >
          <RefreshCw size={16} />
        </Button>
      </div>

      <Separator className="my-4" />

      {/* Platform Section */}
      <div className="mb-2">
        <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">
          Platform
        </h3>
        <div className="space-y-1">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={pathname === "/dashboard"}
          />
          <NavItem
            href="#"
            icon={<History size={18} />}
            label="History"
            active={pathname === "/history"}
          />
          <NavItem
            href="#"
            icon={<Star size={18} />}
            label="Starred"
            active={pathname === "/starred"}
          />
          <NavItem
            href="#"
            icon={<Settings size={18} />}
            label="Settings"
            active={pathname === "/settings"}
          />
        </div>
      </div>

      {/* Models Section */}
      <div className="mb-2">
        <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">
          Models
        </h3>
        <div className="space-y-1">
          <NavItem
            href="#"
            icon={<Boxes size={18} />}
            label="Models"
            active={pathname === "/models"}
            expanded={platformExpanded}
            onClick={() => setPlatformExpanded(!platformExpanded)}
          >
            <NavItem
              href="#"
              icon={<Code size={16} />}
              label="API Reference"
              active={pathname === "/models/api"}
            />
            <NavItem
              href="#"
              icon={<BarChart3 size={16} />}
              label="Performance"
              active={pathname === "/models/performance"}
            />
          </NavItem>
        </div>
      </div>

      {/* Documentation Section */}
      <div className="mb-2">
        <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">
          Documentation
        </h3>
        <div className="space-y-1">
          <NavItem
            href="#"
            icon={<FileText size={18} />}
            label="Documentation"
            active={pathname === "/documentation"}
          />
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-2">
        <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">
          Projects
        </h3>
        <div className="space-y-1">
          <NavItem
            href="#"
            icon={<Code size={18} />}
            label="Design Engineering"
            active={pathname === "/projects/design"}
          />
          <NavItem
            href="#"
            icon={<BarChart3 size={18} />}
            label="Sales & Marketing"
            active={pathname === "/projects/sales"}
          />
          <NavItem
            href="#"
            icon={<Settings size={18} />}
            label="Travel"
            active={pathname === "/projects/travel"}
          />
        </div>
      </div>

      {/* User Profile at Bottom */}
      <div className="mt-auto">
        <Separator className="my-4" />
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=shadcn"
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">shadcn</span>
            <span className="text-xs text-muted-foreground">m@example.com</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            aria-label="User settings"
          >
            <Settings size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
