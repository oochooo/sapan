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
import type { MentorProfile, ConnectionIntent } from "@/types";
import { ArrowLeft, User } from "lucide-react";

const INTENT_OPTIONS = [
  { value: "mentor_me", label: "I'd like mentorship" },
  { value: "collaborate", label: "Let's collaborate" },
  { value: "peer_network", label: "Peer networking" },
];

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [intent, setIntent] = useState<ConnectionIntent>("mentor_me");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const data = await discoveryApi.getMentor(Number(params.id));
        setMentor(data);
      } catch (error) {
        console.error("Error fetching mentor:", error);
        router.push("/mentors");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMentor();
  }, [params.id, router]);

  const handleSendRequest = async () => {
    if (!mentor) return;

    try {
      setIsSending(true);
      setError("");
      await connectionApi.sendRequest(mentor.user.id, message || undefined, intent);
      setIsModalOpen(false);
      // Refresh mentor data to update connection status
      const updatedMentor = await discoveryApi.getMentor(mentor.id);
      setMentor(updatedMentor);
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

  if (!mentor) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/mentors"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Mentors
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-shrink-0">
              {mentor.user.profile_photo ? (
                <img
                  src={mentor.user.profile_photo}
                  alt={`${mentor.user.first_name} ${mentor.user.last_name}`}
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
                {mentor.user.first_name} {mentor.user.last_name}
              </h1>
              <p className="text-lg text-gray-600">
                {mentor.role} @ {mentor.company}
              </p>
              <p className="text-gray-500">
                {mentor.years_of_experience} years experience
              </p>
            </div>
            <div>
              {mentor.connection_status === "accepted" ? (
                <Badge variant="success" className="text-sm px-4 py-2">
                  Connected
                </Badge>
              ) : mentor.connection_status === "pending" ? (
                <Badge variant="warning" className="text-sm px-4 py-2">
                  Pending
                </Badge>
              ) : (
                <Button onClick={() => setIsModalOpen(true)} size="lg">
                  Request Introduction
                </Button>
              )}
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* About */}
          {mentor.user.bio && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  About
                </h2>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {mentor.user.bio}
                </p>
              </div>
              <hr className="my-6 border-gray-200" />
            </>
          )}

          {/* Industries */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Industries
            </h2>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise_industries_detail.map((industry) => (
                <Badge key={industry.id} variant="primary">
                  {industry.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Can Help With */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Can Help With
            </h2>
            <div className="flex flex-wrap gap-2">
              {mentor.can_help_with_detail.map((objective) => (
                <Badge key={objective.id}>{objective.name}</Badge>
              ))}
            </div>
          </div>

          {/* Connected - show email */}
          {mentor.connection_status === "accepted" && (
            <>
              <hr className="my-6 border-gray-200" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Contact
                </h2>
                <p className="text-gray-600">
                  <span className="mr-2">&#128231;</span>
                  <a
                    href={`mailto:${mentor.user.email}`}
                    className="text-primary-600 hover:underline"
                  >
                    {mentor.user.email}
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
        title={`Connect with ${mentor.user.first_name}`}
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
            placeholder={`Hi ${mentor.user.first_name}, I'm reaching out because...`}
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
