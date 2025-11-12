import { useState } from "react";
import { ClubCard } from "@/components/ClubCard";
import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Bot, Code2, Glasses, Smartphone, Music, User, Palette, Book, BookOpen, Film, Plane, Radio, Sparkles, Drama, Handshake, Users } from "lucide-react";

const allClubs = [
  {
    name: "AI Consortium",
    description: "Student-driven club dedicated to exploring AI and Machine Learning",
    members: 450,
    icon: "Bot",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/35",
  },
  {
    name: "Algo Geeks Club",
    description: "Department of CSE - Competitive programming and algorithms",
    members: 389,
    icon: "Code2",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/12",
  },
  {
    name: "AR/VR Club",
    description: "Exploring Augmented and Virtual Reality technologies at TCE",
    members: 325,
    icon: "Glasses",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/4",
  },
  {
    name: "App Development Club",
    description: "Department of IT - Building innovative mobile applications",
    members: 412,
    icon: "Smartphone",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/3",
  },
  {
    name: "Andhadhi - Music Club",
    description: "Classical melodies, rock anthems, and soulful compositions",
    members: 298,
    icon: "Music",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/82",
  },
  {
    name: "Anything for Dance (AFD)",
    description: "From classical to contemporary dance styles at TCE",
    members: 267,
    icon: "User",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/61",
  },
  {
    name: "All About Art",
    description: "Sketching workshops, exhibitions, and collaborative art projects",
    members: 178,
    icon: "Palette",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/78",
  },
  {
    name: "Book Readers Club",
    description: "Fostering a vibrant community of literature enthusiasts",
    members: 156,
    icon: "Book",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/86",
  },
  {
    name: "Anglophile Lounge",
    description: "Department of English - Literature and language excellence",
    members: 234,
    icon: "BookOpen",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/75",
  },
  {
    name: "Cinemates",
    description: "Film appreciation and cinematography club at TCE",
    members: 189,
    icon: "Film",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/80",
  },
  {
    name: "Ascenders - Aerial Vehicle Club",
    description: "Department of EEE - UAVs, drones, and aerial innovations",
    members: 201,
    icon: "Plane",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/14",
  },
  {
    name: "IoT Club",
    description: "Internet of Things and embedded systems innovation",
    members: 345,
    icon: "Radio",
    portalUrl: "https://clubs.tceapps.in/tce/student/clubs/1",
  },
];

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClubs = allClubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background page-transition">
      <Navbar />
      <div className="flex-1 pb-20 lg:pb-0">
        {/* Header with consistent theme */}
        <header className="bg-white border-b border-border p-4 lg:p-6 animate-fade-in shadow-md">
          <div className="max-w-5xl mx-auto space-y-3">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-primary">TCE</span> Clubs
          </h1>
          <p className="text-sm text-muted-foreground animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>A Vibrant Hub for Innovation, Culture, and Community</p>
          </div>
        </header>

        {/* Info Banner - clubs.tceapps.in style */}
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-lg p-6 mb-6 border border-primary/10 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <Code2 className="h-10 w-10 mx-auto text-primary" />
                <h3 className="font-semibold text-primary">Tech & Innovation</h3>
                <p className="text-sm text-muted-foreground">Innovate, code, and build with cutting-edge tech</p>
              </div>
              <div className="space-y-2">
                <Drama className="h-10 w-10 mx-auto text-primary" />
                <h3 className="font-semibold text-primary">Arts & Culture</h3>
                <p className="text-sm text-muted-foreground">Express your passion on every stage and field</p>
              </div>
              <div className="space-y-2">
                <Handshake className="h-10 w-10 mx-auto text-primary" />
                <h3 className="font-semibold text-primary">Community Impact</h3>
                <p className="text-sm text-muted-foreground">Make a difference through social causes</p>
              </div>
            </div>
          </div>

        {/* Clubs List with staggered animations */}
          {filteredClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredClubs.map((club, index) => (
                <div 
                  key={index}
                  className="animate-slide-up opacity-0"
                  style={{ 
                    animationDelay: `${index * 0.08}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <ClubCard {...club} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground animate-fade-in">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg">You haven't joined any clubs yet</p>
              <p className="text-sm mt-2">Explore clubs to get started!</p>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
      <Footer />
    </div>
  );
};

export default Community;
