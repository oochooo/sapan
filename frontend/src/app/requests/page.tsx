'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { connectionApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import type { ConnectionRequest } from '@/types';
import { User, Clock, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

export default function RequestsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const [sent, received] = await Promise.all([
          connectionApi.getSentRequests(),
          connectionApi.getReceivedRequests(),
        ]);
        setSentRequests(sent.results);
        setReceivedRequests(received.results);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAccept = async (id: number) => {
    try {
      await connectionApi.acceptRequest(id);
      setReceivedRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDecline = async (id: number) => {
    try {
      await connectionApi.declineRequest(id);
      setReceivedRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const pendingSentCount = sentRequests.filter((r) => r.status === 'pending').length;
  const pendingReceivedCount = receivedRequests.length;

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Connection Requests</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('sent')}
            className={clsx(
              'px-6 py-3 rounded-lg font-medium transition-colors',
              activeTab === 'sent'
                ? 'bg-primary-50 text-primary-700 border-2 border-primary-600'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            )}
          >
            Sent ({pendingSentCount} pending)
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={clsx(
              'px-6 py-3 rounded-lg font-medium transition-colors',
              activeTab === 'received'
                ? 'bg-primary-50 text-primary-700 border-2 border-primary-600'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            )}
          >
            Received ({pendingReceivedCount} new)
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {activeTab === 'sent' ? (
              sentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">You haven&apos;t sent any requests yet.</p>
                  {user?.user_type === 'founder' && (
                    <Link
                      href="/mentors"
                      className="mt-4 inline-block text-primary-600 hover:text-primary-700"
                    >
                      Browse Mentors &rarr;
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {sentRequests.map((request) => {
                    const targetUser = request.to_user_detail;
                    return (
                      <div key={request.id} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {targetUser.profile_photo ? (
                              <img
                                src={targetUser.profile_photo}
                                alt={`${targetUser.first_name} ${targetUser.last_name}`}
                                className="w-14 h-14 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-7 h-7 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {targetUser.first_name} {targetUser.last_name}
                              </h3>
                              {request.status === 'pending' && (
                                <Badge variant="warning">
                                  <Clock className="w-3 h-3 mr-1" /> Pending
                                </Badge>
                              )}
                              {request.status === 'accepted' && (
                                <Badge variant="success">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Accepted
                                </Badge>
                              )}
                              {request.status === 'declined' && (
                                <Badge variant="danger">
                                  <XCircle className="w-3 h-3 mr-1" /> Declined
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {targetUser.profile?.role} @ {targetUser.profile?.company}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Sent {new Date(request.created_at).toLocaleDateString()}
                            </p>
                            {request.message && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Your message:</span>
                                  <br />
                                  &ldquo;{request.message}&rdquo;
                                </p>
                              </div>
                            )}
                          </div>
                          {request.to_user_detail.profile_id && (
                          <Link
                            href={`/mentors/${request.to_user_detail.profile_id}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                          >
                            View Profile &rarr;
                          </Link>
                        )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : receivedRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No pending requests.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {receivedRequests.map((request) => {
                  const fromUser = request.from_user_detail;
                  return (
                    <div key={request.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {fromUser.profile_photo ? (
                            <img
                              src={fromUser.profile_photo}
                              alt={`${fromUser.first_name} ${fromUser.last_name}`}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-7 h-7 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {fromUser.first_name} {fromUser.last_name}
                            </h3>
                            <Badge variant="primary">NEW</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Founder @ {fromUser.profile?.startup_name}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {fromUser.profile?.industry && (
                              <Badge>{fromUser.profile.industry}</Badge>
                            )}
                            {fromUser.profile?.stage && (
                              <Badge>{fromUser.profile.stage}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Received {new Date(request.created_at).toLocaleDateString()}
                          </p>
                          {request.message && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Message:</span>
                                <br />
                                &ldquo;{request.message}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDecline(request.id)}
                          >
                            Decline
                          </Button>
                          <Button size="sm" onClick={() => handleAccept(request.id)}>
                            Accept
                          </Button>
                          {request.from_user_detail.profile_id && (
                            <Link
                              href={`/founders/${request.from_user_detail.profile_id}`}
                              className="text-xs text-center text-primary-600 hover:text-primary-700"
                            >
                              View Profile
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
