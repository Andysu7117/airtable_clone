"use client";

import { useState } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  // const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        setError(data.message ?? "Unable to create account");
        return;
      }
      console.log("signing in email is " + email);
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/home",
      });
    } catch (_err) {
      setError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-xl px-6">
        <div className="mb-8 flex items-center space-x-3">
          <div className="h-6 w-6 rounded-sm" style={{ background: "linear-gradient(45deg,#f54,#ff0)" }} />
          <h1 className="text-2xl font-semibold text-gray-900">Welcome to Airtable</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Work email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">⚙️</div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-60"
          >
            Continue with email
          </button>
        </form>

        <div className="my-6 text-center text-sm text-gray-500">or</div>

        <div className="space-y-3">
          <Link
            href="#"
            className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-50"
          >
            Continue with <span className="font-medium">Single Sign On</span>
          </Link>

          <Link
            href="/api/auth/signin/google"
            className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-50"
          >
            <span className="mr-2">🟢</span> Continue with <span className="font-medium">Google</span>
          </Link>

          <button
            disabled
            className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-sm text-gray-400"
          >
            <span className="mr-2"></span> Continue with <span className="font-medium">Apple</span>
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-600">
          By creating an account, you agree to the <a className="underline" href="#">Terms of Service</a> and <a className="underline" href="#">Privacy Policy</a>.
        </p>

        <label className="mt-3 flex items-start space-x-2 text-xs text-gray-600">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-gray-300"
          />
          <span>
            By checking this box, you agree to receive marketing and sales communications about Airtable products, services, and events. You understand that you can manage your preferences at any time by following the instructions in the communications received.
          </span>
        </label>

        <p className="mt-6 text-sm text-gray-600">
          Already have an account? <Link href="/" className="underline">Sign in</Link>
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}


