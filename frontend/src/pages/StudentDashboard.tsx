import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Users, Award, TrendingUp } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("tce_user_email");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <header className="bg-white border-b border-border p-4 lg:p-6 animate-fade-in shadow-md">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Student Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {userEmail}
            </p>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Registered Events</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Clubs Joined</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Events Attended</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => navigate("/events")}
                className="h-auto py-4 justify-start"
                variant="outline"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Browse Events
              </Button>
              <Button
                onClick={() => navigate("/community")}
                className="h-auto py-4 justify-start"
                variant="outline"
              >
                <Users className="h-5 w-5 mr-2" />
                Explore Clubs
              </Button>
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">My Upcoming Events</h2>
            <p className="text-muted-foreground">
              You haven't registered for any upcoming events yet.
            </p>
            <Button
              onClick={() => navigate("/events")}
              className="mt-4"
              variant="default"
            >
              Explore Events
            </Button>
          </Card>
        </div>

        <BottomNav />
      </div>
      <Footer />
    </div>
  );
}
