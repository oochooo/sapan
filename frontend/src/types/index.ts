export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'founder' | 'mentor';
  profile_photo: string | null;
  bio: string | null;
  is_approved: boolean;
  has_profile: boolean;
  created_at: string;
  updated_at: string;
}

export interface IndustrySubcategory {
  id: number;
  name: string;
  slug: string;
}

export interface IndustryCategory {
  id: number;
  name: string;
  slug: string;
  subcategories: IndustrySubcategory[];
}

export interface Objective {
  id: number;
  name: string;
  slug: string;
  category: 'fundraising' | 'operations';
}

export interface Stage {
  value: string;
  label: string;
}

export interface FounderProfile {
  id: number;
  user: User;
  startup_name: string;
  industry: number;
  industry_detail: IndustrySubcategory;
  stage: string;
  stage_display: string;
  objectives: number[];
  objectives_detail: Objective[];
  about_startup: string;
  created_at: string;
  updated_at: string;
}

export interface MentorProfile {
  id: number;
  user: User;
  company: string;
  role: string;
  years_of_experience: number;
  expertise_industries: number[];
  expertise_industries_detail: IndustrySubcategory[];
  can_help_with: number[];
  can_help_with_detail: Objective[];
  is_connected?: boolean;
  connection_status?: 'pending' | 'accepted' | 'declined' | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectionRequest {
  id: number;
  from_user: number;
  from_user_detail: UserWithProfile;
  to_user: number;
  to_user_detail: UserWithProfile;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  responded_at: string | null;
}

export interface UserWithProfile extends User {
  profile: {
    startup_name?: string;
    stage?: string;
    industry?: string;
    company?: string;
    role?: string;
    years_of_experience?: number;
  } | null;
  profile_id: number | null;
}

export interface Connection {
  id: number;
  connected_user: UserWithProfile;
  connected_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
