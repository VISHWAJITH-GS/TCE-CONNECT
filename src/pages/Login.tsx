import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, User, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { post, setAuthData, type LoginResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "event_manager">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // ✅ Call the real backend API
      const response = await post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      // ✅ Validate response
      if (!response.success || !response.token || !response.user) {
        throw new Error("Invalid response from server");
      }

      // ✅ Check if the logged-in role matches the selected role
      if (response.user.role !== role) {
        setError(
          `This account is registered as ${
            response.user.role === "student" ? "Student" : "Event Organizer"
          }. Please select the correct role.`
        );
        setIsLoading(false);
        return;
      }

      // ✅ Store auth data in localStorage
      setAuthData(response.token, response.user);

      // ✅ Show success toast
      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.full_name || response.user.email}!`,
      });

      // ✅ IMPORTANT: Redirect based on role
      if (response.user.role === "student") {
        // Student → Home page
        navigate("/", { replace: true });
      } else if (response.user.role === "event_manager") {
        // Event Manager → Organizer Dashboard
        navigate("/organizer-dashboard", { replace: true });
      } else {
        // Fallback
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Login failed. Please check your credentials.";
      
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <a href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:bg-primary/30 transition-all"></div>
              <img
                src="/tce-logo.png"
                alt="TCE Logo"
                className="h-12 w-12 sm:h-16 sm:w-16 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </a>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2 px-2">
            Welcome to <span className="text-primary">TCE</span> Connect
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Sign in to explore campus events and clubs
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-primary/10 animate-slide-up opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Sign In
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Login as</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      role === "student"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("event_manager")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      role === "event_manager"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Event Organizer</span>
                  </button>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@student.tce.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-border focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-border focus:border-primary transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 font-semibold text-base btn-shine"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </span>
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 px-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          By signing in, you agree to our {" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and {" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
