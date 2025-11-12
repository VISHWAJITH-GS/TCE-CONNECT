import { Home, Calendar, MessageCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: MessageCircle, label: "Clubs", path: "/community" },
];

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 lg:hidden glass-effect animate-slide-up">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 text-muted-foreground hover:text-primary group"
              activeClassName="text-primary scale-110"
            >
              <item.icon className="h-5 w-5 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-xs font-medium group-hover:font-semibold transition-all">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
