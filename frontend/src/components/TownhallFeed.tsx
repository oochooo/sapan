"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { connectionApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type {
  TownhallConnection,
  TownhallUserAnonymous,
  TownhallUserAuthenticated,
} from "@/types";

function isAuthenticated(
  user: TownhallUserAnonymous | TownhallUserAuthenticated,
): user is TownhallUserAuthenticated {
  return "id" in user;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function ConnectionItem({
  connection,
  isLoggedIn,
}: {
  connection: TownhallConnection;
  isLoggedIn: boolean;
}) {
  const from = connection.from_user_detail;
  const to = connection.to_user_detail;

  if (isLoggedIn && isAuthenticated(from) && isAuthenticated(to)) {
    // Authenticated view - show full details
    const fromName = `${from.first_name} ${from.last_name}`.trim() || "Someone";
    const toName = `${to.first_name} ${to.last_name}`.trim() || "Someone";

    const fromRole =
      from.user_type === "founder"
        ? `Founder${from.startup_name ? ` @ ${from.startup_name}` : ""}`
        : `${from.role || "Mentor"}${from.company ? ` @ ${from.company}` : ""}`;

    const toRole =
      to.user_type === "founder"
        ? `Founder${to.startup_name ? ` @ ${to.startup_name}` : ""}`
        : `${to.role || "Mentor"}${to.company ? ` @ ${to.company}` : ""}`;

    return (
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="w-2 h-2 mt-2 rounded-full bg-green-500 animate-pulse" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">
            <Link
              href={`/${from.user_type}s/${from.profile_id}`}
              className="font-semibold text-primary-600 hover:underline"
            >
              {fromName}
            </Link>
            <span className="text-gray-500"> ({fromRole})</span>
            <span className="text-gray-600"> connected with </span>
            <Link
              href={`/${to.user_type}s/${to.profile_id}`}
              className="font-semibold text-primary-600 hover:underline"
            >
              {toName}
            </Link>
            <span className="text-gray-500"> ({toRole})</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatTimeAgo(connection.connected_at)}
          </p>
        </div>
      </div>
    );
  }

  // Anonymous view - show anonymized descriptions
  const fromAnon = from as TownhallUserAnonymous;
  const toAnon = to as TownhallUserAnonymous;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-2 h-2 mt-2 rounded-full bg-green-500 animate-pulse" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{fromAnon.description}</span>
          <span className="text-gray-600"> connected with </span>
          <span className="font-medium">{toAnon.description}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {formatTimeAgo(connection.connected_at)}
        </p>
      </div>
    </div>
  );
}

export function TownhallFeed() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<TownhallConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const data = await connectionApi.getRecentConnections();
        setConnections(data);
      } catch {
        setError("Failed to load recent connections");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || connections.length === 0) {
    return (
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <Sparkles className="w-8 h-8 text-primary-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Be Part of the First Wave
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Join now to start connecting with Thailand&apos;s startup community
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 text-primary-600 font-medium text-sm hover:text-primary-700"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-purple-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Live Connections</h3>
          <span className="text-xs text-gray-500 ml-auto">
            {connections.length} this week
          </span>
        </div>
      </div>
      <div className="px-6 py-2">
        {connections.map((connection) => (
          <ConnectionItem
            key={connection.id}
            connection={connection}
            isLoggedIn={!!user}
          />
        ))}
      </div>
      {!user && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 text-primary-600 font-medium text-sm hover:text-primary-700"
          >
            Sign up to see who&apos;s connecting <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
