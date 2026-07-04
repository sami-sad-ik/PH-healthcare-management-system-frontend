"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavSection } from "@/types/navItems.types";
import { UserInfo } from "@/types/user.types";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import { Input } from "@/components/ui/input";

interface DashboardNavbarContentProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

const DashboardNavbarContent = ({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardNavbarContentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      {/* toggle mobile menu  */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="md:hidden">
          <Button variant="outline" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <DashboardMobileSidebar
            userInfo={userInfo}
            navItems={navItems}
            dashboardHome={dashboardHome}
          />
        </SheetContent>
      </Sheet>

      {/* search component */}
      <div className="flex-1 flex justify-end items-center gap-2">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input type="text" placeholder="Search..." className="pl-9 pr-4" />
        </div>
      </div>

      {/* right side actions */}

      {/* notifications */}
    </div>
  );
};

export default DashboardNavbarContent;
