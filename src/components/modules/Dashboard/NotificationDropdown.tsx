"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Calendar, CheckCircle, Clock, UserPlus } from "lucide-react";

interface INotification {
  id: string;
  title: string;
  message: string;
  type: "appointment" | "schedule" | "system" | "user";
  timeStamp: Date;
  read: boolean;
}

const MOCK_NOTIFICATIONS: INotification[] = [
  {
    id: "1",
    title: "New Appointment",
    message: "You have a new appointment scheduled for tomorrow at 10 AM.",
    type: "appointment",
    timeStamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    read: false,
  },
  {
    id: "2",
    title: "Schedule Updated",
    message: "Dr. Rahman has updated their availability for next week.",
    type: "schedule",
    timeStamp: new Date(Date.now() - 24 * 60 * 60 * 1000), //  1 day ago
    read: true,
  },
  {
    id: "3",
    title: "Appointment Reminder",
    message: "Your appointment with Dr. Ahmed starts in 30 minutes.",
    type: "appointment",
    timeStamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    read: false,
  },
  {
    id: "4",
    title: "System Maintenance",
    message:
      "The system will undergo scheduled maintenance tonight from 2 AM to 4 AM.",
    type: "system",
    timeStamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
    read: true,
  },
  {
    id: "5",
    title: "Profile Update",
    message: "A new user has registered and is awaiting verification.",
    type: "user",
    timeStamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: false,
  },
];

const getNotificationIcon = (type: INotification["type"]) => {
  switch (type) {
    case "appointment":
      return <Calendar className="w-4 h-4 text-blue-500" />;
    case "schedule":
      return <Clock className="w-4 h-4 text-green-500" />;
    case "system":
      return <CheckCircle className="w-4 h-4 text-red-500" />;
    case "user":
      return <UserPlus className="w-4 h-4 text-yellow-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const NotificationDropdown = () => {
  const unreadCount = MOCK_NOTIFICATIONS.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant={"outline"} size={"icon"} className="relative">
          <Bell className="w-5 h-5" />
          <Badge
            className="w-5 h-5 absolute -top-1 -right-1 rounded-full p-0 flex justify-center items-center"
            variant={"destructive"}>
            <span className="text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </Badge>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notidications</span>
          {unreadCount > 0 && (
            <Badge variant={"secondary"} className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
