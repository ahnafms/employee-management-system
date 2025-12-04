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
import DetailEmployeePage from "./detail-employee";

// --- A. Define the Root Route ---
const rootRoute = createRootRoute({
  component: () => (
    <>
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

  errorComponent: ({ error }) => {
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
    return <div>Error loading dashboard: {String(error)}</div>;
  },
});

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

export const employeeDetailRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: "employee/$employeeId",
  component: DetailEmployeePage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  homeLayoutRoute.addChildren([
    employeeDetailRoute,
    dashboardRoute,
    settingsRoute,
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
