import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { getExercises, getUserSessionRequirements, type SessionRequirement } from '@/shared/api/userService';

export const useSessionSetup = () => {
  const { requirementId } = useParams<{ requirementId: string }>();
  const { user } = useAuth();

  const [activeRequirement, setActiveRequirement] = useState<SessionRequirement | null>(null);
  const [exerciseName, setExerciseName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user || !requirementId) return;

      try {
        setIsLoading(true);
        const [requirements, exercises] = await Promise.all([
          getUserSessionRequirements(user.id),
          getExercises()
        ]);
        const req = requirements.find(r => r.id === parseInt(requirementId, 10));
        if (!req) throw new Error("Session requirement not found for this user.");
        const exercise = exercises.find(ex => ex.id === req.exercise_id);
        if (!exercise) throw new Error(`Exercise with ID ${req.exercise_id} not found.`);

        setExerciseName(exercise.name);
        setActiveRequirement(req);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load session details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessionData();
  }, [user, requirementId]);

  return { isLoading, error, activeRequirement, exerciseName };
};
