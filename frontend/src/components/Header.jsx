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
        <header className='sticky top-0 z-50 border-b border-[#E2D9C8] bg-[#FAF7F2]/95 backdrop-blur-md'>
            <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>

                {/* Brand Title (No Logo Icon) */}
                <Link
                    to={user?.role === 'user' ? '/dashboard' : '/'}
                    className='group flex items-center gap-2 text-[#261C14] transition-opacity hover:opacity-90'
                >
                    <span className='font-semibold text-xl tracking-tight text-[#261C14] font-serif sm:text-2xl'>
                        TimmyTails
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className='hidden items-center gap-7 md:flex'>
                    {user?.role === 'user' ? userLinks.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `relative text-sm font-medium transition-colors duration-150 py-1 ${
                                    isActive
                                        ? 'text-[#C25E2B] font-semibold after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#C25E2B]'
                                        : 'text-[#68594E] hover:text-[#C25E2B]'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    )) : publicLinks.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`text-sm font-medium transition-colors duration-150 py-1 ${
                                location.pathname === item.href ? 'text-[#C25E2B] font-semibold' : 'text-[#68594E] hover:text-[#C25E2B]'
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
                                    className='inline-flex items-center gap-1.5 rounded-lg border border-[#C25E2B]/30 bg-[#F4EFE6] px-3.5 py-1.5 text-xs font-bold text-[#C25E2B] transition hover:bg-[#EAE0D1]'
                                >
                                    <Shield size={14} />
                                    Admin Panel
                                </Link>
                            ) : (
                                <>
                                    <NotificationBell />
                                    <Link
                                        to='/profile'
                                        className='inline-flex items-center gap-2 rounded-lg border border-[#E2D9C8] bg-white px-3 py-1.5 text-xs font-semibold text-[#261C14] transition hover:border-[#C25E2B] hover:text-[#C25E2B]'
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
                                className='inline-flex items-center gap-1.5 rounded-lg border border-[#E2D9C8] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#68594E] transition hover:bg-[#F4EFE6] hover:text-[#261C14]'
                            >
                                <LogOut size={13} />
                                <span>Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to='/login'
                                className='rounded-lg border border-[#E2D9C8] bg-white px-4 py-2 text-xs font-bold text-[#261C14] transition hover:border-[#C25E2B] hover:text-[#C25E2B]'
                            >
                                Sign In
                            </Link>
                            <button
                                onClick={startBooking}
                                className='inline-flex items-center gap-2 rounded-lg bg-[#C25E2B] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#A84E20] active:scale-[0.98]'
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
                        className='grid h-9 w-9 place-items-center rounded-lg border border-[#E2D9C8] bg-white text-[#261C14] transition hover:border-[#C25E2B] hover:text-[#C25E2B]'
                        aria-label='Toggle navigation'
                    >
                        {open ? <X size={19} /> : <Menu size={19} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {open && (
                <div className='border-t border-[#E2D9C8] bg-[#FAF7F2] px-4 pb-6 pt-4 shadow-lg md:hidden'>
                    <div className='flex flex-col gap-1.5'>
                        {user?.role === 'user' ? userLinks.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                                        isActive
                                            ? 'bg-[#F4EFE6] text-[#C25E2B]'
                                            : 'text-[#261C14] hover:bg-[#F4EFE6]'
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
                                className='rounded-lg px-3.5 py-2.5 text-sm font-semibold text-[#261C14] transition hover:bg-[#F4EFE6]'
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className='my-2 h-px bg-[#E2D9C8]' />

                        {!user && (
                            <div className='grid gap-2'>
                                <Link
                                    to='/login'
                                    onClick={() => setOpen(false)}
                                    className='rounded-lg border border-[#E2D9C8] bg-white py-2.5 text-center text-sm font-bold text-[#261C14] transition hover:border-[#C25E2B] hover:text-[#C25E2B]'
                                >
                                    Sign In
                                </Link>
                                <button
                                    onClick={startBooking}
                                    className='flex w-full items-center justify-center gap-2 rounded-lg bg-[#C25E2B] py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#A84E20]'
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
                                className='rounded-lg border border-[#C25E2B]/30 bg-[#F4EFE6] py-2.5 text-center text-sm font-bold text-[#C25E2B]'
                            >
                                Admin Panel
                            </Link>
                        )}

                        {user && user.role !== 'admin' && (
                            <div className='flex items-center justify-between rounded-lg border border-[#E2D9C8] bg-white p-3 shadow-xs'>
                                <div className='flex items-center gap-2.5 min-w-0'>
                                    <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#C25E2B] text-xs font-bold text-white'>
                                        {user.firstName?.[0]?.toUpperCase() || <UserRound size={13} />}
                                    </span>
                                    <div className='min-w-0'>
                                        <p className='truncate text-xs font-bold text-[#261C14]'>{user.firstName} {user.lastName}</p>
                                        <p className='truncate text-[10px] text-[#68594E]'>{user.email || user.phone}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { signOut(); setOpen(false) }}
                                    className='inline-flex items-center gap-1.5 rounded-lg border border-[#E2D9C8] bg-[#FAF7F2] px-3 py-1.5 text-xs font-bold text-[#68594E] transition hover:text-[#261C14]'
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
