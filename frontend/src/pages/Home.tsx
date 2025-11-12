import { EventCard } from "@/components/EventCard";
import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const todaysEvents = [
  {
    id: "1",
    title: "AI Sprint Workshop",
    date: "Today, 10:00 AM",
    venue: "CSE Department Lab",
    department: "AI Consortium",
    type: "technical" as const,
  },
  {
    id: "14",
    title: "Music Jam Session",
    date: "Today, 3:00 PM",
    venue: "Student Activity Center",
    department: "Andhadhi - Music Club",
    type: "cultural" as const,
  },
  {
    id: "19",
    title: "Inter-Department Football Match",
    date: "Today, 4:30 PM",
    venue: "TCE Sports Ground",
    department: "Sports Committee",
    type: "sports" as const,
  },
];

const upcomingEvents = [
  {
    id: "2",
    title: "Field Visit - AR/VR",
    date: "Jun 13-14, 2025",
    venue: "Industry Partner Location",
    department: "AR/VR Club",
    type: "technical" as const,
  },
  {
    id: "3",
    title: "Connexions - IoT Workshop",
    date: "May 9, 2025",
    venue: "IoT Lab Complex",
    department: "IoT Club",
    type: "technical" as const,
  },
  {
    id: "12",
    title: "Cultural Night 2025",
    date: "Apr 10, 2025",
    venue: "TCE Main Auditorium",
    department: "Cultural Society",
    type: "cultural" as const,
  },
];

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-background page-transition">
      <Navbar />
      <div className="flex-1 pb-20 lg:pb-0">
        {/* Hero Section */}
        <section className="relative bg-white overflow-hidden border-b border-border">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative max-w-5xl mx-auto px-4 lg:px-6 py-16 lg:py-24">
            <div className="text-center space-y-6">
              {/* Main Heading */}
              <h1 className="text-3xl lg:text-5xl font-bold text-primary leading-tight animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                Discover Campus Events
              </h1>
              
              {/* Subtitle with animated words */}
              <div className="text-lg lg:text-2xl font-semibold text-accent flex items-center justify-center gap-3 flex-wrap">
                <span className="animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>Connect.</span>
                <span className="animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>Learn.</span>
                <span className="animate-slide-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>Grow.</span>
              </div>
              
              {/* Description */}
              <p className="text-base text-muted-foreground max-w-2xl mx-auto animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                Join the vibrant TCE community. Stay updated with the latest events, connect with clubs, and make your college experience unforgettable.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110 transition-all duration-300 btn-shine text-base px-8 group shadow-lg"
                  onClick={() => navigate('/events')}
                >
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 text-base px-8 shadow-lg"
                  onClick={() => navigate('/community')}
                >
                  Browse Clubs
                </Button>
              </div>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all hover:scale-105 animate-scale-in opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                  <Calendar className="h-10 w-10 text-primary" />
                  <h3 className="font-semibold text-primary text-base">Live Events</h3>
                  <p className="text-sm text-muted-foreground text-center">Real-time updates on campus events</p>
                </div>
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-gradient-to-br from-accent/5 to-accent/10 backdrop-blur-sm border border-accent/20 hover:border-accent/40 hover:shadow-lg transition-all hover:scale-105 animate-scale-in opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
                  <Users className="h-10 w-10 text-accent" />
                  <h3 className="font-semibold text-primary text-base">Active Clubs</h3>
                  <p className="text-sm text-muted-foreground text-center">Join 12+ thriving student communities</p>
                </div>
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-gradient-to-br from-primary/5 to-accent/10 backdrop-blur-sm border border-primary/20 hover:border-accent/40 hover:shadow-lg transition-all hover:scale-105 animate-scale-in opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                  <Trophy className="h-10 w-10 text-accent" />
                  <h3 className="font-semibold text-primary text-base">Competitions</h3>
                  <p className="text-sm text-muted-foreground text-center">Participate and showcase your talents</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8 space-y-8">
        {/* Today's Events with enhanced styling */}
        <section className="animate-fade-in">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full animate-pulse"></span>
            <span className="gradient-text">Today's Events</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysEvents.map((event, index) => (
              <div 
                key={index}
                className="animate-slide-up opacity-0"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <EventCard {...event} />
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events with staggered animation */}
        <section className="animate-slide-up">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event, index) => (
              <div 
                key={index}
                className="animate-slide-up opacity-0"
                style={{ 
                  animationDelay: `${(index + 3) * 0.08}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <EventCard {...event} />
              </div>
            ))}
          </div>
        </section>
        </div>

        <BottomNav />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
