"use client";

import { useState, useEffect } from "react";
import { discoveryApi, referenceApi } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import MentorCard from "@/components/MentorCard";
import Select from "@/components/Select";
import Input from "@/components/Input";
import Button from "@/components/Button";
import type { MentorProfile, IndustryCategory, Objective } from "@/types";
import { Search, X } from "lucide-react";

export default function MentorsPage() {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [industries, setIndustries] = useState<IndustryCategory[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [objectiveFilter, setObjectiveFilter] = useState("");

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [industriesData, objectivesData] = await Promise.all([
          referenceApi.getIndustries(),
          referenceApi.getObjectives(),
        ]);
        setIndustries(industriesData);
        setObjectives(objectivesData);
      } catch (error) {
        console.error("Error fetching reference data:", error);
      }
    };
    fetchReferenceData();
  }, []);

  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (industryFilter)
          params["expertise_industries__slug"] = industryFilter;
        if (objectiveFilter) params["can_help_with__slug"] = objectiveFilter;

        const data = await discoveryApi.getMentors(params);
        setMentors(data.results);
        setTotalCount(data.count);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchMentors, 300);
    return () => clearTimeout(debounce);
  }, [search, industryFilter, objectiveFilter]);

  const clearFilters = () => {
    setSearch("");
    setIndustryFilter("");
    setObjectiveFilter("");
  };

  const hasFilters = search || industryFilter || objectiveFilter;

  const industryOptions = industries.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      value: sub.slug,
      label: `${cat.name} / ${sub.name}`,
    })),
  );

  const objectiveOptions = objectives.map((obj) => ({
    value: obj.slug,
    label: obj.name,
  }));

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Browse Mentors</h1>
          <span className="text-sm text-gray-500">{totalCount} mentors</span>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name, company, bio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select
                options={industryOptions}
                placeholder="Industry"
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-48"
              />
              <Select
                options={objectiveOptions}
                placeholder="Can Help With"
                value={objectiveFilter}
                onChange={(e) => setObjectiveFilter(e.target.value)}
                className="w-48"
              />
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No mentors found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
