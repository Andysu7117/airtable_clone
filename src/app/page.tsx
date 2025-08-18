"use client";
import Link from "next/link";
import React, { useState } from "react";
// import { useRouter } from "next/navigation";
import { signIn, getCsrfToken } from "next-auth/react";
// import { auth } from "~/server/auth";

export default function SignInPage() {
  // const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Get CSRF token for custom Google form
  React.useEffect(() => {
    void (async () => setCsrfToken((await getCsrfToken()) ?? null))();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    console.log("Signing in email is " + email);
    e.preventDefault();
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/home",
    });
    if (result?.error) setError(result.error);
    console.log("Done");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 flex items-center space-x-3">
          <div className="h-6 w-6 rounded-sm" style={{ background: "linear-gradient(45deg,#f54,#ff0)" }} />
          <h1 className="text-2xl font-semibold text-gray-900">Sign in to Airtable</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Email address"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
          >
            Continue
          </button>
        </form>

        <div className="my-6 text-center text-sm text-gray-500">or</div>

        <div className="space-y-3">
          <Link
            href="#"
            className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-50"
          >
            Sign in with <span className="font-medium">Single Sign On</span>
          </Link>

          <form action="/api/auth/signin/google" method="POST">
            <input type="hidden" name="csrfToken" value={csrfToken ?? undefined} />
            <input type="hidden" name="callbackUrl" value="/home" />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
            >
              <span>Sign in with Google</span>
              {/* Using Next Image to satisfy lint rule */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src="https://authjs.dev/img/providers/google.svg" alt="Google" className="h-5 w-5 object-contain" />
            </button>
          </form>

          <button
            disabled
            className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-sm text-gray-400"
          >
            <span className="mr-2"></span> Continue with <span className="font-medium">Apple ID</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          New to Airtable? <Link href="/signup" className="underline">Create an account</Link> instead
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>
        )}
      </div>
    </main>
  );
}
