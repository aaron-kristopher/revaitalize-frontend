import { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { updateUser, type UserUpdatePayload } from "@/shared/api/userService";

export const useProfile = () => {
	const { user, updateUserContext, logout } = useAuth();

	const [formData, setFormData] = useState<UserUpdatePayload>({
		first_name: "",
		last_name: "",
		email: "",
		age: 0,
		address: "",
		sex: "",
		contact_number: "",
	});

	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {

		if (user) {
			setFormData({
				first_name: user.first_name || "",
				last_name: user.last_name || "",
				email: user.email || "",
				age: user.age || 0,
				address: user.address || "",
				sex: user.sex || "",
				contact_number: user.contact_number || "",
			});
		};
	}, [user])

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData(prev => ({ ...prev, [id]: value }));
	}

	const handleSaveChanges = async () => {
		if (!user)
			return;

		setIsSaving(true);
		setSaveSuccess(false);
		setError(null);

		try {
			const payload: UserUpdatePayload = {
				...formData,
				age: formData.age ? Number(formData.age) : undefined
			}

			const updatedUser = await updateUser(user.id, payload);
			updateUserContext(updatedUser);

			setSaveSuccess(true);

		} catch (error: any) {
			console.error("Error updating profile: ", error)
			setError(error.message || "Failed to update profile.")
		} finally {
			setIsSaving(false);
		}
	};

	return {
		user,
		logout,
		formData,
		handleInputChange,
		isSaving,
		saveSuccess,
		error,
		handleSaveChanges,
	}
}
