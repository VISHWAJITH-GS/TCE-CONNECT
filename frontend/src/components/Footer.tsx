import { Facebook, Instagram, Linkedin, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-primary via-primary-dark to-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* About Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <img 
                src="/tce-logo.png" 
                alt="TCE Logo" 
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <h3 className="text-base font-bold flex items-center gap-2">
                <span className="text-accent">TCE</span> Connect
              </h3>
            </div>
            <p className="text-xs opacity-90">
              Thiagarajar College of Engineering - A premier institution fostering innovation, culture, and community since 1957.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-accent/20 rounded-full text-accent font-semibold">A++ NAAC</span>
              <span className="px-2 py-1 bg-accent/20 rounded-full text-accent font-semibold">65+ Years</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-base font-bold">Quick Links</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="/" className="opacity-90 hover:opacity-100 hover:text-accent transition-all">
                  Home
                </a>
              </li>
              <li>
                <a href="/events" className="opacity-90 hover:opacity-100 hover:text-accent transition-all">
                  Events
                </a>
              </li>
              <li>
                <a href="/community" className="opacity-90 hover:opacity-100 hover:text-accent transition-all">
                  Clubs & Community
                </a>
              </li>
              <li>
                <a href="https://tce.edu" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 hover:text-accent transition-all">
                  TCE Official Website
                </a>
              </li>
              <li>
                <a href="https://clubs.tceapps.in/tce/student" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 hover:text-accent transition-all">
                  TCE Clubs Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-base font-bold">Contact Us</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2 opacity-90">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                <span>Thiagarajar College of Engineering<br />Madurai - 625 015<br />Tamil Nadu, India</span>
              </li>
              <li className="flex items-center gap-2 opacity-90 hover:text-accent transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0 text-accent" />
                <a href="tel:+914522482240">+91 452 2482240</a>
              </li>
              <li className="flex items-center gap-2 opacity-90 hover:text-accent transition-colors">
                <Mail className="h-4 w-4 flex-shrink-0 text-accent" />
                <a href="mailto:principal@tce.edu">principal@tce.edu</a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-3">
            <h3 className="text-base font-bold">Connect With Us</h3>
            <p className="text-xs opacity-90">Follow us on social media for updates and events</p>
            <div className="flex gap-2">
              <a
                href="https://www.facebook.com/TheOfficialTCEPage"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/tce_madurai/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/tcemadurai"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/tceofficialpage"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/ThiagarajarCollegeofEngineeringTCE"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-primary-foreground/20 text-center text-xs opacity-90">
          <p>© 2025 Thiagarajar College of Engineering, Madurai. All Rights Reserved.</p>
          <p className="mt-1 text-xs opacity-75">
            Developed by CSE Department | TCE Apps Initiative
          </p>
        </div>
      </div>
    </footer>
  );
};
