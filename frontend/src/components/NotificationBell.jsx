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
            <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f6ede2] text-[#bf5a31]'>
                <CalendarDays size={15} />
            </span>
        )
    return (
        <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eef4f1] text-[#1c3329]'>
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
                className='relative grid h-9 w-9 place-items-center rounded-xl border border-[#e5d8c8] bg-white text-[#3e2b20] transition hover:border-[#bf5a31] hover:text-[#bf5a31]'
            >
                <Bell size={17} />
                {unreadCount > 0 && (
                    <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#bf5a31] text-[9px] font-bold text-white ring-2 ring-white'>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    id='notification-panel'
                    className='absolute right-0 top-11 z-50 w-80 rounded-2xl border border-[#e8ddd0] bg-white shadow-xl sm:w-96'
                    style={{ animation: 'notifSlide 0.15s ease' }}
                >
                    {/* Header */}
                    <div className='flex items-center justify-between border-b border-[#f0e8de] px-4 py-3'>
                        <div className='flex items-center gap-2'>
                            <Bell size={15} className='text-[#bf5a31]' />
                            <span className='text-sm font-bold text-[#201711]'>Notifications</span>
                            {unreadCount > 0 && (
                                <span className='rounded-full bg-[#bf5a31] px-1.5 py-0.5 text-[10px] font-bold text-white'>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className='flex items-center gap-1'>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    title='Mark all as read'
                                    className='flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#786150] transition hover:bg-[#f6ede2] hover:text-[#bf5a31]'
                                >
                                    <CheckCheck size={13} />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className='grid h-7 w-7 place-items-center rounded-lg text-[#9e8a7a] transition hover:bg-[#f5ede3] hover:text-[#201711]'
                                aria-label='Close notifications'
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className='max-h-[420px] overflow-y-auto'>
                        {loading && notifications.length === 0 ? (
                            <div className='flex flex-col items-center justify-center gap-2 py-10 text-[#9e8a7a]'>
                                <span className='h-5 w-5 animate-spin rounded-full border-2 border-[#e8ddd0] border-t-[#bf5a31]' />
                                <span className='text-xs'>Loading…</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className='flex flex-col items-center gap-3 py-10 text-[#9e8a7a]'>
                                <Bell size={30} strokeWidth={1.5} />
                                <p className='text-sm font-medium'>No notifications yet</p>
                            </div>
                        ) : (
                            <ul>
                                {notifications.map((notif, i) => (
                                    <li key={notif._id}>
                                        <button
                                            onClick={() => handleItemClick(notif)}
                                            className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-[#faf6f0] ${
                                                !notif.isRead ? 'bg-[#fff9f5]' : ''
                                            }`}
                                        >
                                            <NotifIcon type={notif.type} />
                                            <div className='min-w-0 flex-1'>
                                                <div className='flex items-start justify-between gap-2'>
                                                    <p className={`text-xs font-bold leading-snug text-[#201711] ${!notif.isRead ? 'text-[#bf5a31]' : ''}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className='shrink-0 text-[10px] text-[#b0a090]'>
                                                        {timeAgo(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className='mt-0.5 text-xs leading-relaxed text-[#5f4637]'>
                                                    {notif.message}
                                                </p>
                                            </div>
                                            {!notif.isRead && (
                                                <span className='mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#bf5a31]' />
                                            )}
                                        </button>
                                        {i < notifications.length - 1 && (
                                            <div className='mx-4 h-px bg-[#f0e8de]' />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className='border-t border-[#f0e8de] px-4 py-2.5 text-center'>
                            <p className='text-[10px] text-[#b0a090]'>
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
