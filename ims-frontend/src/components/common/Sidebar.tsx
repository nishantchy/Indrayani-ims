"use client";
import React from "react";
import sidelinks from "@/lib/constants/side-links";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/utils/auth";
import { LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="w-64 h-full bg-gradient-to-b from-gray-50 to-white border-r flex flex-col p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2 tracking-wide">
          Menu
        </h2>
        <nav className="flex flex-col gap-1">
          {sidelinks.map((link) => {
            const isActive = pathname === link.links;
            return (
              <Link
                key={link.id}
                href={link.links}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-base hover:bg-gray-100 ${
                  isActive
                    ? "bg-gray-200 text-primary font-semibold"
                    : "text-gray-700"
                }`}
              >
                <link.icons className="w-5 h-5" />
                <span>{link.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto pt-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full font-medium"
        >
          <LogOut width={20} height={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
