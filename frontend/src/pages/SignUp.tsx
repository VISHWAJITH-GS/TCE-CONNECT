import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Phone, Hash, Building2, Calendar, AlertCircle, UserPlus, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { post, setAuthData, type LoginResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    reg_number: "",
    department: "",
    year: "",
    phone_number: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const departments = [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
    "Chemical Engineering",
    "Bio Technology",
    "Production Engineering",
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  };

  const validateForm = () => {
    // Email validation
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Required fields
    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return false;
    }

    if (!formData.reg_number.trim()) {
      setError("Registration number is required");
      return false;
    }

    if (!formData.department) {
      setError("Please select your department");
      return false;
    }

    if (!formData.year) {
      setError("Please select your year");
      return false;
    }

    if (!formData.phone_number.trim()) {
      setError("Phone number is required");
      return false;
    }

    // Phone number validation (basic)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone_number.replace(/\s/g, ""))) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call the backend API to register the user
      const response = await post<LoginResponse>("/auth/register", {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        reg_number: formData.reg_number,
        department: formData.department,
        year: parseInt(formData.year),
        phone_number: formData.phone_number,
        role: "student", // Always student for this form
      });

      // Validate response
      if (!response.success || !response.token || !response.user) {
        throw new Error("Invalid response from server");
      }

      // Store auth data in localStorage
      setAuthData(response.token, response.user);

      // Show success toast
      toast({
        title: "Account Created Successfully!",
        description: `Welcome to TCE Connect, ${response.user.full_name}!`,
      });

      // Redirect to home page
      navigate("/", { replace: true });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";

      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        {/* Back to Login */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

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
            Create Your Student Account
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Join TCE Connect to explore campus events and clubs
          </p>
        </div>

        {/* Sign Up Card */}
        <Card className="shadow-2xl border-primary/10 animate-slide-up opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Student Registration
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Fill in your details to create an account</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    className="pl-10 h-11 border-border focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email and Registration Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@student.tce.edu"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10 h-11 border-border focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg_number" className="text-sm font-medium">
                    Registration Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg_number"
                      type="text"
                      placeholder="e.g., 20BECSE001"
                      value={formData.reg_number}
                      onChange={(e) => handleChange("reg_number", e.target.value)}
                      className="pl-10 h-11 border-border focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Department and Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                      <SelectTrigger className="pl-10 h-11">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm font-medium">
                    Year <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Select value={formData.year} onValueChange={(value) => handleChange("year", value)}>
                      <SelectTrigger className="pl-10 h-11">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={formData.phone_number}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                    className="pl-10 h-11 border-border focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10 h-11 border-border focus:border-primary transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Create Account
                  </span>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 px-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          By creating an account, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
