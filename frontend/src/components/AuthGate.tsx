import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

export default function AuthGate({ children }) {
  // Check if Clerk is properly initialized
  const isClerkActive =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY &&
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes("xxxx");

  // If Clerk is not active, skip auth gate and show app directly
  if (!isClerkActive) {
    return <>{children}</>;
  }

  return (
    <>
      <SignedOut>
        <div style={{ textAlign: "center", marginTop: "100px" }}>
          <h2>Sign in to use AI Marketing Team</h2>
          <SignInButton mode="modal">
            <button>Sign In / Sign Up</button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <UserButton />
        {children}
      </SignedIn>
    </>
  );
}
