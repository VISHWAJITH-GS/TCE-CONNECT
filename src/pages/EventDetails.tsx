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
  ExternalLink
} from "lucide-react";
import { get, post, type Event } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface EventOrganizer {
  id: string;
  organizer_name: string;
  organizer_phone: string;
}

interface EventDetails extends Event {
  event_organizers?: EventOrganizer[];
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

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

    // If there's a Google Form link, open it
    if (event.gform_link) {
      window.open(event.gform_link, '_blank');
      return;
    }

    // Otherwise, register through the backend
    setRegistering(true);
    try {
      const response = await post<{ success: boolean; message: string }>("/registrations", {
        event_id: event.event_id
      });

      if (response.success) {
        toast({
          title: "Success!",
          description: "Successfully registered for the event"
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.response?.data?.message || "Failed to register for event"
      });
    } finally {
      setRegistering(false);
    }
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
                </div>
              </div>
              
              {!isPastEvent && (
                <Button 
                  onClick={handleRegister}
                  disabled={registering}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {registering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : event.gform_link ? (
                    <>
                      Register Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    "Register Now"
                  )}
                </Button>
              )}
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
                      <p className="text-muted-foreground">{event.available_seats} participants</p>
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
              {!isPastEvent && (
                <Card className="p-6 bg-primary/5">
                  <h2 className="text-lg font-semibold mb-4">Register Now</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Don't miss out on this exciting event. Register now to secure your spot!
                  </p>
                  <Button 
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full"
                  >
                    {registering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : event.gform_link ? (
                      <>
                        Register via Form
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Register Now"
                    )}
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
