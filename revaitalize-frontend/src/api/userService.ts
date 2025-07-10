// This file defines the functions that talk to your backend's "user" endpoints.

// First, we define the "shape" of the data. These are TypeScript interfaces
// that match your Pydantic schemas. This gives you type safety and autocompletion.

// This interface matches your `UserCreate` Pydantic schema.
export interface UserCreatePayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  age: number;
  address: string;
}

// This interface matches your `UserOut` Pydantic schema.
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  address: string;
  profile_picture_url?: string | null;
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

  // If the response is not "ok" (e.g., status 409, 422, 500),
  // we want to handle it as an error.
  if (!response.ok) {
    // We try to parse the error message from FastAPI's response.
    const errorData = await response.json();
    // FastAPI often puts the error message in a "detail" key.
    throw new Error(errorData.detail || 'An unknown error occurred.');
  }

  // If the response was successful, parse the JSON body and return it.
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

/**
 * Creates the initial onboarding data for a user.
 * Corresponds to `POST /users/{user_id}/onboarding`
 *
 * @param userId The ID of the user being onboarded.
 * @param onboardingData The questionnaire answers.
 * @returns The created onboarding data object.
 */
export const createUserOnboarding = async (userId: number, onboardingData: OnboardingCreatePayload): Promise<OnboardingData> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Auth header would go here if needed in the future
    },
    body: JSON.stringify(onboardingData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to submit onboarding data.');
  }

  return response.json();
};


/**
 * Creates a user problem area, linking it to an exercise.
 * Corresponds to `POST /users/{user_id}/problems`
 *
 * @param userId The ID of the user.
 * @param problemData The problem area selected.
 */
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

// This interface matches your SessionRequirementCreate Pydantic schema
export interface SessionRequirementCreatePayload {
  user_id: number;
  exercise_id: number;
  number_of_reps: number;
  number_of_sets: number;
}

/**
 * Creates the initial exercise parameters (reps/sets) for a user.
 * Corresponds to `POST /users/{user_id}/requirements`
 */
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

// --- ADD THIS BLOCK TO THE END OF userService.ts ---

// This interface matches your SessionRequirementOut Pydantic schema
export interface SessionRequirement {
  id: number;
  user_id: number;
  exercise_id: number;
  number_of_reps: number;
  number_of_sets: number;
}

/**
 * Fetches all exercise requirements (reps/sets) for a specific user.
 * Corresponds to `GET /users/{user_id}/requirements`
 */
export const getUserSessionRequirements = async (userId: number): Promise<SessionRequirement[]> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/requirements`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Auth header would likely be needed here in a real app
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

/**
 * Fetches a list of all available exercises.
 * Corresponds to `GET /exercises/all`
 */
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

// --- ADD THIS BLOCK TO THE END OF userService.ts ---

// These interfaces match your SessionOut Pydantic schema and its nested parts.
// We'll need them to understand the data we get back.

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
  datetime_start: string; // The datetime will come as a string in JSON
  datetime_end?: string | null;
  is_completed?: boolean | null;
  session_quality_score?: number | null;
  error_flag?: string | null;
  exercise_sets: ExerciseSet[];
}

export type TimeFilter = 'today' | 'yesterday' | 'this_week' | 'this_month';

/**
 * Fetches a user's session history based on a time filter.
 * Corresponds to `GET /users/{user_id}/sessions/{time_filter}`
 */
export const getUserSessionsByTime = async (userId: number, filter: TimeFilter): Promise<Session[]> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions/${filter}`, {
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
}

/**
 * Updates a user's profile information.
 * Corresponds to `PUT /users/{user_id}`
 */
export const updateUser = async (userId: number, userData: UserUpdatePayload): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // An auth token would be required here
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to update user profile.');
  }

  return response.json();
};

/**
 * Uploads a new profile picture for a user.
 * Corresponds to `POST /users/upload-profile-picture/{user_id}`
 */
export const uploadProfilePicture = async (userId: number, file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/users/upload-profile-picture/${userId}`, {
    method: 'POST',
    // For FormData, the browser sets the 'Content-Type' header automatically.
    // Do not set it manually.
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to upload profile picture.');
  }

  return response.json();
};

// --- Session Lifecycle API Functions ---

/**
 * Starts a new exercise session for a user.
 * Corresponds to `POST /users/{user-id}/sessions/start`
 * @returns The newly created Session object, including its ID.
 */
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

/**
 * Adds a new set to an existing session.
 * Corresponds to `POST /{user_id}/sessions/{session_id}/sets`
 * @returns The newly created ExerciseSet object.
 */
export const addSetToSession = async (userId: number, sessionId: number, setNumber: number) => {
  const payload = { set_number: setNumber };
  const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions/${sessionId}/sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to add set to session.');
  }
  return response.json();
};

/**
 * Adds a new repetition to an existing set.
 * Corresponds to `POST /{user_id}/sessions/{session_id}/sets/{set_id}/repetitions`
 */
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

/**
 * Ends an existing session, marking it as complete and saving the final score.
 * Corresponds to `PUT /{user-id}/sessions/{session_id}/end`
 */
export const endSession = async (userId: number, sessionId: number, finalScore: number) => {
  const payload = { is_completed: true, session_quality_score: finalScore };
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