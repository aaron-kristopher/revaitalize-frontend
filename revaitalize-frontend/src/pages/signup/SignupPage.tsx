import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Phone } from "lucide-react";
import BackgroundOrbs from "@/components/common/BackgroundOrbs";
import { createUser, type UserCreatePayload } from "../../api/userService";

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [age, setAge] = useState('');
    const [sex, setSex] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');

    // State for API interaction
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgreedToTerms(e.target.checked);
    };
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!agreedToTerms) {
            setError("You must agree to the Terms & Conditions.");
            return;
        }

        const userData: UserCreatePayload = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
            age: parseInt(age, 10),
            address: address,
            sex: sex,
            contact_number: contactNumber,
        };

        if (isNaN(userData.age) || userData.age <= 0) {
            setError("Please enter a valid age.");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const newUser = await createUser(userData);

            alert("Account created successfully! Proceeding to onboarding.");
            navigate(`/onboarding/${newUser.id}`);

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-r from-[#002356] to-[#004DBC] p-4 sm:p-8">
            <BackgroundOrbs />

            <Card className="relative z-10 my-8 w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-lg">
                <CardHeader className="pt-6 pb-4 text-center">
                    <CardTitle className="mb-1 text-3xl font-bold text-slate-50">
                        Create an account
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-300">
                        Already have an account?
                        <Button
                            variant="link"
                            className="h-auto p-1 font-medium text-sky-300 hover:text-white"
                            asChild>
                            <Link to="/login">Log in</Link>
                        </Button>
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 px-8 pb-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="firstName" className="text-sm font-medium text-slate-200">
                                    First Name *
                                </Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="h-12 rounded-lg border-slate-400/50 bg-white/10 text-white placeholder:text-slate-400 focus:border-blue-300 focus:ring-0"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="lastName" className="text-sm font-medium text-slate-200">
                                    Last Name *
                                </Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="h-12 rounded-lg border-slate-400/50 bg-white/10 text-white placeholder:text-slate-400 focus:border-blue-300 focus:ring-0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                                    Email *
                                </Label>
                                <div className="group relative">
                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-white" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 rounded-lg border-slate-400/50 bg-white/10 pl-11 text-white placeholder:text-slate-400 focus:border-blue-300 focus:ring-0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="contactNumber" className="text-sm font-medium text-slate-200">
                                    Contact Number *
                                </Label>
                                <div className="group relative">
                                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-white" />
                                    <Input
                                        id="contactNumber"
                                        type="tel"
                                        required
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        className="h-12 rounded-lg border-slate-400/50 bg-white/10 pl-11 text-white placeholder:text-slate-400 focus:border-blue-300 focus:ring-0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="age" className="text-sm font-medium text-slate-200">
                                    Age
                                </Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="h-12 rounded-lg border-slate-400/50 bg-white/10 text-white placeholder:text-slate-400 focus:border-blue-300 focus:ring-0"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="sex" className="text-sm font-medium text-slate-200">
                                    Sex
                                </Label>
                                <select
                                    id="sex"
                                    value={sex}
                                    onChange={(e) => setSex(e.target.value)}
                                    className="h-12 w-full cursor-pointer rounded-lg border border-slate-400/50 bg-white/10 px-3 text-sm text-white focus:border-blue-300 focus:outline-none focus:ring-0">
                                    <option style={{ color: 'black' }} value="">Select</option>
                                    <option style={{ color: 'black' }} value="male">Male</option>
                                    <option style={{ color: 'black' }} value="female">Female</option>
                                    <option style={{ color: 'black' }} value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-sm font-medium text-slate-200">
                                Address
                            </Label>
                            <Input
                                id="address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="h-12 rounded-lg border-slate-400/50 bg-white/10 text-white placeholder:text-slate-400 focus:border-blue-300 focus:ring-0"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                                Enter your password *
                            </Label>
                            <div className="group relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 rounded-lg border-slate-400/50 bg-white/10 pr-12 text-white placeholder:text-slate-400 focus:border-blue-300 focus:ring-0"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:text-white">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreedToTerms}
                                onChange={handleTermsChange}
                                className="mt-1 h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-md border-2 border-slate-400/80 bg-white/10 checked:border-sky-400 checked:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-transparent"
                            />
                            <Label
                                htmlFor="terms"
                                className="cursor-pointer text-sm leading-relaxed text-slate-300">
                                I agree to the{" "}
                                <span className="font-medium text-sky-300 transition-colors hover:text-white hover:underline">
                                    Terms & Conditions
                                </span>
                            </Label>
                        </div>

                        {error && <p className="text-sm font-medium text-red-400">{error}</p>}

                        <Button
                            type="submit"
                            className={`h-12 w-full rounded-lg bg-gradient-to-r from-blue-800 to-sky-500 font-bold text-white shadow-lg transition-all ${agreedToTerms
                                    ? 'hover:from-sky-400 hover:to-blue-500'
                                    : 'cursor-not-allowed opacity-60'
                                }`}
                            disabled={!agreedToTerms || isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}

export default SignupPage;
