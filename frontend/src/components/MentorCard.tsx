import Link from 'next/link';
import type { MentorProfile } from '@/types';
import Badge from './Badge';
import { User } from 'lucide-react';

interface MentorCardProps {
  mentor: MentorProfile;
}

export default function MentorCard({ mentor }: MentorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {mentor.user.profile_photo ? (
            <img
              src={mentor.user.profile_photo}
              alt={`${mentor.user.first_name} ${mentor.user.last_name}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {mentor.user.first_name} {mentor.user.last_name}
          </h3>
          <p className="text-sm text-gray-600">
            {mentor.role} @ {mentor.company}
          </p>
          <p className="text-sm text-gray-500">
            {mentor.years_of_experience} years experience
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {mentor.expertise_industries_detail.slice(0, 3).map((industry) => (
              <Badge key={industry.id} variant="primary">
                {industry.name}
              </Badge>
            ))}
            {mentor.can_help_with_detail.slice(0, 2).map((objective) => (
              <Badge key={objective.id}>
                {objective.name}
              </Badge>
            ))}
          </div>
          {mentor.user.bio && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              &ldquo;{mentor.user.bio}&rdquo;
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href={`/mentors/${mentor.id}`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View Profile &rarr;
        </Link>
      </div>
    </div>
  );
}
