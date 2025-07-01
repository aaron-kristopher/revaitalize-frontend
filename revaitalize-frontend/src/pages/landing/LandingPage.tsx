import React from "react";
import { ArrowRight, CheckCircle, Globe, Heart } from "lucide-react";
import doctors from '@/assets/imgs/doctors.png';
import flankStretch from '@/assets/imgs/fs-illustration.svg';
import hidingFace from '@/assets/imgs/hf-illustration.svg';
import torsoRotation from '@/assets/imgs/tr-illustration.svg';

type Feature = {
  icon: string;
  title: string;
  description: string;
};

type Exercise = {
  image: string;
  title: string;
  description: string;
  duration: string;
};

type Service = {
  title: string;
  description: string;
};

const LandingPage: React.FC = () => {
    const features: Feature[] = [
        { icon: "🧠", title: "Feature 1", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." },
        { icon: "📊", title: "Feature 2", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." },
        { icon: "🎯", title: "Feature 3", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." },
        { icon: "📱", title: "Feature 4", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." },
        { icon: "👨‍⚕️", title: "Feature 5", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." },
        { icon: "🔔", title: "Feature 6", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." }
    ];

    const exercises: Exercise[] = [
        { image: flankStretch, title: "Flank Stretch", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.", duration: "5-10 mins" },
        { image: torsoRotation, title: "Torso Rotation", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.", duration: "8-12 mins" },
        { image: hidingFace, title: "Hiding Face", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.", duration: "10-15 mins" }
    ];

    const services: Service[] = [
        { title: "Service 1", description: "Lorem Ipsum is simply dummy text" },
        { title: "Service 2", description: "Lorem Ipsum is simply dummy text" },
        { title: "Service 3", description: "Lorem Ipsum is simply dummy text" }
    ];


    return (
        <div className="overflow-x-hidden">
        {/* HERO SECTION */}
            <div className="relative min-h-screen bg-gradient-to-r from-[#002356] via-[#003875] to-[#004DBC]">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 h-96 w-96 rounded-full bg-white/5 blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-white/3 blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid min-h-screen items-center gap-12 py-20 lg:grid-cols-2">
                        {/* Left Section */}
                        <div className="space-y-8 text-white">
                            <div className="space-y-6">
                                <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                                    <Heart className="h-4 w-4 text-red-400" />
                                    <span>RevAItalize</span>
                                </div>

                                <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                                    A POST-REHABILITATION FOR YOUR
                                    <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                        LOWER BACK PAIN
                                    </span>
                                </h1>
                                <p className="max-w-2xl text-xl leading-relaxed text-blue-100">
                                    Lorem Ipsum is simply dummy tesxt of the printing and typesetting industry.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <button className="group flex items-center justify-center space-x-2 rounded-full bg-white px-8 py-4 font-bold text-[#002356] shadow-xl transition-all duration-300 hover:bg-blue-50 transform hover:scale-105">
                                    <span>TRY OUR EXERCISES</span>
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>

                        {/* Image Section */}
                        <div className="relative flex items-center justify-center">
                            <div className="relative z-10 transform transition-transform duration-500 hover:scale-105">
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/20 to-transparent blur-xl"></div>
                                <img
                                    className="relative z-10 h-auto w-full rounded-3xl shadow-2xl"
                                    src={doctors}
                                    alt="Doctors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* WHAT IS REVAITALIZE SECTION */}
            <div className="bg-gradient-to-b from-white to-[#EDFBFF] py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-bold leading-tight text-[#002356] lg:text-5xl">
                                    What is RevAItalize?
                                </h2>
                                <p className="text-lg leading-relaxed text-gray-600">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                                </p>
                            </div>
                            {/* Features */}
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
                                    <div>
                                        <h4 className="font-semibold text-[#002356]">Topic 1</h4>
                                        <p className="text-gray-600">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
                                    <div>
                                        <h4 className="font-semibold text-[#002356]">Topic 2</h4>
                                        <p className="text-gray-600">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
                                    <div>
                                        <h4 className="font-semibold text-[#002356]">Topic 3</h4>
                                        <p className="text-gray-600">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Right section */}
                        <div className="relative">
                            <div className="absolute inset-0 transform rotate-6 rounded-3xl bg-gradient-to-r from-[#004DBC]/20 to-[#002356]/20 blur-xl"></div>
                            <div className="relative rounded-3xl bg-white p-8 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700">
                                            <Globe className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[#002356]">SDG 3</h4>
                                            <p className="text-gray-600">Good health and well-being</p>
                                        </div>
                                    </div>
                                    <div className="border-l-4 border-green-700 pl-4">
                                        <p className="font-medium italic text-[#002356]">
                                            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
                                        </p>
                                    </div>                                      
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HOW WE CAN HELP SECTION */}
            <div className="relative overflow-hidden bg-[#002356] py-20">
                <div className="absolute inset-0">
                    <div className="absolute top-40 left-10 h-64 w-64 rounded-full bg-[#004DBC]/20 blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
                            How we can help
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-blue-100">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="transform rounded-2xl bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/15">
                                    <div className="mb-4 text-4xl">{feature.icon}</div>
                                    <h3 className="mb-3 text-xl font-semibold text-white">{feature.title}</h3>
                                    <p className="text-blue-100">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* EXERCISES SECTION */}
            <div className="bg-gradient-to-b from-[#EDFBFF] to-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-6 text-4xl font-bold text-[#002356] lg:text-5xl">
                            What are the exercises?
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                        </p>
                    </div>

                    <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {exercises.map((exercise, index) => (
                            <div
                                key={index}
                                className="group transform overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                <div className="flex items-center justify-center bg-gradient-to-br from-[#EDFBFF] to-[#004DBC]/10 p-8 aspect-square">
                                    <img
                                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                        src={exercise.image}
                                        alt={exercise.title}
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="mb-3">
                                        <h3 className="text-xl font-bold text-[#002356]">{exercise.title}</h3>
                                    </div>
                                    <p className="mb-4 text-gray-600">{exercise.description}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="rounded-full bg-[#004DBC]/10 px-3 py-1 font-medium text-[#004DBC]">
                                            {exercise.duration}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SERVICES SECTION */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#002356] to-[#004DBC] py-20">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div className="space-y-8 text-white">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-bold leading-tight lg:text-5xl">Services</h2>
                                <p className="text-xl leading-relaxed text-blue-100">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                {services.map((service, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/15">
                                            <h4 className="mb-2 text-xl font-semibold">{service.title}</h4>
                                            <p className="text-blue-100">{service.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Right side */}
                        <div className="relative">
                            <div className="rounded-3xl bg-white/10 p-8 backdrop-blur-sm">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold text-white">Start Your Recovery Today</h3>
                                    <p className="text-blue-100">Lorem Ipsum is simply dummy text</p>

                                    <div className="space-y-4">
                                        <button className="w-full transform rounded-xl bg-white px-6 py-4 font-bold text-[#002356] transition-all duration-300 hover:scale-105 hover:bg-blue-50">
                                            Get Started Now
                                        </button>
                                    </div>

                                    <div className="border-t border-white/20 pt-6">
                                        <p className="text-center text-sm text-blue-200">Free assessment</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;