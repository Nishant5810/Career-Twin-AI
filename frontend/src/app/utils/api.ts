const BASE_URL = "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  let token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An error occurred";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      // Use status text fallback
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    
    return request<any>("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });
  },

  register: async (email: string, password: string, fullName: string) => {
    return request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName })
    });
  },

  getCurrentUser: async () => {
    return request<any>("/auth/me");
  },

  // Insights Dashboard
  getDashboardData: async () => {
    return request<any>("/insights/dashboard");
  },

  // Resume Upload
  analyzeResume: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<any>("/resume/analyze", {
      method: "POST",
      body: formData
    });
  },

  // Digital Twin Simulation
  simulate: async (payload: {
    target_role: string;
    aws_learned: boolean;
    ml_projects_count: number;
    azure_certified: boolean;
  }) => {
    return request<any>("/insights/simulate", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  // Mentor Chat
  chat: async (message: string) => {
    return request<any>("/mentor/chat", {
      method: "POST",
      body: JSON.stringify({ message })
    });
  },

  // Roadmap Progress
  updateRoadmapWeek: async (weekId: number, status: string) => {
    return request<any>(`/insights/roadmap/week/${weekId}?status=${status}`, {
      method: "POST"
    });
  }
};
