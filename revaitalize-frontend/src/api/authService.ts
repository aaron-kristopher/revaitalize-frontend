import { type User } from './userService'; // We can reuse the User type

const API_BASE_URL = import.meta.env.VITE_API_URL;

// This interface describes the data we expect back from our login endpoint
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User; // It's good practice for the login to return the user object
}

/**
 * Logs in a user by sending their credentials to the /token endpoint.
 *
 * @param formData The form data containing the user's email and password.
 * @returns A Promise that resolves to the login response, including the token and user data.
 */
export const loginUser = async (formData: FormData): Promise<LoginResponse> => {
  // NOTE: Standard OAuth2 password flow uses form data, not JSON.
  const response = await fetch(`${API_BASE_URL}/token`, {
    method: 'POST',
    body: formData, // No JSON.stringify, no 'Content-Type' header
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed. Please check your credentials.');
  }

  return response.json();
};