import { useState, useEffect } from "react";
import { Search, Calendar, SearchX, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { get, type Event } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const filters = ["All", "Technical", "Cultural", "Sports"];

const Events = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Build query params
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedFilter !== "All") params.append("category", selectedFilter);
        
        const queryString = params.toString();
        const endpoint = `/events${queryString ? `?${queryString}` : ""}`;
        
        const response = await get<{ success: boolean; data: Event[] }>(endpoint);
        setEvents(response.data || []);
      } catch (err: any) {
        console.error("Failed to fetch events:", err);
        setError(err.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedFilter]);

  return (
    <div className="flex flex-col min-h-screen bg-background page-transition">
      <Navbar />
      <div className="flex-1 pb-20 lg:pb-0">
        {/* Header with consistent theme */}
        <header className="bg-white border-b border-border p-4 lg:p-6 sticky top-0 z-10 animate-fade-in shadow-md">
          <div className="max-w-5xl mx-auto space-y-3">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-primary">TCE</span> Events
          </h1>

          {/* Search Bar with animation */}
          <div className="relative animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events or clubs"
              className="pl-10 bg-background border-border focus:border-primary transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Chips with hover effects */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            {filters.map((filter) => (
              <Button
                key={filter}
                size="sm"
                variant="outline"
                className={cn(
                  "rounded-full whitespace-nowrap transition-all duration-300 hover:shadow-lg",
                  selectedFilter === filter
                    ? "border-2 !border-primary text-primary font-bold !bg-white hover:!bg-white hover:!text-primary hover:scale-105"
                    : "bg-white border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:scale-105"
                )}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
          </div>
        </header>

        {/* Events List with staggered animations */}
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event, index) => (
                <div 
                  key={event.event_id} 
                  className="animate-slide-up opacity-0"
                  style={{ 
                    animationDelay: `${index * 0.08}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <EventCard
                    id={event.event_id}
                    title={event.event_name}
                    date={new Date(event.date_time).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    venue={event.venue}
                    department={event.department || 'TCE'}
                    type={(event.category as 'technical' | 'cultural' | 'sports') || 'technical'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground animate-fade-in">
              <SearchX className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg">No events found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
      <Footer />
    </div>
  );
};

export default Events;
