"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { discoveryApi } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import Badge from "@/components/Badge";
import type { FounderProfile } from "@/types";
import { ArrowLeft, User } from "lucide-react";

export default function FounderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [founder, setFounder] = useState<FounderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFounder = async () => {
      try {
        const data = await discoveryApi.getFounder(Number(params.id));
        setFounder(data);
      } catch (error) {
        console.error("Error fetching founder:", error);
        router.push("/founders");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFounder();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </AuthGuard>
    );
  }

  if (!founder) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/founders"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Founders
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-shrink-0">
              {founder.user.profile_photo ? (
                <img
                  src={founder.user.profile_photo}
                  alt={`${founder.user.first_name} ${founder.user.last_name}`}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {founder.user.first_name} {founder.user.last_name}
              </h1>
              <p className="text-lg text-gray-600">
                Founder @ {founder.startup_name}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {founder.industry_detail && (
                  <Badge variant="primary">
                    {founder.industry_detail.name}
                  </Badge>
                )}
                <Badge>{founder.stage_display}</Badge>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* About Startup */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              About the Startup
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {founder.about_startup}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Looking For Help With */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Looking For Help With
            </h2>
            <div className="flex flex-wrap gap-2">
              {founder.objectives_detail.map((objective) => (
                <Badge key={objective.id}>{objective.name}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
