import React, { useState, useEffect } from 'react';
import { IoMenu, IoClose } from 'react-icons/io5';
import revaitalize from '@/assets/imgs/revaitalize.svg';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

const Navbar: React.FC = () => {
    const [nav, setNav] = useState<boolean>(false);
    const [hidden, setHidden] = useState<boolean>(false);
    const [lastScrollY, setLastScrollY] = useState<number>(0);

    const handleNav = () => setNav(!nav);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setHidden(true);
            } else {
                setHidden(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'
                } flex justify-between items-center h-20 w-full px-4 md:px-8 bg-slate-900 text-white`}
        >
            <div className='flex items-center gap-8'>
                <div className="flex items-center">
                    <Link to="/">
                        <img src={revaitalize} alt="RevAItalize" />
                    </Link>
                </div>

                <ul className='hidden md:flex space-x-8'>
                    <li>
                        <Link to="/models" className='hover:text-gray-300 transition-colors font-medium'>Models</Link>
                    </li>
                    <li>
                        <Link to="/exercises" className='hover:text-gray-300 transition-colors font-medium'>Exercises</Link>
                    </li>
                    <li>
                        <Link to="/faq" className='hover:text-gray-300 transition-colors font-medium'>FAQ</Link>
                    </li>
                </ul>
            </div>

            <div className="hidden md:flex items-center space-x-3">
                <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white" asChild>
                    <Link to='/login'>Login</Link>
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <Link to='/signup'>Signup</Link>
                </Button>
            </div>

            <div onClick={handleNav} className='block md:hidden cursor-pointer'>
                {nav ? <IoClose size={24} /> : <IoMenu size={24} />}
            </div>

            {/* Mobile Nav */}
            <div className={nav ? 'fixed left-0 top-0 w-[60%] h-full border-r border-gray-900 bg-slate-900 ease-in-out duration-500 z-50' : 'fixed left-[-100%] ease-in-out duration-500'}>
                <div className="flex items-center space-x-3 p-4">
                    <Link to="/" onClick={handleNav}>
                        <img src={revaitalize} alt="RevAItalize" />
                    </Link>
                </div>

                <ul className='pt-8 text-white'>
                    <li className='border-b border-gray-600'>
                        <Link to="/models" onClick={handleNav} className='block p-4 hover:bg-gray-800'>Models</Link>
                    </li>
                    <li className='border-b border-gray-600'>
                        <Link to="/exercises" onClick={handleNav} className='block p-4 hover:bg-gray-800'>Exercises</Link>
                    </li>
                    <li className='border-b border-gray-600'>
                        <Link to="/faq" onClick={handleNav} className='block p-4 hover:bg-gray-800'>FAQ</Link>
                    </li>
                </ul>

                <div className="flex flex-col space-y-2 p-4 mt-4">
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white" asChild>
                        <Link to='/login' onClick={handleNav}>Login</Link>
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                        <Link to='/signup' onClick={handleNav}>Signup</Link>
                    </Button>
                </div>
            </div>

            {nav && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={handleNav}
                ></div>
            )}
        </div>
    );
};

export default Navbar;
