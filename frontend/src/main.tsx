import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY.includes("xxxx")) {
  console.warn(
    "⚠️ Missing valid VITE_CLERK_PUBLISHABLE_KEY in .env file\n" +
      "To set up Clerk:\n" +
      "1. Go to https://dashboard.clerk.com\n" +
      "2. Sign up or log in\n" +
      "3. Copy your Publishable Key\n" +
      "4. Paste it in frontend/.env as: VITE_CLERK_PUBLISHABLE_KEY=pk_test_...\n" +
      "For now, using test mode (auth disabled). The app will show sign-in screen without real auth.",
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes("xxxx") ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
);
