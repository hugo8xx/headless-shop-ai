export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container flex flex-col gap-2 py-10 text-sm text-muted-foreground md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Headless Shop — AI-powered commerce on Odoo.</p>
        <p className="font-mono text-xs">Portfolio demo. Powered by Next.js + Odoo + Claude.</p>
      </div>
    </footer>
  );
}
