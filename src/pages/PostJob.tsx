import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Plus, X, DollarSign, MapPin, Building2, Users, Clock, Tag } from "lucide-react";

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    company_logo: "",
    location: "",
    employment_type: "",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    description: "",
    requirements: [] as string[],
    benefits: [] as string[],
    skills_required: [] as string[],
    is_remote: false,
    is_featured: false,
  });
  
  const [newRequirement, setNewRequirement] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated
  if (!user) {
    navigate("/auth");
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.company_name.trim()) newErrors.company_name = "Company name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.employment_type) newErrors.employment_type = "Employment type is required";
    if (!formData.experience_level) newErrors.experience_level = "Experience level is required";
    if (!formData.description.trim()) newErrors.description = "Job description is required";
    
    if (formData.salary_min && formData.salary_max) {
      const minSalary = parseInt(formData.salary_min);
      const maxSalary = parseInt(formData.salary_max);
      if (minSalary >= maxSalary) {
        newErrors.salary_max = "Maximum salary must be greater than minimum salary";
      }
    }
    
    if (formData.description.length < 100) {
      newErrors.description = "Job description must be at least 100 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = (type: 'requirements' | 'benefits' | 'skills_required', value: string, setter: (value: string) => void) => {
    if (value.trim() && !formData[type].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
      setter("");
    }
  };

  const removeItem = (type: 'requirements' | 'benefits' | 'skills_required', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const jobData = {
        title: formData.title.trim(),
        company_name: formData.company_name.trim(),
        company_logo: formData.company_logo.trim() || null,
        location: formData.location.trim(),
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        description: formData.description.trim(),
        requirements: formData.requirements,
        benefits: formData.benefits,
        skills_required: formData.skills_required,
        is_remote: formData.is_remote,
        is_featured: formData.is_featured,
        is_active: true,
        status: 'active',
        posted_by: user.id,
      };

      const { data, error } = await supabase
        .from("jobs")
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;

      // Insert job tags
      if (formData.skills_required.length > 0) {
        const tagInserts = formData.skills_required.map(skill => ({
          job_id: data.id,
          tag_name: skill
        }));
        
        await supabase.from("job_tags").insert(tagInserts);
      }

      toast({
        title: "Job Posted Successfully!",
        description: "Your job posting is now live and visible to candidates.",
      });

      navigate(`/jobs/${data.id}`);
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast({
        title: "Error Posting Job",
        description: error.message || "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-xl">
                <Briefcase className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Post a New Job
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find the perfect candidate for your team. Create a detailed job posting to attract top talent.
            </p>
          </div>

          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Job Details</span>
              </CardTitle>
              <CardDescription>
                Provide detailed information about the position to attract the right candidates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Job Title *</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Senior Frontend Developer"
                      className={errors.title ? "border-destructive" : ""}
                    />
                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>Company Name *</span>
                    </Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="e.g., TechCorp Solutions"
                      className={errors.company_name ? "border-destructive" : ""}
                    />
                    {errors.company_name && <p className="text-sm text-destructive">{errors.company_name}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Location *</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., San Francisco, CA"
                      className={errors.location ? "border-destructive" : ""}
                    />
                    {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_logo">Company Logo URL</Label>
                    <Input
                      id="company_logo"
                      type="url"
                      value={formData.company_logo}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_logo: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>

                {/* Employment Details */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Employment Type *</span>
                    </Label>
                    <Select value={formData.employment_type} onValueChange={(value) => setFormData(prev => ({ ...prev, employment_type: value }))}>
                      <SelectTrigger className={errors.employment_type ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.employment_type && <p className="text-sm text-destructive">{errors.employment_type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Experience Level *</span>
                    </Label>
                    <Select value={formData.experience_level} onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}>
                      <SelectTrigger className={errors.experience_level ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid-level">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.experience_level && <p className="text-sm text-destructive">{errors.experience_level}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_remote"
                        checked={formData.is_remote}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_remote: checked }))}
                      />
                      <Label htmlFor="is_remote">Remote Work</Label>
                    </div>
                  </div>
                </div>

                {/* Salary Range */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="salary_min" className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Minimum Salary (USD)</span>
                    </Label>
                    <Input
                      id="salary_min"
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary_min: e.target.value }))}
                      placeholder="e.g., 80000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary_max" className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Maximum Salary (USD)</span>
                    </Label>
                    <Input
                      id="salary_max"
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary_max: e.target.value }))}
                      placeholder="e.g., 120000"
                      className={errors.salary_max ? "border-destructive" : ""}
                    />
                    {errors.salary_max && <p className="text-sm text-destructive">{errors.salary_max}</p>}
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide a detailed description of the role, responsibilities, and what makes this opportunity exciting..."
                    rows={6}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formData.description.length} characters (minimum 100)</span>
                    {errors.description && <span className="text-destructive">{errors.description}</span>}
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <Label>Requirements</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add a requirement..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('requirements', newRequirement, setNewRequirement))}
                    />
                    <Button
                      type="button"
                      onClick={() => addItem('requirements', newRequirement, setNewRequirement)}
                      disabled={!newRequirement.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {req}
                        <X
                          className="h-3 w-3 ml-1"
                          onClick={() => removeItem('requirements', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <Label>Benefits</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="Add a benefit..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('benefits', newBenefit, setNewBenefit))}
                    />
                    <Button
                      type="button"
                      onClick={() => addItem('benefits', newBenefit, setNewBenefit)}
                      disabled={!newBenefit.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer">
                        {benefit}
                        <X
                          className="h-3 w-3 ml-1"
                          onClick={() => removeItem('benefits', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>Required Skills</span>
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skills_required', newSkill, setNewSkill))}
                    />
                    <Button
                      type="button"
                      onClick={() => addItem('skills_required', newSkill, setNewSkill)}
                      disabled={!newSkill.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills_required.map((skill, index) => (
                      <Badge key={index} variant="default" className="cursor-pointer">
                        {skill}
                        <X
                          className="h-3 w-3 ml-1"
                          onClick={() => removeItem('skills_required', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Featured Job Option */}
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <div>
                    <Label htmlFor="is_featured" className="font-medium">Featured Job</Label>
                    <p className="text-sm text-muted-foreground">
                      Featured jobs appear at the top of search results and get more visibility.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-hero px-8"
                  >
                    {loading ? "Posting Job..." : "Post Job"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}