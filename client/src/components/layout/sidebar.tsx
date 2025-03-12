
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-provider";
import { LogOut, Menu, Sun, Moon, User, Settings, Info } from "lucide-react";
import { useAuth } from "@/context/use-auth";
import { Skeleton } from "../ui/skeleton";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [location, navigate] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  // التحقق من وجود المستخدم قبل استخدامه
  if (isLoading) {
    return (
      <div className={cn("pb-12 h-full flex flex-col", className)}>
        <div className="space-y-4 py-4 flex flex-col justify-between h-full">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <div className={cn("pb-12 h-full flex flex-col", className)}>
      <div className="space-y-4 py-4 flex flex-col justify-between h-full">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className={cn("text-lg font-semibold", !collapsed && "tracking-tight")}>
              {!collapsed ? "نظام المبيعات" : "ن.م"}
            </h2>
            <Button variant="ghost" size="icon" onClick={toggleCollapse}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-1">
            <Button
              variant={location === "/" ? "secondary" : "ghost"}
              onClick={() => navigate("/")}
              className={cn("w-full justify-start", collapsed && "justify-center")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mr-2"
              >
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              {!collapsed && <span>لوحة التحكم</span>}
            </Button>
            
            <Button
              variant={location === "/sales" ? "secondary" : "ghost"}
              onClick={() => navigate("/sales")}
              className={cn("w-full justify-start", collapsed && "justify-center")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mr-2"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {!collapsed && <span>المبيعات</span>}
            </Button>
            
            <Button
              variant={location === "/inventory" ? "secondary" : "ghost"}
              onClick={() => navigate("/inventory")}
              className={cn("w-full justify-start", collapsed && "justify-center")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mr-2"
              >
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
              </svg>
              {!collapsed && <span>المخزون</span>}
            </Button>
            
            <Button
              variant={location === "/marketing" ? "secondary" : "ghost"}
              onClick={() => navigate("/marketing")}
              className={cn("w-full justify-start", collapsed && "justify-center")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mr-2"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              {!collapsed && <span>التسويق</span>}
            </Button>
            
            <Button
              variant={location === "/settings" ? "secondary" : "ghost"}
              onClick={() => navigate("/settings")}
              className={cn("w-full justify-start", collapsed && "justify-center")}
            >
              <Settings className="h-5 w-5 mr-2" />
              {!collapsed && <span>الإعدادات</span>}
            </Button>
            
            <Button
              variant={location === "/about" ? "secondary" : "ghost"}
              onClick={() => navigate("/about")}
              className={cn("w-full justify-start", collapsed && "justify-center")}
            >
              <Info className="h-5 w-5 mr-2" />
              {!collapsed && <span>حول النظام</span>}
            </Button>
          </div>
        </div>
        
        <div className="px-3 py-2">
          <div className="space-y-1">
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start", collapsed && "justify-center")}
                >
                  <User className="h-5 w-5 mr-2" />
                  {!collapsed && (
                    <span className="truncate">{user?.displayName || user?.username || 'المستخدم'}</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className={cn("w-full justify-start", collapsed && "justify-center")}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  {!collapsed && <span>تسجيل الخروج</span>}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              onClick={toggleTheme}
              className={cn("w-full justify-start", collapsed && "justify-center")}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 mr-2" />
              ) : (
                <Sun className="h-5 w-5 mr-2" />
              )}
              {!collapsed && <span>{theme === "light" ? "الوضع الداكن" : "الوضع الفاتح"}</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
