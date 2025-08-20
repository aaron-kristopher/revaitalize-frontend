import { motion } from "framer-motion";

import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Calendar, Download, Loader2, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/shared/components/ui/breadcrumb";

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

import sidebarLogo from "@/assets/imgs/sidebar.png";
import { useSidebar } from "@/shared/context/SidebarContext";
import { SessionDetailDialog } from "./components/SessionDetailDialog";
import { useDashboard } from "./hooks/useDashboard";
import {
  type TimeFilter,
} from "@/shared/api/userService";


const InfoRow = ({ label, value }: { label: string | React.ReactNode; value: string | React.ReactNode }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-900 text-right">{value}</span>
  </div>
);

const DashboardPage = () => {
  const { setSidebarOpen } = useSidebar();
  const {
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
  } = useDashboard();

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
  };

  const getExerciseName = (exerciseId: number) => {
    return exercises.find(ex => ex.id === exerciseId)?.name || 'Unknown Exercise';
  };

  return (
    <>
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 md:px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="hover:bg-slate-100 inline-flex"
            >
              <img src={sidebarLogo} alt="Menu Icon" className="w-6 h-6" />
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xl font-semibold text-slate-900">Home</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

      <div className="flex-1 bg-slate-50 h-full">
        <SessionDetailDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          session={selectedSession}
          exerciseName={selectedSession ? getExerciseName(selectedSession.exercise_id) : ""}
        />

        <motion.div
          className="p-4 md:p-6 space-y-8"
          variants={pageVariants}
          initial="initial"
          animate="in"
          transition={{ duration: 0.5 }}
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

            {/* Weekly Progress Column */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Weekly Progress</h2>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Session Score Trend
                  </CardTitle>
                  <CardDescription>Average form quality score over the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="h-80 pr-2">
                  {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                        <Tooltip contentStyle={{
                          background: "rgba(255, 255, 255, 0.9)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                        }} />
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

          <div className="space-y-6" data-id={Math.random()}>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TimeFilter)}>
              {/* Header Section */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold text-foreground">Session History</h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <TabsList className="h-10">
                    <TabsTrigger value="all_time">All Time</TabsTrigger>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                    <TabsTrigger value="this_week">This Week</TabsTrigger>
                    <TabsTrigger value="this_month">This Month</TabsTrigger>
                  </TabsList>
                  <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={handleDownloadReport}
                      disabled={isDownloading || isLoading || sessions.length === 0}
                  >
                      {isDownloading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                          <Download className="w-4 h-4 mr-2" />
                      )}
                      {isDownloading ? 'Preparing Report...' : 'Download Report'}
                  </Button>
                </div>
              </div>

              {/* Animated Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value={activeTab} className="mt-4">
                  <div className="rounded-lg border bg-card">
                    {/* Table Header */}
                    <div className="hidden md:grid md:grid-cols-5 gap-4 p-4 bg-muted rounded-t-lg">
                      <div className="text-sm font-medium text-muted-foreground">Actions</div>
                      <div className="text-sm font-medium text-muted-foreground">Date</div>
                      <div className="text-sm font-medium text-muted-foreground">Exercise</div>
                      <div className="text-sm font-medium text-muted-foreground">Score</div>
                      <div className="text-sm font-medium text-muted-foreground">Performance</div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Loading sessions...</p>
                      </div>
                    )}

                    {/* Error State */}
                    {error && (
                      <div className="p-8 text-center">
                        <p className="text-destructive">{error}</p>
                      </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && sessions.length === 0 && (
                      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <p className="mb-2">No sessions recorded for this period</p>
                      </div>
                    )}

                    {/* Session List */}
                    {!isLoading && !error && sessions.length > 0 && (
                      <div className="divide-y">
                        {sessions.map((session) => {
                          const exerciseName =
                            exercises.find((ex) => ex.id === session.exercise_id)?.name || 'Unknown Exercise';
                          const sessionDate = new Date(session.datetime_start).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          });

                          const score = session.session_quality_score || 0;

                          // Manually assign badge label and color
                          let rate = 'Needs Improvement';
                          let status: 'success' | 'warning' | 'destructive' = 'destructive';
                          if (score >= 90) {
                            rate = 'Excellent';
                            status = 'success';
                          } else if (score >= 75) {
                            rate = 'Good';
                            status = 'warning';
                          }

                          return (
                            <div
                              key={session.id}
                              className="group p-4 transition-colors hover:bg-muted/50"
                            >
                              {/* Mobile View */}
                              <div className="md:hidden space-y-2 cursor-pointer" onClick={() => handleSelectSession(session)} >
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">{exerciseName}</h3>
                                  <Badge variant={status}>{rate}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {sessionDate}
                                  </div>
                                  <span className="font-medium text-foreground">{score.toFixed(0)}%</span>
                                </div>
                              </div>

                              {/* Desktop View */}
                              <div className="hidden md:grid md:grid-cols-5 md:gap-4 md:items-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-[120px]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectSession(session);
                                  }}
                                >
                                  View Session
                                </Button>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span>{sessionDate}</span>
                                </div>
                                <div className="text-sm">{exerciseName}</div>
                                <div className="text-sm font-medium">{score.toFixed(0)}%</div>
                                <div>
                                  <Badge variant={status}>{rate}</Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </motion.div>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default DashboardPage;
