import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, FileText } from "lucide-react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "MR Validations", icon: ShieldCheck },
    { path: "/deployment-report", label: "Deployment Report", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 flex items-center h-14 gap-8">
          <span className="text-primary font-bold text-lg tracking-tight">FASS Tools</span>
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
