"use client";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/utils/auth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import sidelinks from "@/lib/constants/side-links";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push("/");
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <span className="text-4xl font-semibold p-2 ">IETC</span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidelinks.map((item) => {
                const isActive = pathname === item.links;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? "!bg-primary-600 !text-white [&_svg]:!text-white"
                          : ""
                      }
                    >
                      <a href={item.links} className="flex items-center gap-2">
                        <item.icon className="shrink-0" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="flex-1 flex flex-col justify-end p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="bg-primary-600 text-white px-3 py-1 hover:bg-primary-600 hover:text-white"
                onClick={handleLogout}
              >
                <button className="flex items-center gap-2 w-full">
                  <LogOut className="shrink-0" />
                  <span className="font-semibold">Logout</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
