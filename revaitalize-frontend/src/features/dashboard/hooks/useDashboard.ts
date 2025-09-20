import { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable'; // <-- CHANGE THE IMPORT

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
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

  const [isDownloading, setIsDownloading] = useState<boolean>(false);

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

  const handleDownloadReport = async () => {
    if (!user || sessions.length === 0) {
      alert("No data available to generate a report.");
      return;
    }

    setIsDownloading(true);

    try {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.text("Exercise Progress Report", 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Patient: ${user.first_name} ${user.last_name}`, 14, 35);
      
      const filterText = activeTab.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      doc.text(`Period: ${filterText}`, 14, 42);
      doc.line(14, 45, 196, 45); 

      const totalScore = chartData.reduce((sum, data) => sum + (data.score || 0), 0);
      const averageScore = chartData.length > 0 ? (totalScore / chartData.length).toFixed(1) : "0.0";
      doc.setFontSize(16);
      doc.text("Performance Summary", 14, 55);
      doc.setFontSize(12);
      doc.text(`- Total Sessions Completed: ${sessions.length}`, 14, 62);
      doc.text(`- Average Session Score: ${averageScore}%`, 14, 69);

      const chartElement = document.querySelector<HTMLElement>('.recharts-responsive-container');

      if (chartElement) {
        doc.addPage();
        const canvas = await html2canvas(chartElement);
        const chartImage = canvas.toDataURL('image/png');
        
        doc.setFontSize(16);
        doc.text("Session Score Trend", 14, 20);
        
        const aspectRatio = canvas.width / canvas.height;
        const pdfImageWidth = 180;
        const pdfImageHeight = pdfImageWidth / aspectRatio;
        doc.addImage(chartImage, 'PNG', 14, 30, pdfImageWidth, pdfImageHeight);
      }

      for (const session of sessions) {
        doc.addPage();
        const exerciseName = exercises.find(ex => ex.id === session.exercise_id)?.name || 'Unknown Exercise';
        const sessionDate = new Date(session.datetime_start);
        
        // Session Header
        doc.setFontSize(18);
        doc.text(`Session Detail: ${exerciseName}`, 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(sessionDate.toLocaleString(), 14, 26);
        doc.line(14, 30, 196, 30);

        // Session Quick Info
        const score = (session.session_quality_score || 0).toFixed(1) + '%';
        const endDate = session.datetime_end ? new Date(session.datetime_end) : sessionDate;
        const duration = session.datetime_end ? `${Math.round((endDate.getTime() - sessionDate.getTime()) / 60000)} mins` : 'N/A';
        const status = session.is_completed ? 'Complete' : 'In Progress';
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Overall Score: ${score}`, 14, 40);
        doc.text(`Duration: ${duration}`, 80, 40);
        doc.text(`Status: ${status}`, 150, 40);

        doc.setFontSize(16);
        doc.text("Sets Information", 14, 55);
        let lastY = 55;

        if (!session.exercise_sets || session.exercise_sets.length === 0) {
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text("No sets were recorded for this session.", 14, lastY + 10);
        } else {
            for (const set of session.exercise_sets) {
                const reps = set.repetitions || [];
                const estimatedTableHeight = (reps.length > 0 ? reps.length + 1 : 1) * 10;
                
                if (lastY + estimatedTableHeight > 280) {
                    doc.addPage();
                    lastY = 20;
                }
                
                doc.setFontSize(14);
                doc.text(`Set ${set.set_number}`, 14, lastY + 15);
                lastY += 15;

                if (reps.length > 0) {
                    const repTableBody = reps.map(rep => [
                        `Rep ${rep.rep_number}`,
                        (rep.rep_quality_score || 0).toFixed(1) + '%',
                        rep.error_flag || 'No Error'
                    ]);

                    autoTable(doc, {
                      head: [['Repetition', 'Score', 'Error']],
                      body: repTableBody,
                      startY: lastY + 2,
                      theme: 'grid',
                      headStyles: { fillColor: [74, 85, 104] },
                    });
                    lastY = (doc as any).lastAutoTable.finalY;

                } else {
                     doc.setFontSize(12);
                     doc.setTextColor(100);
                     doc.text("No repetitions were recorded for this set.", 20, lastY + 5);
                     lastY += 10; 
                }
            }
        }
      }

      const userName = `${user.first_name}_${user.last_name}`.replace(/\s+/g, '_');
      const today = new Date().toISOString().slice(0, 10); 
      const fileName = `${userName}_Progress_Report_${today}.pdf`;

      doc.save(fileName);

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Sorry, there was an error creating your report.");
    } finally {
      setIsDownloading(false);
    }
  };

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
    isDownloading, 
    handleDownloadReport,
  }
}


