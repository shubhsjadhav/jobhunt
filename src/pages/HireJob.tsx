import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, PlusCircle, Users, Search, Sparkles } from "lucide-react";
import { useState } from "react";

export default function HireJob() {
  const { user } = useAuth();
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState<string | undefined>(undefined);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header user={user ?? undefined} />

      {/* Hero */}
      <section className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="container py-12 md:py-16 grid gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Hire smarter with JobHunt Connect
            </div>
            <h1 className="mt-3 text-2xl md:text-4xl font-bold">Find and hire top talent fast</h1>
            <p className="text-muted-foreground mt-2">Post jobs, manage applications, and search candidates — similar to Naukri.com recruiter dashboard.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="btn-hero"><PlusCircle className="h-4 w-4 mr-2" /> Post a Job</Button>
              <Button variant="outline">Talk to sales</Button>
            </div>
          </div>

          {/* Candidate Search */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <Label htmlFor="skills" className="sr-only">Skills</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="skills" placeholder="Skills (e.g., React, Node, SQL)" className="pl-9" value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>
            </div>
            <div className="md:col-span-4">
              <Label htmlFor="location" className="sr-only">Location</Label>
              <Input id="location" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Select value={experience} onValueChange={(v) => setExperience(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-2">0-2 yrs</SelectItem>
                  <SelectItem value="2-5">2-5 yrs</SelectItem>
                  <SelectItem value="5-8">5-8 yrs</SelectItem>
                  <SelectItem value="8+">8+ yrs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Button className="w-full h-10">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter Dashboard Cards */}
      <section className="container py-10 md:py-14 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlusCircle className="h-4 w-4 text-primary" /> Post Job</CardTitle>
            <CardDescription>Create a job in minutes and reach thousands of candidates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Create Job</Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Manage Applications</CardTitle>
            <CardDescription>Track applicants, shortlist, and communicate effortlessly.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Open Dashboard</Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Search Candidates</CardTitle>
            <CardDescription>Find profiles that match your skill and experience needs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">Node</Badge>
              <Badge variant="secondary">Python</Badge>
              <Badge variant="secondary">SQL</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pricing */}
      <section className="container pb-12 md:pb-16">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl md:text-3xl font-bold">Flexible plans for every hiring need</h2>
          <p className="text-muted-foreground mt-2">Choose a plan that fits your hiring goals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>For occasional hiring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold">₹1,999<span className="text-sm font-normal text-muted-foreground">/job</span></div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1 job posting</li>
                <li>Basic reach</li>
                <li>Email support</li>
              </ul>
              <Button className="w-full">Choose Starter</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg border-primary/30 transition-shadow relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Popular</div>
            <CardHeader>
              <CardTitle>Growth</CardTitle>
              <CardDescription>For growing teams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold">₹6,999<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>5 active postings</li>
                <li>Featured listings</li>
                <li>Priority support</li>
              </ul>
              <Button className="w-full">Choose Growth</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For large organizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold">Custom</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Unlimited postings</li>
                <li>Dedicated success manager</li>
                <li>Custom integrations</li>
              </ul>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer-like CTA */}
      <section className="border-t bg-background">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
            <div>
              <div className="font-semibold">Ready to hire?</div>
              <p className="text-sm text-muted-foreground">Create your first job posting now.</p>
            </div>
          </div>
          <Button className="btn-hero"><PlusCircle className="h-4 w-4 mr-2" /> Get Started</Button>
        </div>
      </section>
    </div>
  );
}



