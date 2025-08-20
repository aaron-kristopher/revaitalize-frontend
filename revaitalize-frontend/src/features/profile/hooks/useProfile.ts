import { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { updateUser, type UserUpdatePayload, changeUserPassword} from "@/shared/api/userService";


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

	const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

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

	const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPasswordData(prev => ({ ...prev, [id]: value }));
    };

    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters long.");
            return;
        }
        if (!user) {
            setPasswordError("User not found.");
            return;
        }

        setIsUpdatingPassword(true);
        setPasswordError(null);
        setPasswordUpdateSuccess(false);

        try {
            await changeUserPassword(user.id, {
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
            });
            setPasswordUpdateSuccess(true);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setPasswordError(err.message);
        } finally {
            setIsUpdatingPassword(false);
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

		passwordData,
        handlePasswordInputChange,
        handleUpdatePassword,
        isUpdatingPassword,
        passwordUpdateSuccess,
        passwordError,
	}
}
