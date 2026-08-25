import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, LogOut, Menu, Shield, UserRound, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { rememberReturnTo } from '../utils/authRouting'
import NotificationBell from './NotificationBell'

const publicLinks = [
    { label: 'Services', href: '/services' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' }
]

const userLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Book Appointment', to: '/booking' },
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
        <header className='sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xs'>
            <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>

                {/* Brand Title */}
                <Link
                    to={user?.role === 'user' ? '/dashboard' : '/'}
                    className='group flex items-center gap-2 text-slate-900 transition-opacity hover:opacity-90'
                >
                    <span className='font-serif text-xl font-bold tracking-tight text-slate-900 sm:text-2xl'>
                        TimmyTails
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className='hidden items-center gap-6 md:flex'>
                    {user?.role === 'user' ? userLinks.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `relative text-sm font-medium transition-colors duration-150 py-1.5 ${isActive
                                    ? 'text-[#C25E2B] font-semibold after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#C25E2B]'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    )) : publicLinks.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`text-sm font-medium transition-colors duration-150 py-1.5 ${location.pathname === item.href ? 'text-[#C25E2B] font-semibold' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className='hidden items-center gap-3 md:flex'>
                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <Link
                                    to='/admin'
                                    className='inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-200'
                                >
                                    <Shield size={14} className='text-[#C25E2B]' />
                                    Admin Workspace
                                </Link>
                            ) : (
                                <>
                                    <NotificationBell />
                                    <Link
                                        to='/profile'
                                        className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-[#C25E2B] hover:bg-white'
                                    >
                                        <span className='grid h-5 w-5 place-items-center rounded-full bg-[#C25E2B] text-[10px] font-bold text-white'>
                                            {user.firstName?.[0]?.toUpperCase() || <UserRound size={11} />}
                                        </span>
                                        <span>{user.firstName}</span>
                                    </Link>
                                </>
                            )}
                            <button
                                onClick={signOut}
                                className='inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900'
                            >
                                <LogOut size={13} />
                                <span>Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to='/login'
                                className='rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50'
                            >
                                Sign In
                            </Link>
                            <button
                                onClick={startBooking}
                                className='inline-flex items-center gap-2 rounded-lg bg-[#C25E2B] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#A84E20] active:scale-[0.98]'
                            >
                                <CalendarDays size={14} />
                                <span>Book Appointment</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Header Actions */}
                <div className='flex items-center gap-2 md:hidden'>
                    {user && user.role !== 'admin' && (
                        <NotificationBell />
                    )}
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className='grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-800 transition hover:border-slate-300 hover:bg-slate-50'
                        aria-label='Toggle navigation'
                    >
                        {open ? <X size={19} /> : <Menu size={19} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {open && (
                <div className='border-t border-slate-200 bg-white px-4 pb-6 pt-4 shadow-sm md:hidden'>
                    <div className='flex flex-col gap-1.5'>
                        {user?.role === 'user' ? userLinks.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${isActive
                                        ? 'bg-slate-100 text-[#C25E2B]'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        )) : publicLinks.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setOpen(false)}
                                className='rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className='my-2 h-px bg-slate-200' />

                        {!user && (
                            <div className='grid gap-2'>
                                <Link
                                    to='/login'
                                    onClick={() => setOpen(false)}
                                    className='rounded-lg border border-slate-200 bg-white py-2.5 text-center text-sm font-bold text-slate-800 transition hover:bg-slate-50'
                                >
                                    Sign In
                                </Link>
                                <button
                                    onClick={startBooking}
                                    className='flex w-full items-center justify-center gap-2 rounded-lg bg-[#C25E2B] py-2.5 text-sm font-bold text-white transition hover:bg-[#A84E20]'
                                >
                                    <CalendarDays size={16} />
                                    <span>Book Appointment</span>
                                </button>
                            </div>
                        )}

                        {user?.role === 'admin' && (
                            <Link
                                to='/admin'
                                onClick={() => setOpen(false)}
                                className='rounded-lg border border-slate-300 bg-slate-100 py-2.5 text-center text-sm font-bold text-slate-900'
                            >
                                Admin Workspace
                            </Link>
                        )}

                        {user && user.role !== 'admin' && (
                            <div className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3'>
                                <div className='flex items-center gap-2.5 min-w-0'>
                                    <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#C25E2B] text-xs font-bold text-white'>
                                        {user.firstName?.[0]?.toUpperCase() || <UserRound size={13} />}
                                    </span>
                                    <div className='min-w-0'>
                                        <p className='truncate text-xs font-bold text-slate-900'>{user.firstName} {user.lastName}</p>
                                        <p className='truncate text-[10px] text-slate-500'>{user.email || user.phone}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { signOut(); setOpen(false) }}
                                    className='inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:text-slate-900'
                                >
                                    <LogOut size={13} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
