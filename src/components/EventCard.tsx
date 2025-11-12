import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  id?: string;
  title: string;
  date: string;
  venue: string;
  department: string;
  type: "technical" | "cultural" | "sports";
  horizontal?: boolean;
}

export const EventCard = ({
  id = "1",
  title,
  date,
  venue,
  department,
  type,
  horizontal = false,
}: EventCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/events/${id}`);
  };

  const handleCardClick = () => {
    navigate(`/events/${id}`);
  };

  // Default to 'technical' if type is undefined/null
  const eventType = type || 'technical';

  const typeColors = {
    technical: "bg-primary/10 text-primary border-primary/30",
    cultural: "bg-purple-500/10 text-purple-700 border-purple-200",
    sports: "bg-green-500/10 text-green-700 border-green-200",
  };

  const typeGradients = {
    technical: "from-primary/20 to-primary/5",
    cultural: "from-purple-500/20 to-purple-600/5",
    sports: "from-green-500/20 to-green-600/5",
  };

  if (horizontal) {
    return (
      <Card 
        className="min-w-[280px] p-4 hover:shadow-card-hover transition-all duration-300 cursor-pointer group border-l-4 border-l-primary animate-fade-in"
        onClick={handleCardClick}
      >
        <div className="space-y-3">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
            typeColors[eventType]
          )}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
          </div>
          <h3 className="font-semibold text-base group-hover:text-primary transition-colors leading-tight">
            {title}
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{venue}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs font-medium text-primary">{department}</span>
            <Button 
              size="sm" 
              variant="outline"
              className="h-7 text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 group-hover:scale-110 btn-shine relative z-10"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:scale-[1.02] group animate-scale-in h-full flex flex-col"
      )}
      onClick={handleCardClick}
    >
      <div className={cn("h-2 bg-gradient-to-r", typeGradients[eventType])}></div>
      <div className="p-5 space-y-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base group-hover:text-primary transition-colors leading-tight line-clamp-2 min-h-[3rem]">
            {title}
          </h3>
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap shrink-0",
              typeColors[eventType]
            )}
          >
            {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground flex-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{venue}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
          <span className="text-xs font-medium text-primary line-clamp-1 flex-1 mr-2">{department}</span>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 hover:bg-primary hover:text-primary-foreground transition-all duration-300 group-hover:scale-110 btn-shine relative z-10 shrink-0"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};
