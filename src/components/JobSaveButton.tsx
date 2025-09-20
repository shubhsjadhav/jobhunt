import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Loader2 } from "lucide-react";

interface JobSaveButtonProps {
  jobId: string;
  className?: string;
}

export const JobSaveButton = ({ jobId, className }: JobSaveButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfSaved();
    }
  }, [user, jobId]);

  const checkIfSaved = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("user_id", user.id)
        .eq("job_id", jobId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setIsSaved(!!data);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const toggleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save jobs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("user_id", user.id)
          .eq("job_id", jobId);

        if (error) throw error;

        setIsSaved(false);
        toast({
          title: "Job removed",
          description: "Job removed from your saved list",
        });
      } else {
        // Add to saved
        const { error } = await supabase
          .from("saved_jobs")
          .insert({
            user_id: user.id,
            job_id: jobId,
          });

        if (error) throw error;

        setIsSaved(true);
        toast({
          title: "Job saved",
          description: "Job added to your saved list",
        });
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast({
        title: "Error",
        description: "Failed to update saved status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size="sm"
      onClick={toggleSave}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
      )}
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
};