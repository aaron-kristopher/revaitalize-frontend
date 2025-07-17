import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import {
  getUserSessionsByTimeRange,
  type Session,
  getExercises,
  type Exercise,
  type TimeFilter,
} from "@/api/userService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Edit3, Calendar, Download, Check, Loader2, TrendingUp, Activity } from "lucide-react";
import sidebarLogo from "@/assets/imgs/sidebar.png";


const InfoRow = ({ label, value }: { label: string | React.ReactNode; value: string | React.ReactNode }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-900 text-right">{value}</span>
  </div>
);

// Define the structure for our chart data
interface ChartData {
  date: string;
  score: number | null;
}

const DashboardPage = () => {
  const { setSidebarOpen } = useSidebar();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("this_week"); // Default to this_week for better chart view
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This effect fetches the list of all exercises once on mount
  useEffect(() => {
    const fetchAllExercises = async () => {
      try {
        const allExercises = await getExercises();
        setExercises(allExercises);
      } catch (err) {
        console.error("Failed to fetch exercises list", err);
      }
    };
    fetchAllExercises();
  }, []);

  // This effect fetches session data whenever the user or active tab changes
  useEffect(() => {
    if (user && activeTab) {
      const fetchSessionData = async () => {
        try {
          setIsLoadingData(true);
          const fetchedSessions = await getUserSessionsByTimeRange(user.id, activeTab as TimeFilter);
          setSessions(fetchedSessions);
          setError(null);
        } catch (err: any) {
          console.error("Failed to fetch session data:", err);
          setError(err.message);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchSessionData();
    }
  }, [user, activeTab]);

  // --- NEW: This effect transforms session data for the chart ---
  useEffect(() => {
    if (sessions.length > 0) {
      // Group sessions by date and calculate average score
      const dailyScores = sessions.reduce((acc, session) => {
        const date = new Date(session.datetime_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!acc[date]) {
          acc[date] = { scores: [], count: 0 };
        }
        if (session.session_quality_score !== null && session.session_quality_score !== undefined) {
          acc[date].scores.push(session.session_quality_score);
          acc[date].count++;
        }
        return acc;
      }, {} as Record<string, { scores: number[], count: number }>);

      const formattedData = Object.entries(dailyScores).map(([date, data]) => ({
        date,
        score: data.count > 0 ? Number((data.scores.reduce((a, b) => a + b, 0) / data.count).toFixed(2)) : null,

      }))

      console.log("format: ", formattedData);

      setChartData(formattedData);
    } else {
      setChartData([]);
    }
  }, [sessions]);


  const handleSaveChanges = () => {
    // This is placeholder logic, can be expanded later
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setEditMode(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 1500);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 md:px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen((prev) => !prev)} className="hover:bg-slate-100 hidden md:inline-flex">
              <img src={sidebarLogo} alt="Menu Icon" className="w-6 h-6" />
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbPage className="text-xl font-semibold text-slate-900">Home</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* We can hide the edit button for now as the chart is not editable */}
          {/* {editMode ? ( ... ) : ( ... )} */}
        </div>
      </header>

      <motion.div
        className="p-4 md:p-6 space-y-8"
        variants={pageVariants} initial="initial" animate="in" transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* General Information Column */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 mb-4">General Information</h2>
            <Card className="shadow-sm">
              <CardContent className="p-4 md:p-6 space-y-4">
                {user ? (
                  <>
                    <InfoRow label="First Name" value={user.first_name} /> <Separator />
                    <InfoRow label="Last Name" value={user.last_name} /> <Separator />
                    <InfoRow label="Age" value={String(user.age)} /> <Separator />
                    <InfoRow label="Sex" value={user.sex || 'Not provided'} /> <Separator />
                    <InfoRow label="Contact Number" value={user.contact_number || 'Not provided'} />  <Separator />
                    <InfoRow label="Email" value={user.email} /> <Separator />
                    <InfoRow label="Address" value={user.address || 'Not provided'} />
                  </>
                ) : (
                  <p className="text-slate-500">Loading user information...</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* --- NEW CHART SECTION --- */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Weekly Progress</h2>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Session Score Trend</CardTitle>
                <CardDescription>Average form quality score over the selected period.</CardDescription>
              </CardHeader>
              <CardContent className="h-80 pr-2">
                {chartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255, 255, 255, 0.9)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#0096C7" strokeWidth={2} activeDot={{ r: 8 }} name="Avg. Score" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                    <Activity className="w-12 h-12 mb-4 text-slate-400" />
                    <p className="font-semibold">Not Enough Data to Display Chart</p>
                    <p className="text-sm">Complete at least two sessions to see your progress.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-xl font-bold text-slate-800">Session History</h2>
            <div className="flex items-center gap-4">
              <TabsList>
                <TabsTrigger value="this_week">This Week</TabsTrigger>
                <TabsTrigger value="this_month">This Month</TabsTrigger>
                <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
              </TabsList>
              <Button variant="outline" className="text-slate-600 border-slate-300 hover:bg-slate-100">
                <Download className="w-4 h-4 mr-2" /> Download Progress
              </Button>
            </div>
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <TabsContent value={activeTab} className="mt-0">
              <div className="border border-slate-200 rounded-lg bg-white">
                <div className="hidden md:grid md:grid-cols-4 gap-4 text-xs font-medium text-slate-500 uppercase tracking-wide p-4 bg-slate-100 rounded-t-lg">
                  <div>Date</div>
                  <div>Exercise</div>
                  <div>Score</div>
                  <div>Performance</div>
                </div>
                <div className="divide-y divide-slate-200 md:divide-y-0">
                  {isLoadingData && <div className="p-8 text-center text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
                    Loading sessions...
                  </div>}
                  {error && <p className="p-4 text-center text-red-500">Error: {error}</p>}

                  {!isLoadingData && !error && sessions.map((session) => {
                    const exerciseName = exercises.find(ex => ex.id === session.exercise_id)?.name || 'Unknown Exercise';
                    const sessionDate = new Date(session.datetime_start).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    });

                    const score = session.session_quality_score || 0;
                    let rate = "Needs Improvement";
                    let status: "success" | "warning" | "destructive" = "destructive";
                    if (score >= 90) { rate = "Excellent"; status = "success"; }
                    else if (score >= 75) { rate = "Good"; status = "warning"; }

                    return (
                      <div key={session.id} className="p-4 md:grid md:grid-cols-4 md:gap-4 md:items-center">
                        {/* Mobile View */}
                        <div className="md:hidden">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-slate-800">{exerciseName}</span>
                            <span className="font-bold text-blue-600">{score.toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-slate-500">
                            <span>{sessionDate}</span>
                            <Badge variant={status}>
                              {rate}
                            </Badge>
                          </div>
                        </div>
                        {/* Desktop View */}
                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-700">
                          <Calendar className="w-4 h-4 text-slate-400" /> <span>{sessionDate}</span>
                        </div>
                        <div className="hidden md:block text-sm text-slate-600">{exerciseName}</div>
                        <div className="hidden md:block text-sm font-medium text-slate-900">{score.toFixed(0)}%</div>
                        <div className="hidden md:block text-sm text-slate-600">
                          <Badge variant={status}>
                            {rate}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}

                  {!isLoadingData && !error && sessions.length === 0 && (
                    <div className="text-center p-12">No sessions recorded for this period.</div>
                  )}
                </div>
              </div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
