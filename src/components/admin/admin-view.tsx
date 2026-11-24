"use client";

import { useAdminSession } from "@/lib/queries";
import { AdminLogin } from "./admin-login";
import { Dashboard } from "./dashboard";

export function AdminView() {
  const { data, isLoading } = useAdminSession();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-espresso">
        <div className="size-10 animate-spin rounded-full border-2 border-champagne border-t-mocha" />
      </div>
    );
  }

  if (!data?.authenticated || !data.admin) {
    return <AdminLogin />;
  }

  return <Dashboard admin={data.admin} />;
}
