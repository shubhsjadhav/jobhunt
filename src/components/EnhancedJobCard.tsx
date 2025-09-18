import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Users, ExternalLink, Star, Eye, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface Job {
  id: string;
  title: string;
  company_name: string;
  company_logo?: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  skills_required: string[];
  is_remote: boolean;
  is_featured: boolean;
  view_count?: number;
  created_at: string;
  description?: string;
}

interface EnhancedJobCardProps {
  job: Job;
  showApplicationButton?: boolean;
}

export const EnhancedJobCard = ({ job, showApplicationButton = true }: EnhancedJobCardProps) => {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${(max! / 1000).toFixed(0)}k`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Card className={`card-modern hover-lift group relative ${job.is_featured ? 'ring-2 ring-yellow-400/50' : ''}`}>
      {job.is_featured && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {job.company_logo ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                <img
                  src={job.company_logo}
                  alt={`${job.company_name} logo`}
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
              <p className="text-muted-foreground font-medium">{job.company_name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={job.is_remote ? "secondary" : "outline"} className="group-hover:scale-105 transition-transform duration-200">
              {job.is_remote ? "Remote" : "On-site"}
            </Badge>
            {job.view_count !== undefined && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{job.view_count} views</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <span className="font-medium capitalize">{job.experience_level.replace('-', ' ')}</span>
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
          <Calendar className="h-4 w-4" />
          <span>{getTimeAgo(job.created_at)}</span>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" asChild className="hover:bg-accent/50">
            <Link to={`/jobs/${job.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          {showApplicationButton && (
            <Button size="sm" asChild className="btn-gradient">
              <Link to={`/jobs/${job.id}/apply`}>
                Apply Now
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};