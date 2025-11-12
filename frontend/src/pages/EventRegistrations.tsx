import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Search,
  Users,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { get } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Registration {
  registration_id: string;
  full_name: string;
  email: string;
  reg_number: string;
  department: string;
  year: string;
  phone: string;
  section?: string;
  registered_at: string;
}

interface RegistrationsResponse {
  success: boolean;
  event_id: string;
  event_name: string;
  registrations: Registration[];
  total_registrations: number;
}

export default function EventRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (id) {
      fetchRegistrations();
    }
  }, [id]);

  useEffect(() => {
    filterRegistrations();
  }, [searchQuery, registrations]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await get<RegistrationsResponse>(`/registrations/event/${id}`);
      
      if (response.success) {
        setEventName(response.event_name);
        setRegistrations(response.registrations || []);
        setFilteredRegistrations(response.registrations || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch registrations:", error);
      
      // More detailed error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to load registrations";
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      
      // Don't navigate away, show empty state instead
      setRegistrations([]);
      setFilteredRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    if (!searchQuery.trim()) {
      setFilteredRegistrations(registrations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = registrations.filter(
      (reg) =>
        reg.full_name.toLowerCase().includes(query) ||
        reg.email.toLowerCase().includes(query) ||
        reg.reg_number.toLowerCase().includes(query) ||
        reg.department.toLowerCase().includes(query) ||
        reg.phone.includes(query)
    );
    setFilteredRegistrations(filtered);
  };

  const exportToCSV = () => {
    if (registrations.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No registrations to export",
      });
      return;
    }

    const headers = [
      "S.No",
      "Name",
      "Register Number",
      "Department",
      "Year",
      "Section",
      "Phone",
      "Email",
      "Registered At",
    ];

    const rows = filteredRegistrations.map((reg, index) => [
      index + 1,
      reg.full_name,
      reg.reg_number,
      reg.department,
      getYearText(reg.year),
      reg.section || "N/A",
      reg.phone,
      reg.email,
      new Date(reg.registered_at).toLocaleString("en-IN"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${eventName.replace(/\s+/g, "_")}_registrations.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Registrations exported successfully",
    });
  };

  const getYearText = (year: string): string => {
    const yearMap: Record<string, string> = {
      "1": "I Year",
      "2": "II Year",
      "3": "III Year",
      "4": "IV Year",
    };
    return yearMap[year] || year;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading registrations...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <div className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-primary-dark to-primary text-primary-foreground border-b shadow-md">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <Button
              variant="ghost"
              onClick={() => navigate(`/events/${id}`)}
              className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Event
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8" />
                  <h1 className="text-3xl font-bold">Event Registrations</h1>
                </div>
                <p className="text-primary-foreground/90 text-lg">{eventName}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-primary-foreground/20">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{registrations.length}</div>
                    <div className="text-sm text-primary-foreground/80">
                      Total Registration{registrations.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <Card className="shadow-lg">
            <CardHeader className="space-y-4 pb-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                    Registered Participants
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Complete list of all participants registered for this event
                  </CardDescription>
                </div>

                <Button 
                  onClick={exportToCSV} 
                  variant="default"
                  className="shrink-0"
                  disabled={filteredRegistrations.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, register number, department, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {/* Results Summary */}
              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Showing {filteredRegistrations.length} of {registrations.length} registration
                  {registrations.length !== 1 ? 's' : ''}
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "No Results Found" : "No Registrations Yet"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Registrations will appear here once students sign up for this event"}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-16 text-center font-semibold">S.No</TableHead>
                          <TableHead className="min-w-[180px] font-semibold">Name</TableHead>
                          <TableHead className="min-w-[150px] font-semibold">Register Number</TableHead>
                          <TableHead className="min-w-[100px] font-semibold">Department</TableHead>
                          <TableHead className="min-w-[80px] font-semibold">Year</TableHead>
                          <TableHead className="min-w-[80px] text-center font-semibold">Section</TableHead>
                          <TableHead className="min-w-[120px] font-semibold">Phone</TableHead>
                          <TableHead className="min-w-[200px] font-semibold">Email</TableHead>
                          <TableHead className="min-w-[150px] font-semibold">Registered At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRegistrations.map((registration, index) => (
                          <TableRow key={registration.registration_id} className="hover:bg-muted/30">
                            <TableCell className="text-center font-medium text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {registration.full_name}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {registration.reg_number}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-medium">
                                {registration.department}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal">
                                {getYearText(registration.year)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {registration.section !== "N/A" ? (
                                <Badge variant="outline" className="font-medium">
                                  {registration.section}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {registration.phone}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {registration.email}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(registration.registered_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                              <br />
                              <span className="text-xs">
                                {new Date(registration.registered_at).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
