"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  Boxes,
  Tags,
  Image as ImageIcon,
  BookText,
  Menu,
  X,
  LogOut,
  Settings,
  User,
} from "lucide-react";

const sidelinks = [
  {
    id: 1,
    title: "Dashboard",
    links: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: "Dealers",
    links: "/dealers",
    icon: Users,
  },
  {
    id: 3,
    title: "Inventory",
    links: "/inventory",
    icon: Boxes,
  },
  {
    id: 4,
    title: "Categories",
    links: "/categories",
    icon: Tags,
  },
  {
    id: 5,
    title: "Media Center",
    links: "/media-center",
    icon: ImageIcon,
  },
  {
    id: 6,
    title: "Ledger",
    links: "/ledger",
    icon: BookText,
  },
];

interface SidebarProps {
  activeLink?: string;
  onLinkClick?: (link: string) => void;
  onLogout?: () => void;
}

export function Sidebar({
  activeLink = "/dashboard",
  onLinkClick,
  onLogout,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleLinkClick = (link: string) => {
    if (onLinkClick) {
      onLinkClick(link);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      console.log("Logout clicked");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">AdminPanel</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-100"
        >
          {isCollapsed ? (
            <Menu className="w-4 h-4 text-slate-600" />
          ) : (
            <X className="w-4 h-4 text-slate-600" />
          )}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {sidelinks.map((item) => {
          const Icon = item.icon;
          const isActive = activeLink === item.links;

          return (
            <button
              key={item.id}
              onClick={() => handleLinkClick(item.links)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-slate-500 group-hover:text-slate-700"
                )}
              />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.title}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Profile Section */}
      <div className="p-4 border-t border-slate-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 transition-colors",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400" />
                <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-900">Admin</p>
                  <p className="text-xs text-slate-500">admin@company.com</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={isCollapsed ? "center" : "start"}
            className="w-56 mb-2"
          >
            <DropdownMenuLabel className="font-semibold text-slate-900">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
