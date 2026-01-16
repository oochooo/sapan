import Link from 'next/link';
import type { FounderProfile } from '@/types';
import Badge from './Badge';
import { User } from 'lucide-react';

interface FounderCardProps {
  founder: FounderProfile;
}

export default function FounderCard({ founder }: FounderCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {founder.user.profile_photo ? (
            <img
              src={founder.user.profile_photo}
              alt={`${founder.user.first_name} ${founder.user.last_name}`}
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
            {founder.user.first_name} {founder.user.last_name}
          </h3>
          <p className="text-sm text-gray-600">
            Founder @ {founder.startup_name}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {founder.industry_detail && (
              <Badge variant="primary">{founder.industry_detail.name}</Badge>
            )}
            <Badge>{founder.stage_display}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {founder.objectives_detail.slice(0, 3).map((objective) => (
              <Badge key={objective.id} variant="default">
                {objective.name}
              </Badge>
            ))}
          </div>
          {founder.about_startup && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {founder.about_startup}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href={`/founders/${founder.id}`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View Profile &rarr;
        </Link>
      </div>
    </div>
  );
}
