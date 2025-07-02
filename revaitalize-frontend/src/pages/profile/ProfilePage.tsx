import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { User, Shield, Bell, Camera, Loader2, Check } from 'lucide-react';
import sidebarLogo from "@/assets/imgs/sidebar.png";
import profileImage from "@/assets/imgs/aprilhymn.jpg";

const ProfilePage: React.FC = () => {
    const { setSidebarOpen } = useSidebar();
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const handleSaveChanges = () => {
        setIsSaving(true);
        setSaveSuccess(false);
        setTimeout(() => {
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000); 
        }, 1500);
    };

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    return (
        <div className="flex-1 bg-slate-50 overflow-y-auto">
            {/* --- Standard Header --- */}
            <header className="sticky top-0 bg-white border-b border-slate-200 px-4 md:px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen((prev) => !prev)} className="hover:bg-slate-100 hidden md:inline-flex">
                            <img src={sidebarLogo} alt="Menu Icon" className="w-6 h-6" />
                        </Button>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-xl font-semibold text-slate-900">Profile</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </div>
            </header>

            <motion.main
                className="p-4 md:p-6 lg:p-8"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative cursor-pointer group"
                    >
                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                            <AvatarImage src={profileImage} alt="April Hymn" />
                            <AvatarFallback>AH</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </motion.div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">April Hymn</h1>
                        <p className="text-slate-500">aprilhymn452@gmail.com</p>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                        <TabsTrigger value="profile"><User className="w-4 h-4 mr-2"/> Profile Details</TabsTrigger>
                        <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2"/> Security</TabsTrigger>
                        <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2"/> Notifications</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" asChild>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Update your personal details here.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" defaultValue="April Hymn" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" defaultValue="Dela Cruz" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" defaultValue="aprilhymn452@gmail.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Contact Number</Label>
                                        <Input id="phone" defaultValue="+639213375101" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={handleSaveChanges}
                                        disabled={isSaving || saveSuccess}
                                        className="w-36 transition-all"
                                    >
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {saveSuccess && <Check className="mr-2 h-4 w-4" />}
                                        {saveSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="security" asChild>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>For your security, we recommend using a strong password.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <Input id="currentPassword" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input id="newPassword" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input id="confirmPassword" type="password" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Update Password</Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="notifications" asChild>
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Notification Settings</CardTitle>
                                    <CardDescription>Manage how you receive notifications from us.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label htmlFor="progressReports" className="font-semibold">Weekly Progress Reports</Label>
                                            <p className="text-sm text-slate-500">Receive an email summary of your activity and progress each week.</p>
                                        </div>
                                        {/* Replace this with a shadcn Switch component when added */}
                                        <div className="w-10 h-6 bg-slate-200 rounded-full p-1 flex items-center cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-4 transition-transform"></div>
                                        </div>
                                    </div>
                                     <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label htmlFor="sessionReminders" className="font-semibold">Session Reminders</Label>
                                            <p className="text-sm text-slate-500">Get a push notification 15 minutes before a scheduled session.</p>
                                        </div>
                                        <div className="w-10 h-6 bg-slate-200 rounded-full p-1 flex items-center cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </motion.main>
        </div>
    );
};

export default ProfilePage;