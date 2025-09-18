import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search, MapPin, Briefcase, X, Filter, DollarSign } from "lucide-react";
import { useState } from "react";

interface EnhancedSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export interface SearchFilters {
  query: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  isRemote: boolean | null;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
}

export const EnhancedSearchFilters = ({ onFiltersChange, className }: EnhancedSearchFiltersProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    employmentType: "",
    experienceLevel: "",
    isRemote: null,
    salaryMin: 0,
    salaryMax: 200000,
    skills: [],
  });

  const [skillInput, setSkillInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      salaryMin: 0,
      salaryMax: 200000,
      skills: [],
    };
    setFilters(clearedFilters);
    setSkillInput("");
    onFiltersChange(clearedFilters);
  };

  const handleSalaryChange = (values: number[]) => {
    updateFilters({ salaryMin: values[0], salaryMax: values[1] });
  };

  return (
    <div className={`bg-card rounded-lg p-6 shadow-md border space-y-6 ${className}`}>
      {/* Main Search Bar */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Job title, company, or keywords..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => updateFilters({ location: e.target.value })}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="remote-toggle"
              checked={filters.isRemote === true}
              onCheckedChange={(checked) => 
                updateFilters({ isRemote: checked ? true : null })
              }
            />
            <Label htmlFor="remote-toggle" className="text-sm font-medium">
              Remote Only
            </Label>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>{showAdvanced ? "Hide" : "Show"} Advanced</span>
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-6 pt-4 border-t">
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          {/* Salary Range */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">
                Salary Range: ${(filters.salaryMin / 1000).toFixed(0)}k - ${(filters.salaryMax / 1000).toFixed(0)}k
              </Label>
            </div>
            <Slider
              value={[filters.salaryMin, filters.salaryMax]}
              onValueChange={handleSalaryChange}
              max={200000}
              min={0}
              step={5000}
              className="w-full"
            />
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Skills</Label>
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
                className="flex-1"
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
              <div className="flex flex-wrap gap-2">
                {filters.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
      )}

      {/* Clear Filters */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {filters.query || filters.location || filters.employmentType || filters.experienceLevel || filters.isRemote !== null || filters.skills.length > 0
            ? "Filters applied"
            : "No filters applied"
          }
        </div>
        <Button variant="outline" size="sm" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};