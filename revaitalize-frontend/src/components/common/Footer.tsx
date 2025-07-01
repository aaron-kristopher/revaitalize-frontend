import React from "react";
import lightLogo from '@/assets/imgs/lightVerLogo.svg';

const Footer: React.FC = () => {
    const currentYear: number = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
                        <div className="group">
                            <h3 className="text-lg font-bold mb-6 text-gray-700 pb-2 inline-block">Navigation</h3>
                            <ul className="space-y-3">
                                <li><a href="/" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">Home</a></li>
                                <li><a href="/revaitalize" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">RevAItalize</a></li>
                                <li><a href="/about" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">About Us</a></li>
                                <li><a href="/faq" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">FAQ</a></li>
                            </ul>
                        </div>

                        <div className="group">
                            <h3 className="text-lg font-bold mb-6 text-gray-700 pb-2 inline-block">Models</h3>
                            <ul className="space-y-3">
                                <li><a href="/models" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">Models</a></li>
                                <li><a href="/lstm" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">Long Short Term Memory</a></li>
                                <li><a href="/blazepose" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">Blazepose</a></li>
                            </ul>
                        </div>

                        <div className="group">
                            <h3 className="text-lg font-bold mb-6 text-gray-700 pb-2 inline-block">Exercises</h3>
                            <ul className="space-y-3">
                                <li><a href="/exercises/torso-rotation" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">Torso Rotation</a></li>
                                <li><a href="/exercises/flank-stretch" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">Flank Stretch</a></li>
                                <li><a href="/exercises/hiding-face" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">Hiding Face</a></li>
                            </ul>
                        </div>

                        <div className="group">
                            <h3 className="text-lg font-bold mb-6 text-gray-700 pb-2 inline-block">Account</h3>
                            <ul className="space-y-3">
                                <li><a href="/signup" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">Signup</a></li>
                                <li><a href="/login" className="text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all duration-300 text-sm font-medium block">Login</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-end">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-[#004DBC]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative hover:shadow-xl transition-all duration-500">
                                <img 
                                    src={lightLogo} 
                                    alt="RevAItalize Logo" 
                                    className="h-32 w-auto filter drop-shadow-sm hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t bg-[#002356] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
                <div className="max-w-7xl mx-auto px-8 py-4 relative">
                    <div className="flex flex-col sm:flex-row justify-between items-center text-white">
                        <p className="text-md font-medium tracking-wide">
                            © {currentYear} RevAItalize, AMAteurs
                        </p>
                        <div className="flex space-x-6 mt-4 sm:mt-0">
                            <a href="/privacy" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300 text-md font-medium">Privacy Policy</a>
                            <a href="/terms" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300 text-md font-medium">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;