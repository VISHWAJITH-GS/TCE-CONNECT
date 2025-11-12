import { useState, useEffect } from "react";
import { Calendar, LogOut, Loader2, AlertCircle, Mail, Phone, BookOpen, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { get, logout } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  reg_number: string | null;
  department: string | null;
  year: number | null;
  phone_number: string | null;
  role: string;
}

interface Registration {
  registration_id: string;
  event_id: string;
  event_name: string;
  date_time: string;
  venue: string;
  registered_at: string;
}

interface Club {
  membership_id: string;
  club_id: string;
  club_name: string;
  club_icon: string;
  joined_at: string;
  role: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user profile, registrations, and clubs
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch profile
        const profileResponse = await get<{ success: boolean; data: UserProfile }>("/profile");
        setProfile(profileResponse.data);

        // Fetch registrations (handle errors gracefully)
        try {
          const regsResponse = await get<{ success: boolean; data: Registration[]; count: number }>("/registrations/mine");
          setRegistrations(regsResponse.data || []);
        } catch (regErr) {
          console.error("Failed to fetch registrations:", regErr);
          setRegistrations([]);
        }

        // Fetch clubs (handle errors gracefully - table might not exist yet)
        try {
          const clubsResponse = await get<{ success: boolean; data: Club[]; count: number }>("/clubs/mine");
          setClubs(clubsResponse.data || []);
        } catch (clubErr) {
          console.error("Failed to fetch clubs:", clubErr);
          setClubs([]);
        }

      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(err.response?.data?.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Get year suffix (I, II, III, IV, V)
  const getYearText = (year: number | null) => {
    if (!year) return "";
    const romans = ["", "I", "II", "III", "IV", "V"];
    return romans[year] || `${year}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto mt-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "Failed to load profile"}</AlertDescription>
            </Alert>
            <Button onClick={() => navigate("/")} className="mt-4">
              Go to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen bg-background page-transition">
      <Navbar />
      <div className="flex-1 pb-20 lg:pb-0">
        {/* Header with TCE gradient and animation */}
        <header className="bg-gradient-to-r from-primary via-primary-dark to-primary text-primary-foreground p-6 lg:p-8 animate-fade-in">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/80 mx-auto flex items-center justify-center text-4xl shadow-lg animate-scale-in">
              {profile.role === "event_manager" ? "�" : "�👨‍🎓"}
            </div>
            <div className="animate-slide-up">
              <h1 className="text-xl font-bold">{profile.full_name || "User"}</h1>
              <p className="text-sm opacity-90">
                {profile.department ? `B.E. ${profile.department}` : "Student"}
              </p>
              <p className="text-xs opacity-75 mt-1">
                {profile.year && `${getYearText(profile.year)} Year`}
                {profile.reg_number && ` | Roll No: ${profile.reg_number}`}
                {" | TCE Madurai"}
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 space-y-6">
          {/* User Details Card */}
          <section className="animate-slide-up">
            <h2 className="text-lg font-semibold mb-3 gradient-text">📋 Profile Details</h2>
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{profile.full_name || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>

                {profile.phone_number && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{profile.phone_number}</p>
                    </div>
                  </div>
                )}

                {profile.reg_number && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Roll Number</p>
                      <p className="font-medium">{profile.reg_number}</p>
                    </div>
                  </div>
                )}

                {profile.department && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{profile.department}</p>
                    </div>
                  </div>
                )}

                {profile.year && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-medium">{getYearText(profile.year)} Year</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </section>

          {/* My Registered Events */}
          <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-lg font-semibold mb-3 gradient-text">📅 My Registered Events</h2>
            {registrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {registrations.map((registration, index) => (
                  <Card key={registration.registration_id} className="p-4 hover:shadow-card-hover transition-all duration-200 animate-scale-in group" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{registration.event_name}</h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 text-accent" />
                          <span>
                            {new Date(registration.date_time).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full hover:bg-primary hover:text-primary-foreground transition-all"
                        onClick={() => navigate(`/events/${registration.event_id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>You haven't registered for any events yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/events")}
                >
                  Browse Events
                </Button>
              </Card>
            )}
          </section>

          {/* My Clubs */}
          <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-semibold mb-3 gradient-text">🎭 My Clubs</h2>
            {clubs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clubs.map((club, index) => (
                  <Card key={club.membership_id} className="p-4 hover:shadow-card-hover transition-all duration-200 cursor-pointer animate-scale-in hover:scale-105 group" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="text-3xl group-hover:scale-110 transition-transform">{club.club_icon}</div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors text-sm">{club.club_name}</h3>
                      <span className="text-xs text-muted-foreground capitalize">{club.role}</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                <div className="text-4xl mb-3">🎭</div>
                <p>You haven't joined any clubs yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/community")}
                >
                  Explore Clubs
                </Button>
              </Card>
            )}
          </section>

          {/* Logout */}
          <Button
            variant="destructive"
            className="w-full lg:max-w-xs transition-all duration-200 hover:scale-105 shadow-lg"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <BottomNav />
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
