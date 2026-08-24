import { useEffect, useRef, useState } from 'react'
import { Bell, CalendarDays, CheckCheck, Megaphone, X } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'

/* ── helpers ─────────────────────────────────────────────── */

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

function NotifIcon({ type }) {
    if (type === 'appointment-status')
        return (
            <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FAF7F2] text-[#C25E2B] border border-[#E2D9C8]'>
                <CalendarDays size={15} />
            </span>
        )
    return (
        <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200'>
            <Megaphone size={15} />
        </span>
    )
}

/* ── main component ──────────────────────────────────────── */

export default function NotificationBell() {
    const { notifications, loading, unreadCount, markRead, markAllRead } = useNotifications()
    const [open, setOpen] = useState(false)
    const panelRef = useRef(null)

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    // Close on Escape
    useEffect(() => {
        if (!open) return
        const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open])

    const handleItemClick = (notif) => {
        if (!notif.isRead) markRead(notif._id)
    }

    return (
        <div className='relative' ref={panelRef}>
            {/* Bell button */}
            <button
                id='notification-bell-btn'
                onClick={() => setOpen((v) => !v)}
                aria-label={`Notifications${unreadCount ? ` – ${unreadCount} unread` : ''}`}
                className='relative grid h-9 w-9 place-items-center rounded-lg border border-[#E2D9C8] bg-white text-[#261C14] transition hover:border-[#C25E2B] hover:text-[#C25E2B]'
            >
                <Bell size={17} />
                {unreadCount > 0 && (
                    <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C25E2B] text-[9px] font-bold text-white ring-2 ring-white'>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    id='notification-panel'
                    className='absolute -right-2 top-11 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-[#E2D9C8] bg-white shadow-xl sm:right-0 sm:w-96'
                    style={{ animation: 'notifSlide 0.15s ease' }}
                >
                    {/* Header */}
                    <div className='flex items-center justify-between border-b border-[#E2D9C8] px-4 py-3'>
                        <div className='flex items-center gap-2'>
                            <Bell size={15} className='text-[#C25E2B]' />
                            <span className='text-sm font-bold text-[#261C14]'>Notifications</span>
                            {unreadCount > 0 && (
                                <span className='rounded-full bg-[#C25E2B] px-1.5 py-0.5 text-[10px] font-bold text-white'>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className='flex items-center gap-1'>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    title='Mark all as read'
                                    className='flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#68594E] transition hover:bg-[#FAF7F2] hover:text-[#C25E2B]'
                                >
                                    <CheckCheck size={13} />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className='grid h-7 w-7 place-items-center rounded-lg text-[#8C7A6D] transition hover:bg-[#FAF7F2] hover:text-[#261C14]'
                                aria-label='Close notifications'
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className='max-h-[380px] overflow-y-auto'>
                        {loading && notifications.length === 0 ? (
                            <div className='flex flex-col items-center justify-center gap-2 py-8 text-[#8C7A6D]'>
                                <span className='h-5 w-5 animate-spin rounded-full border-2 border-[#E2D9C8] border-t-[#C25E2B]' />
                                <span className='text-xs'>Loading…</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className='flex flex-col items-center gap-2 py-8 text-[#8C7A6D]'>
                                <Bell size={28} strokeWidth={1.5} />
                                <p className='text-xs font-medium'>No notifications yet</p>
                            </div>
                        ) : (
                            <ul>
                                {notifications.map((notif, i) => (
                                    <li key={notif._id}>
                                        <button
                                            onClick={() => handleItemClick(notif)}
                                            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#FAF7F2] ${
                                                !notif.isRead ? 'bg-[#C25E2B]/5' : ''
                                            }`}
                                        >
                                            <NotifIcon type={notif.type} />
                                            <div className='min-w-0 flex-1'>
                                                <div className='flex items-start justify-between gap-2'>
                                                    <p className={`text-xs font-bold leading-snug text-[#261C14] ${!notif.isRead ? 'text-[#C25E2B]' : ''}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className='shrink-0 text-[10px] text-[#8C7A6D]'>
                                                        {timeAgo(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className='mt-0.5 text-xs leading-relaxed text-[#68594E]'>
                                                    {notif.message}
                                                </p>
                                            </div>
                                            {!notif.isRead && (
                                                <span className='mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C25E2B]' />
                                            )}
                                        </button>
                                        {i < notifications.length - 1 && (
                                            <div className='mx-4 h-px bg-[#E2D9C8]' />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className='border-t border-[#E2D9C8] px-4 py-2 text-center'>
                            <p className='text-[10px] text-[#8C7A6D]'>
                                Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes notifSlide {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
