import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/shared/context/AuthContext"
import {
  getUserSessionsByTimeRange,
  getExercises,
  type Session,
  type Exercise,
  type TimeFilter,
} from "@/shared/api/userService"

interface ChartData {
  date: string;
  score: number | null;
}

export const useDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TimeFilter>("this_week");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user)
      return;

    const fetchDashboardData = async () => {

      try {
        setIsLoading(true);
        setError(null);

        const [fetchedSessions, fetchedExercises] = await Promise.all([
          getUserSessionsByTimeRange(user.id, activeTab),
          getExercises()
        ]);

        const sortedSessions = fetchedSessions.sort((a, b) =>
          new Date(b.datetime_start).getTime() - new Date(a.datetime_start).getTime()
        );

        setSessions(sortedSessions);
        setExercises(fetchedExercises);

      } catch (error: any) {
        console.error("Failed to fetch dashboard data: ", error);
        setError(error.message || "Could not load data");

      } finally {
        setIsLoading(false);
      };
    }

    fetchDashboardData();
  }, [user, activeTab]);

  const chartData = useMemo<ChartData[]>(() => {
    if (sessions.length === 0)
      return [];

    const dailyScores = sessions.reduce((acc, session) => {
      const date = new Date(session.datetime_start).toLocaleDateString("en-US", { month: "short", day: "numeric" });

      if (!acc[date])
        acc[date] = { scores: [], count: 0 }

      if (session.session_quality_score != null) {
        acc[date].scores.push(session.session_quality_score);
        acc[date].count++;
      }

      return acc;
    }, {} as Record<string, { scores: number[], count: number }>);

    return Object.entries(dailyScores).map(([date, data]) => ({
      date,
      score: data.count > 0 ? Number((data.scores.reduce((a, b) => a + b, 0) / data.count).toFixed(2)) : null,
    })).reverse();
  }, [sessions]);

  const handleSelectSession = (session: Session) => {
    setSelectedSession(session);
    console.log(session);
    setIsModalOpen(true);
  }

  return {
    user,
    sessions,
    exercises,
    chartData,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    selectedSession,
    handleSelectSession,
  }
}


