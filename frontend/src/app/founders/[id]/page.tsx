"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { discoveryApi, connectionApi } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import type { FounderProfile, ConnectionIntent } from "@/types";
import { ArrowLeft, User } from "lucide-react";

const INTENT_OPTIONS = [
  { value: "mentor_me", label: "I'd like to mentor them" },
  { value: "collaborate", label: "Let's collaborate" },
  { value: "peer_network", label: "Peer networking" },
];

export default function FounderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [founder, setFounder] = useState<FounderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [intent, setIntent] = useState<ConnectionIntent>("mentor_me");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

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

  const handleSendRequest = async () => {
    if (!founder) return;

    try {
      setIsSending(true);
      setError("");
      await connectionApi.sendRequest(founder.user.id, message || undefined, intent);
      setIsModalOpen(false);
      // Refresh founder data to update connection status
      const updatedFounder = await discoveryApi.getFounder(founder.id);
      setFounder(updatedFounder);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { to_user?: string[] } } };
      setError(error.response?.data?.to_user?.[0] || "Failed to send request");
    } finally {
      setIsSending(false);
    }
  };

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
            <div>
              {founder.connection_status === "accepted" ? (
                <Badge variant="success" className="text-sm px-4 py-2">
                  Connected
                </Badge>
              ) : founder.connection_status === "pending" ? (
                <Badge variant="warning" className="text-sm px-4 py-2">
                  Pending
                </Badge>
              ) : (
                <Button onClick={() => setIsModalOpen(true)} size="lg">
                  Connect
                </Button>
              )}
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

          {/* Connected - show email */}
          {founder.connection_status === "accepted" && (
            <>
              <hr className="my-6 border-gray-200" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Contact
                </h2>
                <p className="text-gray-600">
                  <span className="mr-2">&#128231;</span>
                  <a
                    href={`mailto:${founder.user.email}`}
                    className="text-primary-600 hover:underline"
                  >
                    {founder.user.email}
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Connect with ${founder.user.first_name}`}
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {error}
            </div>
          )}

          <Select
            label="What brings you here?"
            options={INTENT_OPTIONS}
            value={intent}
            onChange={(e) => setIntent(e.target.value as ConnectionIntent)}
          />

          <Textarea
            label="Add a message (optional)"
            placeholder={`Hi ${founder.user.first_name}, I'm reaching out because...`}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendRequest} isLoading={isSending}>
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </AuthGuard>
  );
}
