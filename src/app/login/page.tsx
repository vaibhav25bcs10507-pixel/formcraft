import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/dashboard");
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm">⚡</span>
          FormCraft
        </Link>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-neutral-500">
          Credentials are set with <code className="rounded bg-neutral-800 px-1.5 py-0.5">ADMIN_EMAIL</code> /{" "}
          <code className="rounded bg-neutral-800 px-1.5 py-0.5">ADMIN_PASSWORD</code> env vars.
        </p>
      </div>
    </main>
  );
}
