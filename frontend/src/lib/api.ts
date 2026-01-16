import axios from "axios";
import type {
  User,
  AuthTokens,
  IndustryCategory,
  Objective,
  Stage,
  FounderProfile,
  MentorProfile,
  ConnectionRequest,
  ConnectionIntent,
  Connection,
  TownhallConnection,
  PaginatedResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const tokens = localStorage.getItem("tokens");
    if (tokens) {
      const { access } = JSON.parse(tokens);
      config.headers.Authorization = `Bearer ${access}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = localStorage.getItem("tokens");
        if (tokens) {
          const { refresh } = JSON.parse(tokens);
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh,
          });
          const newTokens = { access: response.data.access, refresh };
          localStorage.setItem("tokens", JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem("tokens");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  loginWithGoogle: async (
    code: string,
  ): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post("/auth/google/", { code });
    return response.data;
  },

  loginWithLine: async (
    code: string,
  ): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post("/auth/line/", { code });
    return response.data;
  },

  completeProfile: async (
    userType: "founder" | "mentor",
  ): Promise<{ user: User }> => {
    const response = await api.post("/auth/complete-profile/", {
      user_type: userType,
    });
    return response.data;
  },

  logout: async (refresh: string): Promise<void> => {
    await api.post("/auth/logout/", { refresh });
  },

  getMe: async (): Promise<User> => {
    const response = await api.get("/auth/me/");
    return response.data;
  },

  updateMe: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch("/auth/me/", data);
    return response.data;
  },
};

// Reference Data
export const referenceApi = {
  getIndustries: async (): Promise<IndustryCategory[]> => {
    const response = await api.get("/industries/");
    return response.data;
  },

  getObjectives: async (): Promise<Objective[]> => {
    const response = await api.get("/objectives/");
    return response.data;
  },

  getStages: async (): Promise<Stage[]> => {
    const response = await api.get("/stages/");
    return response.data;
  },
};

// Profiles
export const profileApi = {
  getFounderProfile: async (): Promise<FounderProfile> => {
    const response = await api.get("/profiles/founder/");
    return response.data;
  },

  createFounderProfile: async (data: {
    startup_name: string;
    industry: number;
    stage: string;
    objectives: number[];
    about_startup: string;
  }): Promise<FounderProfile> => {
    const response = await api.post("/profiles/founder/create/", data);
    return response.data;
  },

  updateFounderProfile: async (
    data: Partial<FounderProfile>,
  ): Promise<FounderProfile> => {
    const response = await api.put("/profiles/founder/", data);
    return response.data;
  },

  getMentorProfile: async (): Promise<MentorProfile> => {
    const response = await api.get("/profiles/mentor/");
    return response.data;
  },

  createMentorProfile: async (data: {
    company: string;
    role: string;
    years_of_experience: number;
    expertise_industries: number[];
    can_help_with: number[];
  }): Promise<MentorProfile> => {
    const response = await api.post("/profiles/mentor/create/", data);
    return response.data;
  },

  updateMentorProfile: async (
    data: Partial<MentorProfile>,
  ): Promise<MentorProfile> => {
    const response = await api.put("/profiles/mentor/", data);
    return response.data;
  },
};

// Discovery
export const discoveryApi = {
  getMentors: async (params?: {
    expertise_industries__slug?: string;
    can_help_with__slug?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<MentorProfile>> => {
    const response = await api.get("/profiles/mentors/", { params });
    return response.data;
  },

  getMentor: async (id: number): Promise<MentorProfile> => {
    const response = await api.get(`/profiles/mentors/${id}/`);
    return response.data;
  },

  getFounders: async (params?: {
    industry__slug?: string;
    stage?: string;
    objectives__slug?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<FounderProfile>> => {
    const response = await api.get("/profiles/founders/", { params });
    return response.data;
  },

  getFounder: async (id: number): Promise<FounderProfile> => {
    const response = await api.get(`/profiles/founders/${id}/`);
    return response.data;
  },
};

// Connections
export const connectionApi = {
  getConnections: async (): Promise<PaginatedResponse<Connection>> => {
    const response = await api.get("/connections/");
    return response.data;
  },

  getRecentConnections: async (): Promise<TownhallConnection[]> => {
    const response = await api.get("/connections/recent/");
    return response.data;
  },

  getSentRequests: async (): Promise<PaginatedResponse<ConnectionRequest>> => {
    const response = await api.get("/connections/requests/sent/");
    return response.data;
  },

  getReceivedRequests: async (): Promise<
    PaginatedResponse<ConnectionRequest>
  > => {
    const response = await api.get("/connections/requests/received/");
    return response.data;
  },

  sendRequest: async (
    toUser: number,
    message?: string,
    intent: ConnectionIntent = "peer_network",
  ): Promise<ConnectionRequest> => {
    const response = await api.post("/connections/request/", {
      to_user: toUser,
      message,
      intent,
    });
    return response.data;
  },

  acceptRequest: async (id: number): Promise<ConnectionRequest> => {
    const response = await api.post(`/connections/request/${id}/accept/`);
    return response.data;
  },

  declineRequest: async (id: number): Promise<ConnectionRequest> => {
    const response = await api.post(`/connections/request/${id}/decline/`);
    return response.data;
  },
};

export default api;
