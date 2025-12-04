import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Bell } from "lucide-react";
import { useNotificationsButton } from "./useNotificationsButton";

export function NotificationsButton() {
  const { notifications, unreadCount, setUnreadCount } =
    useNotificationsButton();
  return (
    <TooltipProvider>
      <Tooltip
        onOpenChange={(open) => {
          if (open) setUnreadCount(0);
        }}
      >
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            aria-label="Notifications"
            className="relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-gray-900 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>

        <TooltipContent className="w-80 p-3 bg-white dark:bg-gray-800 border rounded shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Notifications</div>
            <div className="text-xs text-muted-foreground">Latest</div>
          </div>

          <div className="space-y-2 max-h-64 overflow-auto">
            {notifications.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={i}
                  className="p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="text-sm font-medium">{n.event}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {n.data?.message ?? JSON.stringify(n.data)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.receivedAt).toLocaleString()}
                  </div>
                  <Separator className="my-2" />
                </div>
              ))
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
