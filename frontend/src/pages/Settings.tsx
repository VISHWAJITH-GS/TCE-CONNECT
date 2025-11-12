import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Lock, User, Mail } from "lucide-react";

export default function Settings() {
  const userEmail = localStorage.getItem("tce_user_email");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <header className="bg-white border-b border-border p-4 lg:p-6 animate-fade-in shadow-md">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-primary" />
              Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </header>

        {/* Settings Content */}
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-6">
          {/* Account Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Account Settings
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                />
              </div>
              <Button className="mt-4">Save Changes</Button>
            </div>
          </Card>

          {/* Password Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Change Password
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                />
              </div>
              <Button className="mt-4">Update Password</Button>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about events
                  </p>
                </div>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Event Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get reminders before registered events
                  </p>
                </div>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Club Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates from clubs you joined
                  </p>
                </div>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </div>
            </div>
          </Card>
        </div>

        <BottomNav />
      </div>
      <Footer />
    </div>
  );
}
