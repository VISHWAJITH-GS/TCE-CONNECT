import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee,
  Clock,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  FileText,
  Zap
} from "lucide-react";
import { get, post, type Event } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { EventRegistration } from "@/components/EventRegistration";

interface EventOrganizer {
  id: string;
  organizer_name: string;
  organizer_phone: string;
}

interface EventDetails extends Event {
  event_organizers?: EventOrganizer[];
  registered_count?: number;
  is_registered?: boolean;
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [quickRegister, setQuickRegister] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchUserRole();
    }
  }, [id]);

  const fetchUserRole = async () => {
    try {
      const response = await get<{ success: boolean; data: { role: string } }>("/profile");
      if (response.success) {
        setUserRole(response.data.role);
      }
    } catch (error) {
      console.error("Failed to fetch user role:", error);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: EventDetails }>(`/events/${id}`);
      if (response.success) {
        setEvent(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load event details"
      });
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event) return;

    // Check if event is full
    const registeredCount = event.registered_count || 0;
    const totalSeats = event.available_seats;
    
    if (registeredCount >= totalSeats) {
      toast({
        variant: "destructive",
        title: "Event Full",
        description: "Sorry, this event has reached maximum capacity",
      });
      return;
    }

    // Check if already registered
    if (event.is_registered) {
      toast({
        title: "Already Registered",
        description: "You are already registered for this event",
      });
      return;
    }

    // Open registration modal
    setShowRegistrationModal(true);
  };

  const handleQuickRegister = async () => {
    if (!event) return;

    // Check if event is full
    const registeredCount = event.registered_count || 0;
    const totalSeats = event.available_seats;
    
    if (registeredCount >= totalSeats) {
      toast({
        variant: "destructive",
        title: "Event Full",
        description: "Sorry, this event has reached maximum capacity",
      });
      return;
    }

    // Check if already registered
    if (event.is_registered) {
      toast({
        title: "Already Registered",
        description: "You are already registered for this event",
      });
      return;
    }

    // Open registration modal in quick register mode
    setQuickRegister(true);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSuccess = () => {
    // Refresh event details to get updated registration status
    fetchEventDetails();
  };

  const handleViewRegistrations = () => {
    navigate(`/event/${id}/registrations`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading event details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">Event not found</p>
            <Button onClick={() => navigate("/events")} className="mt-4">
              Back to Events
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const eventDate = new Date(event.date_time);
  const isPastEvent = eventDate < new Date();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
          <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/events")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{event.event_name}</h1>
                <div className="flex flex-wrap gap-2">
                  {event.category && (
                    <Badge variant="secondary">{event.category}</Badge>
                  )}
                  {event.department && (
                    <Badge variant="outline">{event.department}</Badge>
                  )}
                  {isPastEvent && (
                    <Badge variant="destructive">Past Event</Badge>
                  )}
                  {event.is_registered && (
                    <Badge className="bg-green-600">Registered ✓</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {userRole === "event_manager" && (
                  <Button 
                    onClick={handleViewRegistrations}
                    variant="outline"
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Registrations
                  </Button>
                )}
                
                {!isPastEvent && userRole !== "event_manager" && (
                  <Button 
                    onClick={handleQuickRegister}
                    disabled={event.is_registered || (event.registered_count || 0) >= event.available_seats}
                    size="lg"
                    className="w-full md:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {event.is_registered ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Already Registered
                      </>
                    ) : (event.registered_count || 0) >= event.available_seats ? (
                      "Event Full"
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Quick Register
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Info */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Event Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-muted-foreground">
                        {eventDate.toLocaleDateString('en-IN', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-muted-foreground">
                        {eventDate.toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Venue</p>
                      <p className="text-muted-foreground">{event.venue}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-muted-foreground">
                        {event.registered_count || 0} / {event.available_seats} registered
                      </p>
                      {(event.registered_count || 0) >= event.available_seats ? (
                        <Badge variant="destructive" className="mt-1">Event Full</Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-1">
                          {event.available_seats - (event.registered_count || 0)} spots left
                        </Badge>
                      )}
                    </div>
                  </div>

                  {event.registration_fee !== undefined && event.registration_fee > 0 && (
                    <div className="flex items-start gap-3">
                      <IndianRupee className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Registration Fee</p>
                        <p className="text-muted-foreground">₹{event.registration_fee}</p>
                      </div>
                    </div>
                  )}

                  {event.registration_fee === 0 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Free Event</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* About Event */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {event.about_event}
                </p>
              </Card>

              {/* Event Highlights */}
              {event.event_highlights && event.event_highlights.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Event Highlights</h2>
                  <ul className="space-y-2">
                    {event.event_highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Requirements */}
              {event.requirements && event.requirements.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {event.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              {event.event_organizers && event.event_organizers.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Event Organizers</h2>
                  <div className="space-y-4">
                    {event.event_organizers.map((organizer) => (
                      <div key={organizer.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{organizer.organizer_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`tel:${organizer.organizer_phone}`}
                            className="text-primary hover:underline"
                          >
                            {organizer.organizer_phone}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              {!isPastEvent && userRole !== "event_manager" && (
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <h2 className="text-lg font-semibold mb-4">Registration Options</h2>
                  
                  {(event.registered_count || 0) >= event.available_seats ? (
                    <Button disabled className="w-full mb-3" size="lg">
                      Event Full
                    </Button>
                  ) : event.is_registered ? (
                    <Button disabled className="w-full mb-3" size="lg">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Already Registered
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Quick Registration</p>
                          <Button 
                            onClick={handleQuickRegister}
                            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium"
                            size="lg"
                          >
                            <Zap className="mr-2 h-4 w-4" />
                            Auto-Fill & Register
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Uses your profile information to register instantly
                          </p>
                        </div>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-primary/20"></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-gradient-to-br from-primary/10 to-accent/10 text-muted-foreground">or</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Manual Registration</p>
                          <Button 
                            onClick={handleRegister}
                            variant="outline"
                            className="w-full border-2 border-primary/40 hover:border-primary hover:bg-primary/5 font-medium"
                            size="lg"
                          >
                            Fill Details & Register
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Review and edit your information before registering
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Registration Modal */}
      {event && (
        <EventRegistration
          eventId={event.event_id}
          eventName={event.event_name}
          open={showRegistrationModal}
          onOpenChange={(open) => {
            setShowRegistrationModal(open);
            if (!open) setQuickRegister(false);
          }}
          onSuccess={handleRegistrationSuccess}
          quickRegister={quickRegister}
        />
      )}
    </div>
  );
}
