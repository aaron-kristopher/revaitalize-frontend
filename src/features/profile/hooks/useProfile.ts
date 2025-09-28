import { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { 
  updateUser, 
  type UserUpdatePayload, 
  changeUserPassword,
  getUserProfile,
  updateCustomScheduleDays,
  type UpdateCustomScheduleDaysPayload
} from "@/shared/api/userService";
import { SCHEDULE_CONFIG } from "@/shared/config/scheduling";

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

  // Schedule-related state
  const [scheduleData, setScheduleData] = useState({
    preferred_schedule: 3,
    custom_allowed_days: [] as number[]
  });

	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

  // Schedule-specific states
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState<boolean>(false);
  const [scheduleUpdateSuccess, setScheduleUpdateSuccess] = useState<boolean>(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

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

      // Load schedule data from user profile
      const onboardingData = user.onboarding_data;
      if (onboardingData) {
        const preferredSchedule = onboardingData.preferred_schedule || 3;
        const customDays = onboardingData.custom_allowed_days;
        
        // Use custom days if they exist and are valid, otherwise use default
        const defaultDays = SCHEDULE_CONFIG[preferredSchedule as keyof typeof SCHEDULE_CONFIG]?.allowedDays || [];
        
        setScheduleData({
          preferred_schedule: preferredSchedule,
          custom_allowed_days: (customDays && customDays.length === preferredSchedule) ? customDays : defaultDays
        });
      }
    }
  }, [user]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCustomDaysChange = (days: number[]) => {
    setScheduleData(prev => ({ ...prev, custom_allowed_days: days }));
  };

  const handleSaveSchedule = async () => {
    if (!user) return;

    const { preferred_schedule, custom_allowed_days } = scheduleData;
    
    // Validate that we have exactly the right number of days
    if (custom_allowed_days.length !== preferred_schedule) {
      setScheduleError(`Please select exactly ${preferred_schedule} days for your schedule.`);
      return;
    }

    setIsUpdatingSchedule(true);
    setScheduleUpdateSuccess(false);
    setScheduleError(null);

    try {
      const payload: UpdateCustomScheduleDaysPayload = {
        custom_allowed_days
      };
      
      await updateCustomScheduleDays(user.id, payload);
      
      // Refresh user profile to get updated data
      const updatedProfile = await getUserProfile(user.id);
      updateUserContext(updatedProfile);
      
      setScheduleUpdateSuccess(true);
      
      // Reset success state after a delay
      setTimeout(() => setScheduleUpdateSuccess(false), 3000);
      
    } catch (error: any) {
      console.error("Error updating schedule:", error);
      setScheduleError(error.message || "Failed to update schedule.");
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

	const handleSaveChanges = async () => {
    if (!user) return;

		setIsSaving(true);
		setSaveSuccess(false);
		setError(null);

		try {
			const payload: UserUpdatePayload = {
				...formData,
				age: formData.age ? Number(formData.age) : undefined
      };

			const updatedUser = await updateUser(user.id, payload);
			updateUserContext(updatedUser);

			setSaveSuccess(true);

		} catch (error: any) {
      console.error("Error updating profile: ", error);
      setError(error.message || "Failed to update profile.");
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

    // Schedule-related returns
    scheduleData,
    handleCustomDaysChange,
    handleSaveSchedule,
    isUpdatingSchedule,
    scheduleUpdateSuccess,
    scheduleError,

		passwordData,
        handlePasswordInputChange,
        handleUpdatePassword,
        isUpdatingPassword,
        passwordUpdateSuccess,
        passwordError,
  };
};
