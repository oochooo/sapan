"use client";

import { useState, useEffect } from "react";
import { discoveryApi, referenceApi } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import FounderCard from "@/components/FounderCard";
import Select from "@/components/Select";
import Input from "@/components/Input";
import Button from "@/components/Button";
import type { FounderProfile, IndustryCategory, Stage } from "@/types";
import { Search, X } from "lucide-react";

export default function FoundersPage() {
  const [founders, setFounders] = useState<FounderProfile[]>([]);
  const [industries, setIndustries] = useState<IndustryCategory[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [industriesData, stagesData] = await Promise.all([
          referenceApi.getIndustries(),
          referenceApi.getStages(),
        ]);
        setIndustries(industriesData);
        setStages(stagesData);
      } catch (error) {
        console.error("Error fetching reference data:", error);
      }
    };
    fetchReferenceData();
  }, []);

  useEffect(() => {
    const fetchFounders = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (industryFilter) params["industry__slug"] = industryFilter;
        if (stageFilter) params.stage = stageFilter;

        const data = await discoveryApi.getFounders(params);
        setFounders(data.results);
        setTotalCount(data.count);
      } catch (error) {
        console.error("Error fetching founders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchFounders, 300);
    return () => clearTimeout(debounce);
  }, [search, industryFilter, stageFilter]);

  const clearFilters = () => {
    setSearch("");
    setIndustryFilter("");
    setStageFilter("");
  };

  const hasFilters = search || industryFilter || stageFilter;

  const industryOptions = industries.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      value: sub.slug,
      label: `${cat.name} / ${sub.name}`,
    })),
  );

  const stageOptions = stages.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Browse Founders</h1>
          <span className="text-sm text-gray-500">{totalCount} founders</span>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name, startup, about..."
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
                options={stageOptions}
                placeholder="Stage"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-36"
              />
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Founders Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : founders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No founders found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {founders.map((founder) => (
              <FounderCard key={founder.id} founder={founder} />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
