import React, { useState, useEffect } from 'react';
import { IoMenu, IoChevronBack } from 'react-icons/io5';
import revaitalize from '@/assets/imgs/revaitalize.svg';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

const Navbar: React.FC = () => {
    const [nav, setNav] = useState<boolean>(false);
    const [hidden, setHidden] = useState<boolean>(false);
    const [lastScrollY, setLastScrollY] = useState<number>(0);

    const handleNav = () => setNav(!nav);

    useEffect(() => {
        if (nav) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [nav]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100 && !nav) {
                setHidden(true);
            } else {
                setHidden(false);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, nav]);

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'
                    } flex justify-between items-center h-20 w-full px-4 md:px-8 bg-slate-900 text-white`}>
                <div className='flex items-center gap-8'>
                    <Link to="/">
                        <img src={revaitalize} alt="RevAItalize" />
                    </Link>
                    <ul className='hidden md:flex space-x-8'>
                        <li><Link to="/models" className='hover:text-gray-300 transition-colors font-medium'>Models</Link></li>
                        <li><Link to="/exercises" className='hover:text-gray-300 transition-colors font-medium'>Exercises</Link></li>
                        <li><Link to="/faq" className='hover:text-gray-300 transition-colors font-medium'>FAQ</Link></li>
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
                    <IoMenu size={24} />
                </div>
            </header>

            <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${nav ? 'visible' : 'invisible'}`}>
                <div onClick={handleNav} className={`absolute inset-0 bg-black/60 transition-opacity ${nav ? 'opacity-100' : 'opacity-0'}`} />

                <div className={`relative absolute top-0 left-0 flex h-full w-[75%] max-w-sm flex-col bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out ${nav ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex h-20 items-center justify-between px-4">
                        <Link to="/" onClick={handleNav}>
                            <img src={revaitalize} alt="RevAItalize" />
                        </Link>
                    </div>

                    <div onClick={handleNav} className="absolute top-10 -translate-y-1/2 right-0 translate-x-1/2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-900 border-2 border-gray-700">
                        <IoChevronBack size={20} className="text-white" />
                    </div>

                    <div className="flex flex-grow flex-col justify-between overflow-y-auto p-4">
                        <ul className='text-white'>
                            <li><Link to="/models" onClick={handleNav} className='block rounded p-4 text-lg hover:bg-slate-800'>Models</Link></li>
                            <li><Link to="/exercises" onClick={handleNav} className='block rounded p-4 text-lg hover:bg-slate-800'>Exercises</Link></li>
                            <li><Link to="/faq" onClick={handleNav} className='block rounded p-4 text-lg hover:bg-slate-800'>FAQ</Link></li>
                        </ul>
                        <div className="flex flex-col space-y-2 pt-8">
                            <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white" asChild>
                                <Link to='/login' onClick={handleNav}>Login</Link>
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                                <Link to='/signup' onClick={handleNav}>Signup</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
