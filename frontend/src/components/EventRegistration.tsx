import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserCheck, CheckCircle2 } from "lucide-react";
import { get, post } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface EventRegistrationProps {
  eventId: string;
  eventName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  quickRegister?: boolean;
}

interface ProfileData {
  full_name: string;
  reg_number: string;
  department: string;
  year: string;
  phone: string;
}

export function EventRegistration({
  eventId,
  eventName,
  open,
  onOpenChange,
  onSuccess,
  quickRegister = false,
}: EventRegistrationProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    reg_number: "",
    year: "",
    department: "",
    section: "",
    phone: "",
  });

  useEffect(() => {
    if (open) {
      fetchProfileData();
    }
  }, [open]);

  const fetchProfileData = async () => {
    try {
      setFetchingProfile(true);
      const response = await get<{ success: boolean; data: ProfileData }>("/profile");
      
      if (response.success && response.data) {
        const newFormData = {
          full_name: response.data.full_name || "",
          reg_number: response.data.reg_number || "",
          year: response.data.year || "",
          department: response.data.department || "",
          section: "",
          phone: response.data.phone || "",
        };
        setFormData(newFormData);

        // Auto-submit if quickRegister mode is enabled
        if (quickRegister) {
          setTimeout(() => {
            submitRegistration(newFormData);
          }, 500);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast({
        variant: "destructive",
        title: "Warning",
        description: "Could not autofill profile data. Please enter manually.",
      });
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitRegistration = async (dataToSubmit: typeof formData) => {
    // Validation
    if (!dataToSubmit.full_name || !dataToSubmit.reg_number || !dataToSubmit.year || 
        !dataToSubmit.department || !dataToSubmit.section || !dataToSubmit.phone) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(dataToSubmit.phone)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid 10-digit phone number",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await post<{ success: boolean; message: string }>(
        `/registrations/${eventId}`,
        dataToSubmit
      );

      if (response.success) {
        toast({
          title: "Success!",
          description: "Successfully registered for the event",
        });
        onOpenChange(false);
        onSuccess();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.response?.data?.message || "Failed to register for event",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitRegistration(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            {quickRegister ? "Quick Registration" : "Event Registration"}
          </DialogTitle>
          <DialogDescription>
            Register for <span className="font-semibold">{eventName}</span>
          </DialogDescription>
        </DialogHeader>

        {fetchingProfile ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              {quickRegister ? "Registering..." : "Loading your profile..."}
            </span>
          </div>
        ) : quickRegister ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Registration Successful!</h3>
            <p className="text-muted-foreground mb-6">
              You have been registered for this event using your profile information.
            </p>
            <div className="space-y-2 text-left w-full bg-muted/50 p-4 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{formData.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Register No:</span>
                <span>{formData.reg_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Department:</span>
                <span>{formData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Year:</span>
                <span>{formData.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{formData.phone}</span>
              </div>
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full mt-6">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Register Number */}
            <div className="space-y-2">
              <Label htmlFor="reg_number">
                Register Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg_number"
                value={formData.reg_number}
                onChange={(e) => handleChange("reg_number", e.target.value)}
                placeholder="e.g., 240393247348923"
                required
              />
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">
                Year <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.year}
                onValueChange={(value) => handleChange("year", value)}
              >
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select your year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">I Year</SelectItem>
                  <SelectItem value="2">II Year</SelectItem>
                  <SelectItem value="3">III Year</SelectItem>
                  <SelectItem value="4">IV Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleChange("department", value)}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="ECE">ECE</SelectItem>
                  <SelectItem value="EEE">EEE</SelectItem>
                  <SelectItem value="MECH">MECH</SelectItem>
                  <SelectItem value="CIVIL">CIVIL</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="AI&DS">AI&DS</SelectItem>
                  <SelectItem value="CSBS">CSBS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Section */}
            <div className="space-y-2">
              <Label htmlFor="section">
                Section <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.section}
                onValueChange={(value) => handleChange("section", value)}
              >
                <SelectTrigger id="section">
                  <SelectValue placeholder="Select your section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                  <SelectItem value="D">Section D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="e.g., 9876543210"
                maxLength={10}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter a 10-digit mobile number
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
