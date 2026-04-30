import { GoogleButton } from "./GoogleButton";
import logo from "@/assets/logo.png";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight sm:text-xl">
          <img src={logo} alt="Ghostwrites logo" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
          Ghostwrites
        </a>
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#preview" className="transition-colors hover:text-foreground">Product</a>
        </div>
        <GoogleButton label="Sign in" />
      </nav>
    </header>
  );
}
