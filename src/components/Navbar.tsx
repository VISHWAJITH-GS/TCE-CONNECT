import { Home, Calendar, MessageCircle, Menu, X, User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get, isAuthenticated, logout as apiLogout, getUserRole, type Profile } from "@/lib/api";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: MessageCircle, label: "Clubs", path: "/community" },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user profile when authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("tce_token");
      const authStatus = !!token;
      setAuthenticated(authStatus);
      
      if (authStatus) {
        try {
          const response = await get<{ success: boolean; data: Profile }>("/profile");
          setUserProfile(response.data);
        } catch (error: any) {
          // Only log if it's not a 404 (missing profile is expected for some users)
          if (error?.response?.status !== 404) {
            console.error("Failed to fetch profile:", error);
          }
          // If profile fetch fails, don't auto-logout (token might still be valid)
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [location.pathname]); // Re-check on route change

  const handleLogout = () => {
    // ✅ Clear all localStorage data
    localStorage.removeItem("tce_token");
    localStorage.removeItem("tce_role");
    localStorage.removeItem("tce_user_id");
    localStorage.removeItem("tce_user");
    
    // ✅ Update state
    setAuthenticated(false);
    setUserProfile(null);
    setMobileMenuOpen(false);
    
    // ✅ Redirect to login
    navigate("/login", { replace: true });
  };

  const handleDashboard = () => {
    setMobileMenuOpen(false);
    const role = getUserRole();
    if (role === "student") {
      navigate("/student-dashboard");
    } else if (role === "event_manager") {
      navigate("/organizer-dashboard");
    }
  };

  return (
    <nav className="bg-white text-foreground shadow-lg sticky top-0 z-50 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Enhanced */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-md group-hover:bg-primary/20 transition-all"></div>
              <img 
                src="/tce-logo.png" 
                alt="TCE Logo" 
                className="h-10 w-10 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="text-lg font-bold flex items-center gap-2">
              <span className="text-primary group-hover:scale-110 transition-transform duration-300">TCE</span>
              <span className="text-foreground transition-all duration-300">Connect</span>
            </div>
          </a>

          {/* Desktop Navigation - Improved */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className="px-4 py-1.5 rounded-lg text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium border border-transparent text-sm"
                activeClassName="text-primary font-bold border-primary bg-transparent"
              >
                <span>{item.label}</span>
              </NavLink>
            ))}
            
            {authenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="ml-2 px-4 py-1.5 rounded-lg border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-300 font-semibold text-sm"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {loading ? "Loading..." : userProfile?.full_name || "Profile"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userProfile?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {userProfile?.role === "event_manager" ? "Event Organizer" : "Student"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDashboard}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <a
                href="/login"
                className="ml-2 px-5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 font-semibold border border-primary text-sm btn-shine"
              >
                Login
              </a>
            )}
          </div>

          {/* Mobile Menu Button - Improved */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground hover:bg-primary/10 transition-all duration-300 hover:scale-110 rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 rotate-90 transition-transform duration-300" />
            ) : (
              <Menu className="h-6 w-6 transition-transform duration-300" />
            )}
          </Button>
        </div>

        {/* Mobile Menu - Improved */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-slide-up border-t border-border bg-white">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className="flex items-center justify-center px-4 py-2 rounded-lg text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all duration-300 mx-2 font-medium border border-transparent text-sm"
                activeClassName="text-primary font-bold border-primary bg-transparent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{item.label}</span>
              </NavLink>
              ))}
            
            {authenticated ? (
              <>
                <div className="px-4 py-2 mx-2 text-sm border-t border-border mt-2">
                  <p className="font-medium text-foreground">{userProfile?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {userProfile?.role === "event_manager" ? "Event Organizer" : "Student"}
                  </p>
                </div>
                <button
                  onClick={handleDashboard}
                  className="flex items-center justify-center w-full px-4 py-2 rounded-lg text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all duration-300 mx-2 font-medium text-sm"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center justify-center w-full px-4 py-2 rounded-lg text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all duration-300 mx-2 font-medium text-sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/settings");
                  }}
                  className="flex items-center justify-center w-full px-4 py-2 rounded-lg text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all duration-300 mx-2 font-medium text-sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-300 mx-2 font-semibold text-sm mt-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 mx-2 font-semibold text-sm btn-shine"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
