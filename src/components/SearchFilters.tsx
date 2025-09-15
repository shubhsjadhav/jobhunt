import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, X } from "lucide-react";
import { useState } from "react";

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export interface SearchFilters {
  query: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  isRemote: boolean | null;
  skills: string[];
}

export const SearchFilters = ({ onFiltersChange, className }: SearchFiltersProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    employmentType: "",
    experienceLevel: "",
    isRemote: null,
    skills: [],
  });

  const [skillInput, setSkillInput] = useState("");

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !filters.skills.includes(skill.trim())) {
      const newSkills = [...filters.skills, skill.trim()];
      updateFilters({ skills: newSkills });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = filters.skills.filter(skill => skill !== skillToRemove);
    updateFilters({ skills: newSkills });
  };

  const clearAllFilters = () => {
    const clearedFilters: SearchFilters = {
      query: "",
      location: "",
      employmentType: "",
      experienceLevel: "",
      isRemote: null,
      skills: [],
    };
    setFilters(clearedFilters);
    setSkillInput("");
    onFiltersChange(clearedFilters);
  };

  return (
    <div className={`bg-card rounded-lg p-6 shadow-md border ${className}`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Job Title/Company Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Job title, company, or keywords..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => updateFilters({ location: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Remote Work */}
        <Select
          value={filters.isRemote === null ? "" : filters.isRemote.toString()}
          onValueChange={(value) => 
            updateFilters({ 
              isRemote: value === "" ? null : value === "true" 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Work Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="true">Remote</SelectItem>
            <SelectItem value="false">On-site</SelectItem>
          </SelectContent>
        </Select>

        {/* Employment Type */}
        <Select
          value={filters.employmentType}
          onValueChange={(value) => updateFilters({ employmentType: value })}
        >
          <SelectTrigger>
            <Briefcase className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Employment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>

        {/* Experience Level */}
        <Select
          value={filters.experienceLevel}
          onValueChange={(value) => updateFilters({ experienceLevel: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Experience Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="entry">Entry Level</SelectItem>
            <SelectItem value="mid-level">Mid Level</SelectItem>
            <SelectItem value="senior">Senior Level</SelectItem>
            <SelectItem value="executive">Executive</SelectItem>
          </SelectContent>
        </Select>

        {/* Skills */}
        <div className="lg:col-span-2">
          <div className="flex space-x-2">
            <Input
              placeholder="Add skills (press Enter)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill(skillInput);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addSkill(skillInput)}
              disabled={!skillInput.trim()}
            >
              Add
            </Button>
          </div>
          
          {/* Selected Skills */}
          {filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeSkill(skill)}
                >
                  {skill}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clear Filters */}
      <div className="flex justify-end mt-4">
        <Button variant="outline" size="sm" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};