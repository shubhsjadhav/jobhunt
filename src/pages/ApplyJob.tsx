import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface JobListItem {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  tags?: string[];
}

const mockJobs: JobListItem[] = [
  { id: "1", title: "Frontend Developer", company: "TechNova", location: "Bengaluru", experience: "2-4 years", tags: ["React", "TypeScript", "UI"] },
  { id: "2", title: "Backend Engineer", company: "Cloudify", location: "Hyderabad", experience: "3-6 years", tags: ["Node.js", "Postgres", "API"] },
  { id: "3", title: "Full Stack Developer", company: "NextLabs", location: "Pune", experience: "1-3 years", tags: ["React", "Node", "Tailwind"] },
  { id: "4", title: "Data Analyst", company: "InsightIQ", location: "Gurugram", experience: "0-2 years", tags: ["SQL", "Python", "BI"] },
];

export default function ApplyJob() {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [experience, setExperience] = useState<string | undefined>(undefined);
  const [remoteOnly, setRemoteOnly] = useState(false);

  const filtered = mockJobs.filter((job) => {
    const matchesKeyword = keyword
      ? (job.title + job.company + (job.tags || []).join(" ")).toLowerCase().includes(keyword.toLowerCase())
      : true;
    const matchesLocation = location
      ? job.location.toLowerCase().includes(location.toLowerCase())
      : true;
    const matchesCategory = category ? job.title.toLowerCase().includes(category.toLowerCase()) : true;
    const matchesExp = experience ? job.experience.includes(experience) : true;
    const matchesRemote = remoteOnly ? job.location.toLowerCase().includes("remote") : true;
    return matchesKeyword && matchesLocation && matchesCategory && matchesExp && matchesRemote;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header user={user ?? undefined} />

      {/* Hero Search */}
      <section className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="container py-10 md:py-14">
          <div className="max-w-4xl mx-auto text-center mb-6 md:mb-10">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Find your dream job</h1>
            <p className="text-muted-foreground mt-2">Search by title, skills, or company — like Naukri.com</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <Label htmlFor="keyword" className="sr-only">Job title or skills</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="keyword" placeholder="Job title, skills, company" className="pl-9" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              </div>
            </div>
            <div className="md:col-span-5">
              <Label htmlFor="location" className="sr-only">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="location" placeholder="Location" className="pl-9" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
            <div className="md:col-span-2">
              <Button className="w-full h-10 md:h-10">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine your search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="full stack">Full Stack</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience</Label>
                <Select value={experience} onValueChange={(v) => setExperience(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2">0-2 years</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="2-4">2-4 years</SelectItem>
                    <SelectItem value="3-6">3-6 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remote" checked={remoteOnly} onCheckedChange={(v) => setRemoteOnly(Boolean(v))} />
                <Label htmlFor="remote">Remote only</Label>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Job Listings */}
        <div className="lg:col-span-9 space-y-4">
          {filtered.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{job.company} • {job.location}</p>
                  <p className="text-sm text-muted-foreground">Experience: {job.experience}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(job.tags || []).map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">Save</Button>
                  <Button>Apply</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">No jobs match your filters.</CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}



