
import React from "react";
import { Link } from "react-router-dom";
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
  ArrowLeft,
  PanelLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "react-router-dom";

// Simple hook to check if mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

// Create sidebar context
const SidebarContext = React.createContext({ expanded: true, setExpanded: (value: boolean) => {} });

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [expanded, setExpanded] = React.useState(true);
  
  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => React.useContext(SidebarContext);

interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export function Sidebar({ className, children }: SidebarProps) {
  const { expanded, setExpanded } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "h-full flex flex-col border-r bg-background transition-all duration-300",
        expanded ? "w-[220px]" : "w-[60px]",
        className
      )}
    >
      <div className="flex h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => setExpanded(!expanded)}
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        {expanded && (
          <h1 className="text-lg font-bold">المتجر</h1>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {children || <SidebarMenu />}
      </div>
    </div>
  );
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  const { expanded } = useSidebar();

  return (
    <div className={cn(
      "flex-1 overflow-auto transition-all duration-300",
      expanded ? "ml-[220px]" : "ml-[60px]"
    )}>
      {children}
    </div>
  );
}

export function SidebarMenu() {
  const { expanded } = useSidebar();
  const location = useLocation();

  const menuItems = [
    { href: "/dashboard", icon: <LayoutDashboard size={20} />, label: "لوحة التحكم" },
    { href: "/products", icon: <Package size={20} />, label: "المنتجات" },
    { href: "/orders", icon: <ShoppingCart size={20} />, label: "الطلبات" },
    { href: "/customers", icon: <Users size={20} />, label: "العملاء" },
    { href: "/suppliers", icon: <Truck size={20} />, label: "الموردين" },
    { href: "/reports", icon: <BarChart3 size={20} />, label: "التقارير" },
    { href: "/settings", icon: <Settings size={20} />, label: "الإعدادات" }
  ];

  return (
    <nav className="space-y-1 px-2">
      {menuItems.map((item) => (
        <Link 
          key={item.href} 
          to={item.href}
          className={cn(
            "flex items-center py-2 px-3 text-sm rounded-md hover:bg-accent",
            location.pathname === item.href ? "bg-accent" : "",
            expanded ? "justify-start" : "justify-center"
          )}
        >
          {item.icon}
          {expanded && <span className="mr-3">{item.label}</span>}
        </Link>
      ))}
    </nav>
  );
}

// Add any other components that might be needed
export const SidebarContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-full">{children}</div>
);

export const SidebarTrigger = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button {...props} variant="ghost" size="icon" />
);

export const SidebarRail = ({ children }: { children: React.ReactNode }) => (
  <div className="border-r h-full">{children}</div>
);

export const SidebarInset = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4">{children}</div>
);

export const SidebarInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={cn("w-full rounded-md border px-3 py-2", props.className)} />
);

export const SidebarHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border-b">{children}</div>
);

export const SidebarFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border-t mt-auto">{children}</div>
);

export const SidebarSeparator = () => (
  <div className="h-px bg-border my-2" />
);

export const SidebarGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-1 py-2">{children}</div>
);

export const SidebarGroupLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-3 text-xs font-medium text-muted-foreground">{children}</div>
);

export const SidebarGroupAction = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button {...props} variant="ghost" size="sm" className={cn("w-full justify-start", props.className)} />
);

export const SidebarGroupContent = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-1 px-3 py-1">{children}</div>
);

export const SidebarMenuAction = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button {...props} variant="ghost" size="sm" className={cn("w-full justify-start", props.className)} />
);

export const SidebarMenuBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-auto text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">{children}</span>
);

export const SidebarMenuButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button {...props} variant="ghost" size="sm" className={cn("w-full justify-start", props.className)} />
);

export const SidebarMenuItem = ({ children, active }: { children: React.ReactNode, active?: boolean }) => (
  <div className={cn("px-3 py-2 text-sm rounded-md", active ? "bg-accent" : "")}>{children}</div>
);

export const SidebarMenuSkeleton = () => (
  <div className="space-y-1 px-3 py-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
  </div>
);

export const SidebarMenuSub = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-1 pl-6 py-1">{children}</div>
);

export const SidebarMenuSubButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button {...props} variant="ghost" size="sm" className={cn("w-full justify-start", props.className)} />
);

export const SidebarMenuSubItem = ({ children, active }: { children: React.ReactNode, active?: boolean }) => (
  <div className={cn("px-3 py-1 text-sm rounded-md", active ? "bg-accent/50" : "")}>{children}</div>
);
