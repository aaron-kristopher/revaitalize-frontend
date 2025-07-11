// src/pages/Dashboard/DashboardPage.tsx

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

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Edit3, Calendar, Download, Check, Loader2 } from "lucide-react";
import sidebarLogo from "@/assets/imgs/sidebar.png";


const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-900 text-right">{value}</span>
  </div>
);

const DashboardPage = () => {
  const { setSidebarOpen } = useSidebar();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (user && activeTab) {
      const fetchSessionData = async () => {
        try {
          setIsLoadingData(true);
          // Special handling for the 'all' tab to show this_month by default
          const filter = (activeTab === 'all' ? 'this_month' : activeTab) as TimeFilter;

          const fetchedSessions = await getUserSessionsByTimeRange(user.id, filter);

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

  const handleSaveChanges = () => {
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
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xl font-semibold text-slate-900">Home</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {editMode ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSaveChanges} disabled={isSaving || saveSuccess} className="w-32">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saveSuccess && <Check className="mr-2 h-4 w-4" />}
                {saveSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => setEditMode(true)} className="text-slate-600 hover:text-slate-900">
              <Edit3 className="w-4 h-4 mr-2" /> Edit info
            </Button>
          )}
        </div>
      </header>

      <motion.div
        className="p-4 md:p-6 space-y-8"
        variants={pageVariants} initial="initial" animate="in" transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 mb-4">General Information</h2>
            <Card className="shadow-sm">
              <CardContent className="p-4 md:p-6 space-y-4">
                {user ? (
                  <>
                    <InfoRow label="First Name" value={user.first_name} /> <Separator />
                    <InfoRow label="Last Name" value={user.last_name} /> <Separator />
                    <InfoRow label="Email" value={user.email} /> <Separator />
                    <InfoRow label="Age" value={String(user.age)} /> <Separator />
                    <InfoRow label="Address" value={user.address || 'Not provided'} /> <Separator />
                    <InfoRow label="Last Session" value="Not tracked yet" />
                  </>
                ) : (
                  <p className="text-slate-500">Loading user information...</p>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Medical Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea className="h-32 resize-none" placeholder="Medical Condition" disabled={!editMode} />
              <Textarea className="h-32 resize-none" placeholder="Allergies" disabled={!editMode} />
              <Textarea className="h-32 resize-none" placeholder="Medications" disabled={!editMode} />
              <Textarea className="h-32 resize-none" placeholder="Notes" disabled={!editMode} />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-xl font-bold text-slate-800">All Sessions</h2>
            <div className="flex items-center gap-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
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
              <div className="mt-4">
                <div className="hidden md:grid md:grid-cols-4 gap-4 text-xs font-medium text-slate-500 uppercase tracking-wide p-4 bg-slate-200/60 rounded-t-lg">
                  <div>Date</div>
                  <div>Exercise</div>
                  <div>Score</div>
                  <div>Rate</div>
                </div>
                <div className="space-y-3 md:space-y-0">
                  {isLoadingData && <p className="p-4 text-center">Loading sessions...</p>}
                  {error && <p className="p-4 text-center text-red-500">Error: {error}</p>}

                  {!isLoadingData && !error && sessions.map((session) => {
                    const exerciseName = exercises.find(ex => ex.id === session.exercise_id)?.name || 'Unknown Exercise';
                    const sessionDate = new Date(session.datetime_start).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    });

                    const score = session.session_quality_score || 0;
                    let rate = "Needs Improvement";
                    let status: 'success' | 'warning' | 'destructive' = 'destructive';
                    if (score >= 90) { rate = "Excellent"; status = "success"; }
                    else if (score >= 75) { rate = "Fair"; status = "warning"; }

                    return (
                      <div key={session.id} className="bg-white p-4 rounded-lg shadow-sm md:shadow-none md:rounded-none md:grid md:grid-cols-4 md:gap-4 md:items-center md:border-b md:border-slate-200">
                        {/* Mobile View */}
                        <div className="md:hidden">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-slate-800">{exerciseName}</span>
                            <span className="font-bold text-blue-600">{score.toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-slate-500">
                            <span>{sessionDate}</span>
                            <Badge className={
                              status === 'success' ? 'border-transparent bg-emerald-600 text-white' :
                                status === 'warning' ? 'border-transparent bg-amber-500 text-white' :
                                  'border-transparent bg-red-600 text-white'
                            }>
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
                          <Badge className={
                            status === 'success' ? 'border-transparent bg-emerald-600 text-white' :
                              status === 'warning' ? 'border-transparent bg-amber-500 text-white' :
                                'border-transparent bg-red-600 text-white'
                          }>
                            {rate}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}

                  {!isLoadingData && !error && sessions.length === 0 && (
                    <div className="text-center p-12 bg-white rounded-b-lg">No sessions recorded for this period.</div>
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
