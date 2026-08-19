import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, LogOut, Menu, PawPrint, Shield, UserRound, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { rememberReturnTo } from '../utils/authRouting'

const publicLinks = [
    { label: 'Services', href: '/#services' },
    { label: 'Gallery', href: '/#gallery' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'About', href: '/#about' }
]

const userLinks = [
    { label: 'Home', to: '/dashboard' },
    { label: 'Book', to: '/booking' },
    { label: 'My Pets', to: '/my-pets' },
    { label: 'Appointments', to: '/appointments' },
    { label: 'Profile', to: '/profile' }
]

export default function Header() {
    const [open, setOpen] = useState(false)
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const hideHeader = ['/login', '/signup', '/forgot-password', '/complete-profile', '/admin'].includes(location.pathname)
    if (hideHeader) return null

    const startBooking = () => {
        setOpen(false)
        if (user) {
            navigate(user.profileCompleted ? '/booking' : '/complete-profile')
            return
        }
        rememberReturnTo('/booking')
        navigate('/login', { state: { returnTo: '/booking', reason: 'booking-required' } })
    }

    const signOut = () => {
        logout()
        setOpen(false)
        navigate('/')
    }

    return (
        <header className='sticky top-0 z-50 border-b border-[#e8ddd0] bg-[#fffdf8]/95 backdrop-blur-md shadow-xs'>
            <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>

                {/* Brand Logo */}
                <Link
                    to={user?.role === 'user' ? '/dashboard' : '/'}
                    className='group flex items-center gap-2.5'
                >
                    <span className='grid h-9 w-9 place-items-center rounded-xl bg-[#bf5a31] text-white shadow-sm transition-transform duration-200 group-hover:scale-105'>
                        <PawPrint size={18} />
                    </span>
                    <span className='font-serif text-xl font-bold tracking-tight text-[#201711]'>
                        TimmyTails
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className='hidden items-center gap-6 md:flex'>
                    {user?.role === 'user' ? userLinks.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `relative pb-0.5 text-sm font-semibold transition-colors duration-200 ${
                                    isActive
                                        ? 'text-[#bf5a31] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#bf5a31]'
                                        : 'text-[#4e382b] hover:text-[#bf5a31]'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    )) : publicLinks.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className='text-sm font-semibold text-[#4e382b] transition-colors duration-200 hover:text-[#bf5a31]'
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className='hidden items-center gap-2.5 md:flex'>
                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <Link
                                    to='/admin'
                                    className='inline-flex items-center gap-1.5 rounded-lg border border-[#bf5a31]/30 bg-[#fff5ee] px-3.5 py-1.5 text-xs font-bold text-[#bf5a31] transition hover:bg-[#ffeade]'
                                >
                                    <Shield size={14} />
                                    Admin Panel
                                </Link>
                            ) : (
                                <Link
                                    to='/profile'
                                    className='inline-flex items-center gap-2 rounded-lg border border-[#e5d8c8] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#3e2b20] transition hover:border-[#bf5a31]/40 hover:text-[#bf5a31]'
                                >
                                    <span className='grid h-5 w-5 place-items-center rounded-full bg-[#bf5a31] text-[10px] font-bold text-white'>
                                        {user.firstName?.[0]?.toUpperCase() || <UserRound size={11} />}
                                    </span>
                                    {user.firstName}
                                </Link>
                            )}
                            <button
                                onClick={signOut}
                                className='inline-flex items-center gap-1.5 rounded-lg border border-[#e2d4c2] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#5f4637] transition hover:bg-[#f5ede3] hover:text-[#201711]'
                            >
                                <LogOut size={13} />
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to='/login'
                                className='rounded-lg border border-[#e0d3c3] bg-white px-4 py-2 text-xs font-bold text-[#4e382b] transition hover:border-[#bf5a31] hover:text-[#bf5a31]'
                            >
                                Sign In
                            </Link>
                            <button
                                onClick={startBooking}
                                className='inline-flex items-center gap-2 rounded-lg bg-[#bf5a31] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#a94723] active:scale-[0.98]'
                            >
                                <CalendarDays size={14} />
                                <span>Book Now</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setOpen((v) => !v)}
                    className='grid h-9 w-9 place-items-center rounded-lg border border-[#e6d9ca] bg-white text-[#3e2b20] transition hover:border-[#bf5a31] hover:text-[#bf5a31] md:hidden'
                    aria-label='Toggle navigation'
                >
                    {open ? <X size={19} /> : <Menu size={19} />}
                </button>
            </div>

            {/* Mobile Drawer */}
            {open && (
                <div className='border-t border-[#ecddd0] bg-[#fffdf8] px-4 pb-6 pt-4 shadow-lg md:hidden'>
                    <div className='flex flex-col gap-1'>
                        {user?.role === 'user' ? userLinks.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `rounded-xl px-4 py-3 text-sm font-bold transition ${
                                        isActive
                                            ? 'bg-[#fff0e8] text-[#bf5a31]'
                                            : 'text-[#3e2b20] hover:bg-[#f5ede3]'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        )) : publicLinks.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className='rounded-xl px-4 py-3 text-sm font-bold text-[#3e2b20] transition hover:bg-[#f5ede3]'
                            >
                                {item.label}
                            </a>
                        ))}

                        <div className='my-2 h-px bg-[#ecddd0]' />

                        {!user && (
                            <Link
                                to='/login'
                                onClick={() => setOpen(false)}
                                className='rounded-xl border border-[#e0d3c3] py-3 text-center text-sm font-bold text-[#4e382b] transition hover:border-[#bf5a31] hover:text-[#bf5a31]'
                            >
                                Sign In
                            </Link>
                        )}
                        {user?.role === 'admin' && (
                            <Link
                                to='/admin'
                                onClick={() => setOpen(false)}
                                className='rounded-xl border border-[#bf5a31]/30 bg-[#fff5ee] py-3 text-center text-sm font-bold text-[#bf5a31]'
                            >
                                Admin Panel
                            </Link>
                        )}
                        {user?.role !== 'admin' && (
                            <button
                                onClick={startBooking}
                                className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#bf5a31] py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#a94723]'
                            >
                                <CalendarDays size={16} />
                                <span>Book Now</span>
                            </button>
                        )}
                        {user && (
                            <button
                                onClick={signOut}
                                className='flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e2d4c2] py-3 text-sm font-bold text-[#5f4637] transition hover:bg-[#f5ede3]'
                            >
                                <LogOut size={15} />
                                <span>Sign Out</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
