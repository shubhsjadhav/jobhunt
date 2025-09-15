import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Users, ExternalLink, Globe, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Company {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  location: string | null;
  industry: string | null;
  size: string | null;
  website: string | null;
  created_at: string;
  job_count?: number;
}

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard = ({ company }: CompanyCardProps) => {
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

  const truncateDescription = (description: string | null, maxLength: number = 120) => {
    if (!description) return "No description available";
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  return (
    <Card className="card-modern hover-lift group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {company.logo_url ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="relative w-14 h-14 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-xl text-foreground hover:text-primary transition-colors mb-2">
                <Link to={`/companies/${company.id}`} className="group-hover:text-gradient">{company.name}</Link>
              </h3>
              <div className="flex items-center space-x-2">
                {company.industry && (
                  <Badge variant="outline" className="text-xs hover:bg-accent/50 transition-colors">
                    {company.industry}
                  </Badge>
                )}
                {company.size && (
                  <Badge variant="secondary" className="text-xs hover:bg-accent/50 transition-colors">
                    {company.size}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {company.job_count !== undefined && (
            <Badge variant="default" className="text-xs group-hover:scale-105 transition-transform duration-200">
              {company.job_count} jobs
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {truncateDescription(company.description)}
        </p>
        
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          {company.location && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">{company.location}</span>
            </div>
          )}
          {company.website && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Globe className="h-4 w-4 text-secondary" />
              </div>
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium hover:text-primary transition-colors"
              >
                Website
              </a>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between pt-6 border-t border-border/50">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Joined {getTimeAgo(company.created_at)}</span>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" asChild className="hover:bg-accent/50">
            <Link to={`/companies/${company.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Company
            </Link>
          </Button>
          {company.job_count && company.job_count > 0 && (
            <Button size="sm" asChild className="btn-gradient">
              <Link to={`/companies/${company.id}`}>
                View Jobs
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
