import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobSaveButton } from "@/components/JobSaveButton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Users, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logo_url?: string;
    location: string;
  };
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  skills_required: string[];
  is_remote: boolean;
  created_at: string;
}

interface JobCardProps {
  job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${(max! / 1000).toFixed(0)}k`;
    )
  }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return \`${Math.floor(diffInDays / 7)} weeks ago`;
    return \`${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Card className="card-modern hover-lift group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {job.company.logo_url ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                <img
                  src={job.company.logo_url}
                  alt={\`${job.company.name} logo`}
                  className="relative w-14 h-14 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Users className="h-7 w-7 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-xl text-foreground hover:text-primary transition-colors mb-1">
                <Link to={`/jobs/${job.id}`} className="group-hover:text-gradient">{job.title}</Link>
              </h3>
              <p className="text-muted-foreground font-medium">{job.company.name}</p>
            </div>
          </div>
          <Badge variant={job.is_remote ? "secondary" : "outline"} className="group-hover:scale-105 transition-transform duration-200">
            {job.is_remote ? "Remote" : "On-site"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{job.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-secondary" />
            </div>
            <span className="font-medium capitalize">{job.employment_type.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-medium">{formatSalary(job.salary_min, job.salary_max)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {job.skills_required.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs hover:bg-accent/50 transition-colors">
              {skill}
            </Badge>
          ))}
          {job.skills_required.length > 4 && (
            <Badge variant="outline" className="text-xs hover:bg-accent/50 transition-colors">
              +{job.skills_required.length - 4} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between pt-6 border-t border-border/50">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{getTimeAgo(job.created_at)}</span>
        </div>
        <div className="flex space-x-3">
          <JobSaveButton jobId={job.id} />
          <Button variant="outline" size="sm" asChild className="hover:bg-accent/50">
            <Link to={`/jobs/${job.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button size="sm" asChild className="btn-gradient">
            <Link to={`/jobs/${job.id}`}>
              Apply Now
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
}