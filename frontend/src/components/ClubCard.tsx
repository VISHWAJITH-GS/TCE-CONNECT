import { Bot, Code2, Glasses, Smartphone, Music, User, Palette, Book, BookOpen, Film, Plane, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ClubCardProps {
  name: string;
  description: string;
  icon: string;
  portalUrl: string;
}

const iconMap: Record<string, any> = {
  Bot,
  Code2,
  Glasses,
  Smartphone,
  Music,
  User,
  Palette,
  Book,
  BookOpen,
  Film,
  Plane,
  Radio,
};

export const ClubCard = ({ name, description, icon, portalUrl }: ClubCardProps) => {
  const IconComponent = iconMap[icon] || User;

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer hover:scale-[1.02] group animate-scale-in">
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <IconComponent className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-border">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-9 px-4 hover:bg-primary hover:text-primary-foreground transition-all duration-300 group-hover:scale-110 btn-shine relative z-10"
            onClick={() => window.open(portalUrl, '_blank')}
          >
            Visit Portal
          </Button>
        </div>
      </div>
    </Card>
  );
};
