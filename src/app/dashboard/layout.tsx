import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) redirect("/login");
  return (
    <div className="flex min-h-screen flex-1 bg-neutral-100">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
