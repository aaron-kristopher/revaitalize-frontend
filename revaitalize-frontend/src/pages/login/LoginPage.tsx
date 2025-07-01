import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

import darkLogo from '@/assets/imgs/darkVerLogo.svg';
import BackgroundOrbs from "@/components/common/BackgroundOrbs";

export const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-r from-[#002356] to-[#004DBC] p-4 sm:p-8">
            <BackgroundOrbs/>

            <div className="relative z-10 flex w-full max-w-5xl items-center justify-center gap-8 sm:gap-16">
                {/* LEFT */}
                <div className="hidden flex-1 justify-center md:flex">
                    <div className="flex items-center justify-center">
                        <img src={darkLogo} alt="RevAItalize Logo" />
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex-1 max-w-lg">
                    <Card className="w-full rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-lg">
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl font-bold text-slate-50">
                                Welcome!
                            </CardTitle>
                            <CardDescription className="text-slate-300">
                                Please enter your details to log in.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-6 px-8">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-slate-200">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="h-12 rounded-lg border-slate-400/50 bg-white/10 text-white placeholder:text-slate-400 focus:border-blue-300 focus:ring-0"
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-200">
                                        Password
                                    </Label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-sky-300 hover:underline">
                                            Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="h-12 rounded-lg border-slate-400/50 bg-white/10 pr-10 text-white placeholder:text-slate-400 focus:border-blue-300 focus:ring-0"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 px-8 pb-8">
                            <Button className="h-12 w-full rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 font-bold text-white shadow-lg transition-all hover:from-sky-400 hover:to-blue-500">
                                Login
                            </Button>

                            <div className="mt-2 flex w-full items-center justify-center text-sm">
                                <span className="text-slate-400">No account?</span>
                                <Button
                                    variant="link"
                                    className="font-semibold text-slate-200 hover:text-white"
                                    asChild>
                                        <Link to="/signup">Create one</Link>
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;