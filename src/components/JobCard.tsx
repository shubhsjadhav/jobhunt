import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Users, ExternalLink, Building2, Calendar } from "lucide-react";
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

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'entry':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'mid-level':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'senior':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="card-professional hover-professional group border-0 shadow-professional">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {job.company.logo_url ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                <img
                  src={job.company.logo_url}
                  alt={\`${job.company.name} logo`}
                  className="relative w-14 h-14 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300 shadow-sm"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 border border-gray-200">
                <Building2 className="h-7 w-7 text-gray-600" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-xl text-gray-900 hover:text-blue-600 transition-colors mb-1 group-hover:text-blue-600">
                <Link to={`/jobs/${job.id}`}>{job.title}</Link>
              </h3>
              <p className="text-gray-600 font-medium">{job.company.name}</p>
            </div>
          </div>
          <Badge className={\`${job.is_remote ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'} group-hover:scale-105 transition-transform duration-200`}>
            {job.is_remote ? "Remote" : "On-site"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-medium">{job.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <span className="font-medium capitalize">{job.employment_type.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-medium">{formatSalary(job.salary_min, job.salary_max)}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
            <Badge className={\`text-xs ${getExperienceColor(job.experience_level)} font-medium`}>
              {job.experience_level.replace('-', ' ')}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {job.skills_required.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 transition-colors">
              {skill}
            </Badge>
          ))}
          {job.skills_required.length > 4 && (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 transition-colors">
              +{job.skills_required.length - 4} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between pt-6 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{getTimeAgo(job.created_at)}</span>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" asChild className="btn-professional hover-professional">
            <Link to={`/jobs/${job.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button size="sm" asChild className="btn-hero shadow-sm">
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