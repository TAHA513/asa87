import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Link, useLocation as useWouterLocation } from "wouter";
import {
  BarChart3,
  CalendarIcon,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
  Database,
  FileText,
  Truck,
  BarChartHorizontal,
  ArrowLeft
} from "lucide-react";

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextType = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
}

import React from "react";
import { useLocation as useReactRouterLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Calendar as CalendarIcon,
  BarChart3,
  FileText,
  Truck,
  Wallet,
  Database,
  BarChartHorizontal,
  Settings,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("h-full w-[220px] flex flex-col border-r bg-background", className)}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">نظام المتجر</h2>
      </div>
      <div className="flex-1 py-4">
        <SidebarNav />
      </div>
      <div className="p-4 border-t">
        <Link to="/settings" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
          <span>الإعدادات</span>
        </Link>
      </div>
    </div>
  );
}

// إضافة مكون SidebarNav
export function SidebarNav() {
  const location = useReactRouterLocation();

  const routes = [
    {
      title: "لوحة التحكم",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "المنتجات",
      href: "/products",
      icon: Package,
    },
    {
      title: "المبيعات",
      href: "/sales",
      icon: ShoppingCart,
    },
    {
      title: "العملاء",
      href: "/customers",
      icon: Users,
    },
    {
      title: "التقارير",
      href: "/reports",
      icon: BarChart3,
    },
    {
      title: "إعدادات المتجر",
      href: "/store-settings",
      icon: Settings,
    }
  ];

  return (
    <nav className="space-y-1 px-2">
      {routes.map((route) => {
        const Icon = route.icon;
        const isActive = location.pathname === route.href;

        return (
          <Link
            key={route.href}
            to={route.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{route.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
}

export function Carousel({
  children,
  className,
  ...props
}: CarouselProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
    </div>
  );
}

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        "-left-12 top-1/2 -translate-y-1/2",
        className
      )}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

export {
  CarouselPrevious,
  SidebarContainer,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
};