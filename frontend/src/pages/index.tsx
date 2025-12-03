import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import LoginPage from "./login";
import DashboardPage from "./dashboard";
import SettingsPage from "./settings";
import { HomePageLayout } from "@/layouts/home-layout";
import { isAuthenticated } from "@/features/auth/api/login";

// --- A. Define the Root Route ---
const rootRoute = createRootRoute({
  component: () => (
    <>
      {/* You might add a global header/footer here if needed */}
      <div id="app-content">
        <Outlet />
      </div>
      {/* <TanStackRouterDevtools /> // Uncomment for dev tools */}
    </>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: async () => {
    // If already authenticated, redirect to dashboard
    const authenticated = await isAuthenticated();
    if (authenticated) {
      throw redirect({
        to: "/home/dashboard",
      });
    }
  },
});

const homeLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "home",
  component: HomePageLayout,

  // *** PROTECTION GUARD FOR ALL /home/* ROUTES ***
  beforeLoad: async ({ location }) => {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },

  // Handle route errors (e.g., 401 from API calls)
  errorComponent: ({ error }) => {
    // If it's a 401 error, redirect to login
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      error.statusCode === 401
    ) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
    // Otherwise, show error page
    return <div>Error loading dashboard: {String(error)}</div>;
  },
});

// --- D. Nested Protected Routes ---
const dashboardRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: "dashboard",
  component: DashboardPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: "settings",
  component: SettingsPage,
});

// --- E. Assemble the Route Tree ---
const routeTree = rootRoute.addChildren([
  loginRoute,
  homeLayoutRoute.addChildren([
    dashboardRoute,
    settingsRoute,
    // Add an index route to redirect /home to /home/dashboard
    createRoute({
      getParentRoute: () => homeLayoutRoute,
      path: "/",
      loader: () => {
        throw redirect({
          to: "/home/dashboard",
        });
      },
    }),
  ]),
]);

export const router = createRouter({ routeTree });
