import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, FileText, MessageSquare, Send } from "lucide-react";

export default function JobApplicationForm() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    applicant_name: user?.user_metadata?.full_name || "",
    applicant_email: user?.email || "",
    applicant_phone: "",
    resume_url: "",
    cover_letter: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.applicant_name.trim()) {
      newErrors.applicant_name = "Full name is required";
    }
    
    if (!formData.applicant_email.trim()) {
      newErrors.applicant_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.applicant_email)) {
      newErrors.applicant_email = "Please enter a valid email address";
    }
    
    if (formData.resume_url && !/^https?:\/\/.+/.test(formData.resume_url)) {
      newErrors.resume_url = "Please enter a valid URL";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    if (!id) {
      toast({
        title: "Error",
        description: "Job ID is missing",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const applicationData = {
        job_id: id,
        applicant_name: formData.applicant_name.trim(),
        applicant_email: formData.applicant_email.trim(),
        applicant_phone: formData.applicant_phone.trim() || null,
        resume_url: formData.resume_url.trim() || null,
        cover_letter: formData.cover_letter.trim() || null,
        status: "pending",
        user_id: user?.id || null,
      };

      const { error } = await supabase
        .from("job_applications")
        .insert(applicationData);

      if (error) {
        if (error.code === "23505") { // Unique constraint violation
          throw new Error("You have already applied for this job");
        }
        throw error;
      }

      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the employer. You'll hear back soon.",
      });

      navigate(`/jobs/${id}`);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error Submitting Application",
        description: error.message || "Failed to submit application. Please try again.",
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-xl">
                <Send className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Apply for this Job
            </h1>
            <p className="text-xl text-muted-foreground">
              Fill out the form below to submit your application
            </p>
          </div>

          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Application Details</span>
              </CardTitle>
              <CardDescription>
                Provide your information and tell us why you're a great fit for this role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="applicant_name" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Full Name *</span>
                    </Label>
                    <Input
                      id="applicant_name"
                      value={formData.applicant_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, applicant_name: e.target.value }))}
                      placeholder="Enter your full name"
                      className={errors.applicant_name ? "border-destructive" : ""}
                    />
                    {errors.applicant_name && (
                      <p className="text-sm text-destructive">{errors.applicant_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicant_email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Address *</span>
                    </Label>
                    <Input
                      id="applicant_email"
                      type="email"
                      value={formData.applicant_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, applicant_email: e.target.value }))}
                      placeholder="Enter your email address"
                      className={errors.applicant_email ? "border-destructive" : ""}
                    />
                    {errors.applicant_email && (
                      <p className="text-sm text-destructive">{errors.applicant_email}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="applicant_phone" className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone Number</span>
                    </Label>
                    <Input
                      id="applicant_phone"
                      type="tel"
                      value={formData.applicant_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, applicant_phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume_url" className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Resume URL</span>
                    </Label>
                    <Input
                      id="resume_url"
                      type="url"
                      value={formData.resume_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, resume_url: e.target.value }))}
                      placeholder="https://drive.google.com/your-resume"
                      className={errors.resume_url ? "border-destructive" : ""}
                    />
                    {errors.resume_url && (
                      <p className="text-sm text-destructive">{errors.resume_url}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Link to your resume on Google Drive, Dropbox, or personal website
                    </p>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="space-y-2">
                  <Label htmlFor="cover_letter" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Cover Letter</span>
                  </Label>
                  <Textarea
                    id="cover_letter"
                    value={formData.cover_letter}
                    onChange={(e) => setFormData(prev => ({ ...prev, cover_letter: e.target.value }))}
                    placeholder="Tell us why you're interested in this role and what makes you a great fit..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: Share your motivation and relevant experience
                  </p>
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
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
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