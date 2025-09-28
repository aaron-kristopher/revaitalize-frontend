import { loginUser } from "@/shared/api/authService"
import { createUser, type UserCreatePayload } from "@/shared/api/userService"
import { useAuth } from "@/shared/context/AuthContext"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const UserPayload: UserCreatePayload = {
	first_name: "",
	last_name: "",
	email: "",
	password: "",
	age: 0,
	address: "",
	sex: "",
	contact_number: "",
}


export const useSignup = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	const [userData, setUserData] = useState<UserCreatePayload>(UserPayload);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleSignup = async (event: React.FormEvent) => {
		event.preventDefault();

		if (userData.age <= 0) {
			setError("Please enter a valid age.");
			return;
		}

		if (userData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

		setIsLoading(true);
		setError(null);

		try {
			const newUser = await createUser(userData);
			const formData = new FormData();

			formData.append("username", userData.email);
			formData.append("password", userData.password);

			const data = await loginUser(formData)

			if (data.user && data.access_token) {
				login(data.user, data.access_token)

				setUserData({
					first_name: "",
					last_name: "",
					email: "",
					password: "",
					age: 0,
					address: "",
					sex: "",
					contact_number: "",
				})

				alert("Account created successfully! Proceeding to onboarding.");
				navigate(`/onboarding/${newUser.id}`);

			} else {
				throw new Error("User was created, but no token was returned by the server.")
			}
		}
		catch (error: any) {
			setError(error.message || "An unexpected error occurred.");
		} finally {
			setIsLoading(false);
		}
	}

	return { userData, setUserData, error, isLoading, handleSignup }

}
