import { Link, NavLink, useLocation } from 'react-router-dom'
import { CalendarDays, Dog, Home, LayoutDashboard, LogIn, Scissors, Shield, User, CalendarCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function BottomNav() {
    const { user } = useAuth()
    const location = useLocation()

    // Hide bottom nav on specific fullscreen auth pages or admin dashboard if full screen
    const hideOnRoutes = ['/login', '/signup', '/forgot-password', '/complete-profile']
    if (hideOnRoutes.includes(location.pathname)) {
        return null
    }

    const isUser = user && user.role === 'user'
    const isAdmin = user && user.role === 'admin'

    const navItems = isUser
        ? [
            { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
            { label: 'Book', to: '/booking', icon: CalendarDays },
            { label: 'My Pets', to: '/my-pets', icon: Dog },
            { label: 'Appointments', to: '/appointments', icon: CalendarCheck },
            { label: 'Profile', to: '/profile', icon: User }
        ]
        : isAdmin
            ? [
                { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
                { label: 'Admin', to: '/admin', icon: Shield },
                { label: 'Profile', to: '/profile', icon: User }
            ]
            : [
                { label: 'Home', to: '/', icon: Home },
                { label: 'Services', to: '/services', icon: Scissors },
                { label: 'Book', to: '/booking', icon: CalendarDays },
                { label: 'Sign In', to: '/login', icon: LogIn }
            ]

    return (
        <nav
            aria-label="Mobile Navigation Bar"
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E2D9C8] bg-[#FAF7F2]/95 backdrop-blur-lg shadow-lg md:hidden pb-safe"
        >
            <div className="flex h-15 items-center justify-around px-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `relative flex flex-1 flex-col items-center justify-center py-1 text-[#68594E] transition-all min-w-0 ${
                                    isActive
                                        ? 'text-[#C25E2B] font-bold'
                                        : 'hover:text-[#261C14]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="relative flex h-6 w-6 items-center justify-center">
                                        <Icon size={19} className={isActive ? 'stroke-[2.5px] text-[#C25E2B]' : 'stroke-2'} />
                                    </div>
                                    <span
                                        className={`mt-0.5 w-full text-center truncate px-0.5 text-[10px] leading-tight ${
                                            isActive ? 'font-bold text-[#C25E2B]' : 'font-medium text-[#68594E]'
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    )
                })}
            </div>
        </nav>
    )
}
