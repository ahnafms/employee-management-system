import { Outlet, Link } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { NotificationsButton } from "@/features/employee/components/NotificationsButton";

const navItems = [{ name: "Dashboard", path: "/home/dashboard" }];

const Sidebar = () => {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 h-full p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
        App Name
      </h2>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`
              p-2 rounded-md transition-colors duration-200 
                ${
                  pathname === item.path
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }
            `}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <Separator className="my-4" />

      <Button
        variant="ghost"
        className="mt-auto text-left"
        onClick={() => {
          localStorage.removeItem("authToken");
        }}
      >
        Logout
      </Button>
    </div>
  );
};

export const HomePageLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to the Dashboard!
          </h1>
          <div className="flex items-center gap-4">
            <NotificationsButton />
          </div>
        </div>
        {/* The Outlet renders the nested route component (e.g., DashboardPage) */}
        <Outlet />
      </main>
    </div>
  );
};
