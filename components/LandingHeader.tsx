import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export const LandingHeader = () => {
  return (
    <header className="max-w-6xl mx-auto w-full p-6 flex justify-between items-center">
      <div
        className="text-2xl font-bold flex items-center"
        role="button"
        onClick={() => redirect("/")}
      >
        DAOnation
      </div>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <a
              href="/about-us"
              className="hover:text-zinc-300 transition-colors hover:underline"
            >
              About
            </a>
          </li>
          <li>
            <a
              role="button"
              onClick={async () => {
                await signIn("google", {
                  redirect: true,
                  callbackUrl: "/edit-profile",
                });
              }}
              className="hover:text-zinc-300 transition-colors hover:underline"
            >
              Get Started
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};
