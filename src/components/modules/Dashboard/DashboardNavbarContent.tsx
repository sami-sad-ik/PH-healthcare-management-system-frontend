"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavSection } from "@/types/navItems.types";
import { UserInfo } from "@/types/user.types";
import { Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import { Input } from "@/components/ui/input";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";

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
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkSmallScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkSmallScreen();
    window.addEventListener("resize", checkSmallScreen);
    return () => {
      window.removeEventListener("resize", checkSmallScreen);
    };
  }, []);

  return (
    <header className="w-full border-b bg-card">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* toggle mobile menu */}
          <Sheet open={isOpen && isMobile} onOpenChange={setIsOpen}>
            <SheetTrigger render={<Button variant="outline" size="icon"><Menu className="w-5 h-5" /></Button>} className="md:hidden" />
            <SheetContent side="left" className="w-64 p-0">
              <DashboardMobileSidebar
                userInfo={userInfo}
                navItems={navItems}
                dashboardHome={dashboardHome}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* center: search */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" placeholder="Search..." className="pl-9 pr-4" />
          </div>
        </div>

        {/* right side actions */}
        <div className="flex items-center gap-3">
          <NotificationDropdown />
          <UserDropdown userInfo={userInfo} />
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbarContent;
