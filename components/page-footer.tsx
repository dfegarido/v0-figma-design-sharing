"use client";

export function PageFooter() {
  return (
    <footer className="flex items-center justify-between px-6 py-4 text-xs text-muted-foreground">
      <button className="hover:text-foreground transition-colors">
        Terms & Conditions
      </button>
      <button className="hover:text-foreground transition-colors">
        Privacy Policy
      </button>
    </footer>
  );
}
