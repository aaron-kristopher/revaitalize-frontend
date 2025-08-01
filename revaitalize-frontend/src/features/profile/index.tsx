import { motion } from 'framer-motion';
import { useSidebar } from '@/shared/context/SidebarContext';
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/shared/components/ui/breadcrumb";
import { User, Shield, Bell, Camera, Loader2, Check } from 'lucide-react';
import sidebarLogo from "@/assets/imgs/sidebar.png";
import { LogOut } from 'lucide-react';

import { useProfile } from './hooks/useProfile';

const ProfilePage: React.FC = () => {
    const { setSidebarOpen } = useSidebar();
    const {
        user,
        logout,
        formData,
        handleInputChange,
        isSaving,
        saveSuccess,
        error,
        handleSaveChanges,
    } = useProfile();

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    return (
        <>
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
                    <Button variant="ghost" onClick={logout} className="text-red-600 hover:bg-red-100 hover:text-red-700">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            <div className="flex-1 bg-slate-50 overflow-y-auto">

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
                                <img
                                    src="https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Jude"
                                    alt="avatar" />
                                <AvatarFallback>AH</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">{user ? `${user.first_name} ${user.last_name}` : 'Loading...'}</h1>
                            <p className="text-slate-500">{user ? user.email : '...'}</p>
                        </div>
                    </div>

                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-md">
                            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" /> Profile Details</TabsTrigger>
                            <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" /> Security</TabsTrigger>
                            <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" /> Notifications</TabsTrigger>
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
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input id="first_name" value={formData.first_name} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input id="last_name" value={formData.last_name} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                                        </div>
                                        {/* You'll need to add inputs for Age and Address as well to make them editable */}
                                        <div className="space-y-2">
                                            <Label htmlFor="age">Age</Label>
                                            <Input id="age" type="number" value={formData.age} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Input id="address" value={formData.address} onChange={handleInputChange} />
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
                                        {error && <p className="text-sm font-medium text-red-500 mr-4">{error}</p>}
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
        </>
    );
};

export default ProfilePage;
