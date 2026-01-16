"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { connectionApi } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import Input from "@/components/Input";
import Badge from "@/components/Badge";
import type { Connection } from "@/types";
import { Search, User, Mail } from "lucide-react";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const data = await connectionApi.getConnections();
        setConnections(data.results);
      } catch (error) {
        console.error("Error fetching connections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConnections();
  }, []);

  const filteredConnections = connections.filter((connection) => {
    const searchLower = search.toLowerCase();
    const user = connection.connected_user;
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.profile?.company?.toLowerCase().includes(searchLower) ||
      user.profile?.startup_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Connections</h1>
          <span className="text-sm text-gray-500">
            {connections.length} connections
          </span>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search connections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Connections List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {connections.length === 0
                ? "You have no connections yet."
                : "No connections match your search."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {filteredConnections.map((connection) => {
              const user = connection.connected_user;
              const detailUrl = user.profile_id
                ? user.user_type === "founder"
                  ? `/founders/${user.profile_id}`
                  : `/mentors/${user.profile_id}`
                : null;

              return (
                <div
                  key={connection.id}
                  className="p-6 flex items-center gap-4"
                >
                  <div className="flex-shrink-0">
                    {user.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-7 h-7 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {user.user_type === "founder"
                        ? `Founder @ ${user.profile?.startup_name || "Startup"}`
                        : `${user.profile?.role || "Role"} @ ${user.profile?.company || "Company"}`}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {user.profile?.industry && (
                        <Badge variant="primary">{user.profile.industry}</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                      <a
                        href={`mailto:${user.email}`}
                        className="text-primary-600 hover:underline"
                      >
                        {user.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-400">
                      Connected{" "}
                      {new Date(connection.connected_at).toLocaleDateString()}
                    </span>
                    {detailUrl && (
                      <Link
                        href={detailUrl}
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
        )}
      </div>
    </AuthGuard>
  );
}
