export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: "founder" | "mentor" | "";
  profile_photo: string | null;
  bio: string | null;
  is_approved: boolean;
  has_profile: boolean;
  is_profile_complete: boolean;
  avatar_url: string | null;
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
  category: "fundraising" | "operations";
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
  is_connected?: boolean;
  connection_status?: "pending" | "accepted" | "declined" | null;
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
  connection_status?: "pending" | "accepted" | "declined" | null;
  created_at: string;
  updated_at: string;
}

export type ConnectionIntent = "mentor_me" | "collaborate" | "peer_network";

export interface ConnectionRequest {
  id: number;
  from_user: number;
  from_user_detail: UserWithProfile;
  to_user: number;
  to_user_detail: UserWithProfile;
  message: string | null;
  intent: ConnectionIntent;
  intent_display: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  responded_at: string | null;
}

// Townhall feed types (auth-aware)
export interface TownhallUserAnonymous {
  type: "founder" | "mentor";
  description: string;
}

export interface TownhallUserAuthenticated {
  id: number;
  first_name: string;
  last_name: string;
  user_type: "founder" | "mentor";
  startup_name?: string;
  industry?: string;
  company?: string;
  role?: string;
  profile_id?: number;
}

export type TownhallUser = TownhallUserAnonymous | TownhallUserAuthenticated;

export interface TownhallConnection {
  id: number;
  from_user_detail: TownhallUser;
  to_user_detail: TownhallUser;
  connected_at: string;
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

// Office Hours types
export interface CalendarStatus {
  is_connected: boolean;
  expires_at?: string;
  created_at?: string;
}

export interface AvailabilityRule {
  id: number;
  weekday: number;
  weekday_display: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export type BookingStatus =
  | "confirmed"
  | "cancelled_by_founder"
  | "cancelled_by_mentor"
  | "completed";

export interface BookingUser {
  id: number;
  email: string;
  full_name: string;
  profile_photo: string | null;
  avatar_url: string | null;
}

export interface Booking {
  id: number;
  mentor: number;
  founder: number;
  mentor_info: BookingUser;
  founder_info: BookingUser;
  start_time: string;
  end_time: string;
  agenda: string;
  google_meet_link: string;
  status: BookingStatus;
  status_display: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}
