import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, Plus, Edit, Trash2, BarChart3, Loader2 } from "lucide-react";
import { get, post, type Event } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userEmail = localStorage.getItem("tce_user_email");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    activeEvents: 0,
    totalRegistrations: 0,
    pastEvents: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    event_name: "",
    date_time: "",
    venue: "",
    about_event: "",
    available_seats: "",
    category: "",
    department: "",
    registration_fee: "",
    gform_link: "",
    event_highlights: "",
    requirements: "",
    organizer_name: "",
    organizer_phone: ""
  });

  // Fetch organizer's events
  useEffect(() => {
    fetchEvents();
  }, []);

  // Calculate stats whenever events change
  useEffect(() => {
    calculateStats();
  }, [events]);

  const calculateStats = () => {
    const now = new Date();
    
    let activeCount = 0;
    let pastCount = 0;
    let totalRegs = 0;

    events.forEach(event => {
      const eventDate = new Date(event.date_time);
      if (eventDate > now) {
        activeCount++;
      } else {
        pastCount++;
      }
      // Add registration count if available
      totalRegs += event.registered_count || 0;
    });

    setStats({
      activeEvents: activeCount,
      totalRegistrations: totalRegs,
      pastEvents: pastCount
    });
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: Event[]; count: number }>("/events");
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch events:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load events"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare event data
      const eventData = {
        event_name: formData.event_name,
        date_time: new Date(formData.date_time).toISOString(),
        venue: formData.venue,
        about_event: formData.about_event,
        available_seats: parseInt(formData.available_seats) || 0,
        category: formData.category || null,
        department: formData.department || null,
        registration_fee: parseFloat(formData.registration_fee) || 0,
        gform_link: formData.gform_link || null,
        event_highlights: formData.event_highlights 
          ? formData.event_highlights.split('\n').filter(h => h.trim())
          : [],
        requirements: formData.requirements
          ? formData.requirements.split('\n').filter(r => r.trim())
          : [],
        organizers: formData.organizer_name && formData.organizer_phone
          ? [{
              organizer_name: formData.organizer_name,
              organizer_phone: formData.organizer_phone
            }]
          : []
      };

      console.log("📤 Submitting event data:", eventData);

      const response = await post<{ success: boolean; message: string; data: Event }>("/events", eventData);

      console.log("✅ Response received:", response);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Event created successfully"
        });

        // Reset form
        setFormData({
          event_name: "",
          date_time: "",
          venue: "",
          about_event: "",
          available_seats: "",
          category: "",
          department: "",
          registration_fee: "",
          gform_link: "",
          event_highlights: "",
          requirements: "",
          organizer_name: "",
          organizer_phone: ""
        });

        setShowCreateEvent(false);
        fetchEvents(); // Refresh events list
      }
    } catch (error: any) {
      console.error("❌ Failed to create event:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error message:", error.message);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to create event";
      const errorDetails = error.response?.data?.error;
      
      toast({
        variant: "destructive",
        title: "Error Creating Event",
        description: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-border p-4 lg:p-6 animate-fade-in shadow-md">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Event Organizer Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {userEmail}
            </p>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 hover:shadow-lg transition-shadow animate-scale-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeEvents}</p>
                  <p className="text-sm text-muted-foreground">Active Events</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalRegistrations}</p>
                  <p className="text-sm text-muted-foreground">Total Registrations</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pastEvents}</p>
                  <p className="text-sm text-muted-foreground">Past Events</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Create Event Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Events</h2>
            <Button
              onClick={() => setShowCreateEvent(!showCreateEvent)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Event
            </Button>
          </div>

          {/* Create Event Form */}
          {showCreateEvent && (
            <Card className="p-6 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_name">Event Title *</Label>
                    <Input
                      id="event_name"
                      name="event_name"
                      placeholder="Enter event title"
                      value={formData.event_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_time">Event Date & Time *</Label>
                    <Input
                      id="date_time"
                      name="date_time"
                      type="datetime-local"
                      value={formData.date_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    name="venue"
                    placeholder="Enter event venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about_event">Description *</Label>
                  <Textarea
                    id="about_event"
                    name="about_event"
                    placeholder="Enter event description"
                    rows={4}
                    value={formData.about_event}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="available_seats">Max Capacity *</Label>
                    <Input
                      id="available_seats"
                      name="available_seats"
                      type="number"
                      placeholder="Enter maximum number of participants"
                      value={formData.available_seats}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_fee">Registration Fee (₹)</Label>
                    <Input
                      id="registration_fee"
                      name="registration_fee"
                      type="number"
                      step="0.01"
                      placeholder="Enter fee (0 for free)"
                      value={formData.registration_fee}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      placeholder="e.g., Technical, Cultural"
                      value={formData.category}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="e.g., CSE, ECE"
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gform_link">Registration Form Link</Label>
                  <Input
                    id="gform_link"
                    name="gform_link"
                    type="url"
                    placeholder="Google Form or external registration link"
                    value={formData.gform_link}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_highlights">Event Highlights (one per line)</Label>
                  <Textarea
                    id="event_highlights"
                    name="event_highlights"
                    placeholder="- Industry expert speakers&#10;- Hands-on workshops&#10;- Certificates for all participants"
                    rows={3}
                    value={formData.event_highlights}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements (one per line)</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    placeholder="- Laptop required&#10;- Basic programming knowledge&#10;- Student ID card"
                    rows={3}
                    value={formData.requirements}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Event Organizer Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizer_name">Organizer Name</Label>
                      <Input
                        id="organizer_name"
                        name="organizer_name"
                        placeholder="Contact person name"
                        value={formData.organizer_name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizer_phone">Phone Number</Label>
                      <Input
                        id="organizer_phone"
                        name="organizer_phone"
                        type="tel"
                        placeholder="Contact number"
                        value={formData.organizer_phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Event"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateEvent(false)}
                    className="flex-1"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Events List */}
          {loading ? (
            <Card className="p-12 text-center">
              <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-muted-foreground">Loading events...</p>
            </Card>
          ) : events.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first event to get started
              </p>
              <Button onClick={() => setShowCreateEvent(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {events.map((event) => (
                <Card key={event.event_id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{event.event_name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date_time).toLocaleDateString()} at{" "}
                          {new Date(event.date_time).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.available_seats} seats
                        </div>
                        {event.category && (
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                            {event.category}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {event.about_event}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/events/${event.event_id}`)}
                      >
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
