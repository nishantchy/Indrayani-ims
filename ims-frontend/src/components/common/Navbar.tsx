import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  return (
    <nav className="w-full h-16 flex items-center justify-between px-8 bg-white border-b shadow-sm">
      <h1 className="text-xl font-bold tracking-tight text-gray-800">
        Sayana Homeland
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Admin</span>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
