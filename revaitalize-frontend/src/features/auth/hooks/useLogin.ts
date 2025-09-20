import { loginUser } from "@/shared/api/authService";
import { useAuth } from "@/shared/context/AuthContext"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface loginPayload {
	email: string,
	password: string,
}

export const useLogin = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	const [loginData, setLoginData] = useState<loginPayload>({ email: "", password: "" })
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleLogin = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append("username", loginData.email);
			formData.append("password", loginData.password);

			const data = await loginUser(formData);
			login(data.user, data.access_token);

			navigate("/app");

		} catch (error: any) {
			setError(error.message || "An unexpected error occured.")

		} finally {
			setIsLoading(false);
		}
	}

	return { loginData, setLoginData, error, isLoading, handleLogin }

}
