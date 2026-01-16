'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { profileApi, connectionApi } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import Badge from '@/components/Badge';
import { Card, CardContent } from '@/components/Card';
import type { FounderProfile, MentorProfile, Connection, ConnectionRequest } from '@/types';
import { User, Mail, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [founderProfile, setFounderProfile] = useState<FounderProfile | null>(null);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.user_type === 'founder') {
          const profile = await profileApi.getFounderProfile();
          setFounderProfile(profile);
        } else if (user?.user_type === 'mentor') {
          const profile = await profileApi.getMentorProfile();
          setMentorProfile(profile);
        }

        const [connectionsData, requestsData] = await Promise.all([
          connectionApi.getConnections(),
          connectionApi.getSentRequests(),
        ]);
        setConnections(connectionsData.results);
        setPendingRequests(requestsData.results.filter((r) => r.status === 'pending'));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        </div>

        <Card>
          <CardContent className="py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-shrink-0">
                {user?.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-500" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-gray-600 capitalize">{user?.user_type}</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Founder Profile */}
            {user?.user_type === 'founder' && founderProfile && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Startup</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-lg font-medium text-gray-900">{founderProfile.startup_name}</p>
                    <p className="text-sm text-gray-600">Stage: {founderProfile.stage_display}</p>
                    <p className="text-sm text-gray-600">
                      Industry: {founderProfile.industry_detail?.name}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600">{founderProfile.about_startup}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Looking For Help With</h3>
                  <div className="flex flex-wrap gap-2">
                    {founderProfile.objectives_detail.map((objective) => (
                      <Badge key={objective.id}>{objective.name}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Mentor Profile */}
            {user?.user_type === 'mentor' && mentorProfile && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-lg font-medium text-gray-900">
                      {mentorProfile.role} @ {mentorProfile.company}
                    </p>
                    <p className="text-sm text-gray-600">
                      {mentorProfile.years_of_experience} years experience
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Expertise Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentorProfile.expertise_industries_detail.map((industry) => (
                      <Badge key={industry.id} variant="primary">
                        {industry.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Can Help With</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentorProfile.can_help_with_detail.map((objective) => (
                      <Badge key={objective.id}>{objective.name}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <hr className="my-6 border-gray-200" />

            {/* Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Stats</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/connections" className="hover:text-primary-600">
                    {connections.length} Connections
                  </Link>
                </li>
                <li>
                  <Link href="/requests" className="hover:text-primary-600">
                    {pendingRequests.length} Pending Requests
                  </Link>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
