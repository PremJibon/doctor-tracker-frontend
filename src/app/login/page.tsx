import { LoginForm } from "@/features/auth/components/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Doctor Tracker",
  description: "Sign in to access the Doctor Tracker administrative portal.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md flex flex-col items-center">
        <LoginForm />
        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; 2026 Doctor Tracker Healthcare System. Confidential & Secure.
        </p>
      </div>
    </main>
  );
}
