export interface UserCreatePayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  age: number;
  address: string;
  sex: string;
  contact_number: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  address: string;
  sex: string;
  contact_number: string
  profile_picture_url?: string | null;
  onboarding_data?: OnboardingData | null; // Added for fetching preferred_schedule
}

// Get the backend URL from the .env.local file you created.
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Sends user registration data to the backend API.
 * This corresponds to your `POST /users/create` endpoint.
 *
 * @param userData The user's details, matching the UserCreatePayload interface.
 * @returns A Promise that resolves to the newly created User object.
 * @throws An Error if the API responds with a non-2xx status code.
 */
export const createUser = async (userData: UserCreatePayload): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'An unknown error occurred.');
  }

  return response.json();
};

export interface OnboardingCreatePayload {
  primary_goal: string;
  pain_score: number;
  preferred_schedule: number; // e.g., 2, 3, or 5 for times per week
}

export interface UserProblemCreatePayload {
  problem_area: string;
}

export interface OnboardingData extends OnboardingCreatePayload {
  id: number;
  user_id: number;
}


// --- Onboarding and User Problem API Functions ---

export const createUserOnboarding = async (userId: number, onboardingData: OnboardingCreatePayload): Promise<OnboardingData> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(onboardingData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to submit onboarding data.');
  }

  return response.json();
};

export const createUserProblem = async (userId: number, problemData: UserProblemCreatePayload) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/problems`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(problemData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to add problem area.');
  }

  return response.json();
};

export interface SessionRequirementCreatePayload {
  user_id: number;
  exercise_id: number;
  number_of_reps: number;
  number_of_sets: number;
}

export const createSessionRequirement = async (userId: number, payload: SessionRequirementCreatePayload) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/requirements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to create session requirement.');
  }

  return response.json();
};

export interface SessionRequirement {
  id: number;
  user_id: number;
  exercise_id: number;
  number_of_reps: number;
  number_of_sets: number;
}

export const getUserSessionRequirements = async (userId: number): Promise<SessionRequirement[]> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/requirements`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch session requirements.');
  }

  return response.json();
};

export interface Exercise {
  id: number;
  name: string;
}

export const getExercises = async (): Promise<Exercise[]> => {
  const response = await fetch(`${API_BASE_URL}/exercises/all`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch exercises.');
  }

  return response.json();
};

export interface Repetition {
  id: number;
  set_id: number;
  rep_number: number;
  rep_quality_score?: number | null;
  error_flag?: string | null;
  is_completed: boolean;
}

export interface ExerciseSet {
  id: number;
  session_id: number;
  set_number: number;
  set_quality_score?: number | null;
  is_completed?: boolean | null;
  error_flag?: string | null;
  repetitions: Repetition[];
}

export interface Session {
  id: number;
  user_id: number;
  exercise_id: number;
  datetime_start: string;
  datetime_end?: string | null;
  is_completed?: boolean | null;
  session_quality_score?: number | null;
  error_flag?: string | null;
  exercise_sets: ExerciseSet[];
}

export type TimeFilter = 'today' | 'yesterday' | 'this_week' | 'this_month';

// RENAMED for clarity
export const getUserSessionsByTimeRange = async (userId: number, filter: TimeFilter): Promise<Session[]> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions/filter/${filter}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to fetch sessions for filter: ${filter}`);
  }

  return response.json();
};

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  age?: number;
  address?: string;
  sex?: string;
  contact_number?: string;
}

export const updateUser = async (userId: number, userData: UserUpdatePayload): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to update user profile.');
  }

  return response.json();
};

export const uploadProfilePicture = async (userId: number, file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/users/upload-profile-picture/${userId}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to upload profile picture.');
  }

  return response.json();
};

// --- Session Lifecycle API Functions ---

export const startSession = async (userId: number, exerciseId: number): Promise<Session> => {
  const payload = { user_id: userId, exercise_id: exerciseId };
  const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to start session.');
  }
  return response.json();
};

// UPDATED to accept a payload object
export const addSetToSession = async (userId: number, sessionId: number, setData: { set_number: number }) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions/${sessionId}/sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(setData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to add set to session.');
  }
  return response.json();
};

export const addRepToSet = async (userId: number, sessionId: number, setId: number, repData: { rep_number: number, rep_quality_score?: number }) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions/${sessionId}/sets/${setId}/repetitions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(repData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to add repetition.');
  }
  return response.json();
};

export const endSession = async (userId: number, sessionId: number, finalScore: number) => {
  const payload = { is_completed: true, session_quality_score: finalScore, error_flag: "pending" };
  const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions/${sessionId}/end`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to end session.');
  }
  return response.json();
};


/**
 * Fetches the full user profile, which should include nested onboarding data.
 * Corresponds to `GET /users/{user_id}`
 */
export const getUserProfile = async (userId: number): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch user profile.');
  }

  return response.json();
};


/**
 * Updates a user's session requirement (progression).
 * Corresponds to `PUT /users/{user_id}/requirements/{requirement_id}`
 */
export const updateSessionRequirement = async (
  userId: number,
  requirementId: number,
  updateData: { number_of_reps?: number; number_of_sets?: number }
): Promise<SessionRequirement> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/requirements/${requirementId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to update session requirement.');
  }
  return response.json();
};

export const getUserMe = async (token: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch user data with token");
  }

  return response.json();
}
