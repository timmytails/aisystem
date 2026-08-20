import {
    createElement,
    useEffect,
    useMemo,
    useState
} from 'react'

import {
    BarChart3,
    Bell,
    CalendarDays,
    CheckCheck,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    ClipboardList,
    Clock3,
    Image as ImageIcon,
    Inbox,
    LogOut,
    Mail,
    Megaphone,
    Menu,
    MessageSquare,
    PawPrint,
    Phone,
    RefreshCw,
    Scissors,
    Search,
    Send,
    Trash2,
    UserRound,
    Users,
    X,
    ZoomIn
} from 'lucide-react'

import {
    useNavigate
} from 'react-router-dom'

import toast from 'react-hot-toast'

import {
    adminApi,
    getErrorMessage
} from '../utils/api'

import { useAuth } from '../context/AuthContext'
import ConfirmModal from '../components/ConfirmModal'
import AdminCancelModal from '../components/AdminCancelModal'

const STATUS_META = {
    pending: {
        label: 'Pending',
        badge: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
    },
    confirmed: {
        label: 'Approved',
        badge: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200'
    },
    completed: {
        label: 'Completed',
        badge: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
    },
    cancelled: {
        label: 'Cancelled',
        badge: 'bg-red-100 text-red-700 ring-1 ring-red-200'
    }
}

const NAV_ITEMS = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: BarChart3
    },
    {
        id: 'bookings',
        label: 'Bookings',
        icon: ClipboardList
    },
    {
        id: 'schedule',
        label: 'Schedule',
        icon: CalendarDays
    },
    {
        id: 'messages',
        label: 'Messages',
        icon: Mail
    },
    {
        id: 'customers',
        label: 'Customers',
        icon: Users
    },
    {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell
    }
]

const BOOKING_FILTERS = [
    {
        id: '',
        label: 'All Bookings'
    },
    {
        id: 'pending',
        label: 'Pending'
    },
    {
        id: 'confirmed',
        label: 'Approved'
    },
    {
        id: 'completed',
        label: 'Completed'
    },
    {
        id: 'cancelled',
        label: 'Cancelled'
    }
]

const formatPeso = (value) =>
    new Intl.NumberFormat(
        'en-PH',
        {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0
        }
    ).format(Number(value) || 0)

const formatDate = (
    value,
    options = {}
) => {
    if (!value) return '—'

    const date =
        /^\d{4}-\d{2}-\d{2}$/.test(
            String(value)
        )
            ? new Date(
                `${value}T12:00:00`
            )
            : new Date(value)

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value)
    }

    return date.toLocaleDateString(
        'en-PH',
        {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            ...options
        }
    )
}

const formatShortDate = (value) =>
    formatDate(value, {
        month: 'short'
    })

const formatTime = (value) => {
    if (!value) return '—'

    const [
        hoursValue,
        minutesValue = '00'
    ] = String(value).split(':')

    const hours = Number(
        hoursValue
    )

    if (
        !Number.isFinite(hours)
    ) {
        return String(value)
    }

    const suffix =
        hours >= 12
            ? 'PM'
            : 'AM'

    const displayHours =
        hours % 12 || 12

    return `${displayHours}:${minutesValue} ${suffix}`
}

const dateKey = (date) => {
    const year =
        date.getFullYear()

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, '0')

    const day =
        String(
            date.getDate()
        ).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const startOfWeek = (
    source = new Date()
) => {
    const date =
        new Date(source)

    const day =
        date.getDay()

    const difference =
        day === 0
            ? -6
            : 1 - day

    date.setDate(
        date.getDate() +
        difference
    )

    date.setHours(
        12,
        0,
        0,
        0
    )

    return date
}

const buildWeek = (anchor) =>
    Array.from(
        {
            length: 7
        },
        (_, index) => {
            const date =
                new Date(anchor)

            date.setDate(
                anchor.getDate() +
                index
            )

            return date
        }
    )

const getOwnerName = (
    appointment
) =>
    appointment?.ownerName ||
    [
        appointment?.user
            ?.firstName,
        appointment?.user
            ?.lastName
    ]
        .filter(Boolean)
        .join(' ') ||
    'Customer'

const getInitials = (
    firstName,
    lastName
) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`
        .toUpperCase() ||
    'C'

const getCustomerAddress = (
    customer
) => {
    const address =
        customer?.address || {}

    return [
        address.street,
        address.barangay
            ? `Brgy. ${address.barangay}`
            : '',
        address.city,
        address.province
    ]
        .filter(Boolean)
        .join(', ') ||
        customer?.homeAddress ||
        'No address provided'
}

export default function Admin() {
    const navigate =
        useNavigate()

    const {
        user,
        logout
    } = useAuth()

    const [
        activeTab,
        setActiveTab
    ] = useState(
        'dashboard'
    )

    const [
        sidebarOpen,
        setSidebarOpen
    ] = useState(false)

    const [
        loading,
        setLoading
    ] = useState(true)

    const [
        refreshing,
        setRefreshing
    ] = useState(false)

    const [
        stats,
        setStats
    ] = useState(null)

    const [
        appointments,
        setAppointments
    ] = useState([])

    const [
        analytics,
        setAnalytics
    ] = useState(null)

    const [
        customers,
        setCustomers
    ] = useState([])

    const [
        contacts,
        setContacts
    ] = useState([])

    const [
        adminNotifications,
        setAdminNotifications
    ] = useState([])

    const [
        notifLoading,
        setNotifLoading
    ] = useState(false)

    const [
        bookingFilter,
        setBookingFilter
    ] = useState('')

    const [
        search,
        setSearch
    ] = useState('')

    const [
        selectedBookingId,
        setSelectedBookingId
    ] = useState(null)

    const [
        updatingId,
        setUpdatingId
    ] = useState(null)

    const [
        cancelModalAppointment,
        setCancelModalAppointment
    ] = useState(null)

    const [
        weekAnchor,
        setWeekAnchor
    ] = useState(
        startOfWeek()
    )

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        if (
            user.role !== 'admin'
        ) {
            toast.error(
                'Admin access required'
            )

            navigate('/')
        }
    }, [
        user,
        navigate
    ])

    const loadData = async (
        showRefresh = false
    ) => {
        if (showRefresh) {
            setRefreshing(true)
        } else {
            setLoading(true)
        }

        try {
            const [
                statsResult,
                appointmentsResult,
                analyticsResult,
                customersResult,
                contactsResult,
                notificationsResult
            ] = await Promise.allSettled([
                adminApi.getStats(),
                adminApi.getAppointments({ limit: 100 }),
                adminApi.getAnalytics(),
                adminApi.getUsers(),
                adminApi.getContacts(),
                adminApi.getNotifications()
            ])

            if (statsResult.status === 'fulfilled') {
                setStats(statsResult.value.data.stats || null)
            }
            if (appointmentsResult.status === 'fulfilled') {
                setAppointments(appointmentsResult.value.data.appointments || [])
            }
            if (analyticsResult.status === 'fulfilled') {
                setAnalytics(analyticsResult.value.data.analytics || null)
            }
            if (customersResult.status === 'fulfilled') {
                setCustomers(customersResult.value.data.users || [])
            }
            if (contactsResult.status === 'fulfilled') {
                setContacts(contactsResult.value.data.contacts || [])
            }
            if (notificationsResult.status === 'fulfilled') {
                setAdminNotifications(notificationsResult.value.data.notifications || [])
            }

            const rejected = [statsResult, appointmentsResult, analyticsResult, customersResult, contactsResult].find((r) => r.status === 'rejected')
            if (rejected && showRefresh) {
                toast.error(getErrorMessage(rejected.reason))
            }
        } catch (error) {
            toast.error(
                getErrorMessage(error)
            )
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        if (
            user?.role === 'admin'
        ) {
            queueMicrotask(loadData)
        }
    }, [user])

    const selectedBooking =
        useMemo(
            () =>
                appointments.find(
                    (item) =>
                        item._id ===
                        selectedBookingId
                ) || null,
            [
                appointments,
                selectedBookingId
            ]
        )

    const filteredAppointments =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase()

            return appointments
                .filter(
                    (appointment) =>
                        !bookingFilter ||
                        appointment.status ===
                        bookingFilter
                )
                .filter(
                    (appointment) => {
                        if (!query) {
                            return true
                        }

                        return [
                            appointment.petName,
                            appointment.breed,
                            appointment.service,
                            appointment.haircutStyle,
                            getOwnerName(
                                appointment
                            ),
                            appointment.ownerPhone,
                            appointment.ownerEmail
                        ]
                            .filter(Boolean)
                            .some((value) =>
                                String(value)
                                    .toLowerCase()
                                    .includes(
                                        query
                                    )
                            )
                    }
                )
                .sort(
                    (first, second) =>
                        new Date(
                            second.startAt ||
                            `${second.date}T${second.time}`
                        ) -
                        new Date(
                            first.startAt ||
                            `${first.date}T${first.time}`
                        )
                )
        }, [
            appointments,
            bookingFilter,
            search
        ])

    const today =
        dateKey(new Date())

    const todaysAppointments =
        useMemo(
            () =>
                appointments
                    .filter(
                        (appointment) =>
                            appointment.date ===
                            today
                    )
                    .sort(
                        (first, second) =>
                            String(
                                first.time
                            ).localeCompare(
                                String(
                                    second.time
                                )
                            )
                    ),
            [
                appointments,
                today
            ]
        )

    const pendingAppointments =
        useMemo(
            () =>
                appointments
                    .filter(
                        (appointment) =>
                            appointment.status ===
                            'pending'
                    )
                    .sort(
                        (first, second) =>
                            new Date(
                                first.startAt ||
                                `${first.date}T${first.time}`
                            ) -
                            new Date(
                                second.startAt ||
                                `${second.date}T${second.time}`
                            )
                    ),
            [appointments]
        )

    const monthlyAppointments =
        analytics?.monthlyData ||
        []

    const currentMonthKey =
        `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
        ).padStart(2, '0')}`

    const currentMonthData =
        monthlyAppointments.find(
            (item) =>
                item.monthKey ===
                currentMonthKey
        ) ||
        monthlyAppointments[
        monthlyAppointments.length -
        1
        ] ||
        {
            appointments: 0,
            revenue: 0
        }

    const aiPreviewBookings =
        appointments.filter(
            (appointment) =>
                appointment.aiPreviewUsed &&
                appointment.status !==
                'cancelled'
        )

    const eligibleStyleBookings =
        appointments.filter(
            (appointment) =>
                appointment.haircutStyle &&
                appointment.status !==
                'cancelled'
        )

    const aiUsageRate =
        eligibleStyleBookings.length
            ? Math.round(
                (aiPreviewBookings.length /
                    eligibleStyleBookings.length) *
                100
            )
            : 0

    const completedRate =
        appointments.length
            ? Math.round(
                (appointments.filter(
                    (appointment) =>
                        appointment.status ===
                        'completed'
                ).length /
                    appointments.length) *
                100
            )
            : 0

    const handleStatusUpdate =
        async (
            appointment,
            status,
            cancellationReason = ''
        ) => {
            if (
                appointment.status ===
                status
            ) {
                return
            }

            if (
                [
                    'completed',
                    'cancelled'
                ].includes(
                    appointment.status
                )
            ) {
                toast.error(
                    `This booking is already ${STATUS_META[appointment.status]?.label.toLowerCase()}`
                )

                return
            }

            if (status === 'cancelled' && !cancellationReason) {
                setCancelModalAppointment(appointment)
                return
            }

            setUpdatingId(
                appointment._id
            )

            try {
                await adminApi.updateStatus(
                    appointment._id,
                    status,
                    cancellationReason
                )

                toast.success(
                    `Booking marked as ${STATUS_META[status]?.label || status}`
                )

                if (cancelModalAppointment) {
                    setCancelModalAppointment(null)
                }

                await loadData(true)
            } catch (error) {
                toast.error(
                    getErrorMessage(error)
                )
            } finally {
                setUpdatingId(null)
            }
        }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const changeTab = (tab) => {
        setActiveTab(tab)
        setSidebarOpen(false)
    }

    const unreadContactsCount = useMemo(() => (contacts || []).filter((c) => c && !c.read).length, [contacts])

    if (loading) {
        return (
            <div className='grid min-h-screen place-items-center bg-[#fbf7f1] text-[#244936]'>
                <div className='text-center'>
                    <RefreshCw
                        className='mx-auto animate-spin'
                        size={30}
                    />

                    <p className='mt-3 font-semibold'>
                        Loading administration data
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#f5f0ea] text-[#201711]'>
            <AdminSidebar
                activeTab={
                    activeTab
                }
                onChange={
                    changeTab
                }
                pendingCount={
                    pendingAppointments.length
                }
                unreadContactsCount={
                    unreadContactsCount
                }
                user={user}
                open={
                    sidebarOpen
                }
                onClose={() =>
                    setSidebarOpen(false)
                }
                onLogout={
                    handleLogout
                }
            />

            <div className='min-h-screen lg:pl-[240px]'>
                <header className='sticky top-0 z-30 flex h-[58px] items-center justify-between border-b border-[#e0d3c3] bg-white/95 px-4 shadow-sm backdrop-blur-sm sm:px-6'>
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className='grid h-9 w-9 place-items-center rounded-lg text-[#244936] transition hover:bg-[#f0e8dd] lg:hidden'
                            aria-label='Open navigation'
                        >
                            <Menu size={20} />
                        </button>

                        <div>
                            <h1 className='font-serif text-lg font-bold capitalize leading-tight sm:text-xl'>
                                {activeTab === 'messages' ? 'Contact Messages' : activeTab}
                            </h1>
                            <p className='hidden text-[10px] font-medium text-[#9c7b68] sm:block'>TimmyTails Admin Portal</p>
                        </div>
                    </div>

                    <div className='flex items-center gap-2.5'>
                        <span className='hidden rounded-lg bg-[#f0e8dd] px-3 py-1.5 font-mono text-[11px] font-medium text-[#7a5a48] sm:inline'>
                            {formatDate(new Date())}
                        </span>

                        <button
                            onClick={() => loadData(true)}
                            disabled={refreshing}
                            className='grid h-8 w-8 place-items-center rounded-lg border border-[#e0d3c3] bg-white text-[#a94723] transition hover:bg-[#f7efe5] disabled:opacity-40'
                            aria-label='Refresh data'
                        >
                            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                        </button>

                        {pendingAppointments.length > 0 && (
                            <span className='inline-flex items-center gap-1.5 rounded-lg bg-[#bf5a31] px-2.5 py-1.5 text-xs font-bold text-white' title='Pending appointments'>
                                <Clock3 size={12} />
                                {pendingAppointments.length} pending
                            </span>
                        )}
                    </div>
                </header>

                <main className='p-4 sm:p-6'>
                    {activeTab ===
                        'dashboard' && (
                            <DashboardView
                                stats={
                                    stats
                                }
                                todaysAppointments={
                                    todaysAppointments
                                }
                                pendingAppointments={
                                    pendingAppointments
                                }
                                updatingId={
                                    updatingId
                                }
                                onStatusUpdate={
                                    handleStatusUpdate
                                }
                                onViewBookings={() =>
                                    changeTab(
                                        'bookings'
                                    )
                                }
                            />
                        )}

                    {activeTab ===
                        'bookings' && (
                            <BookingsView
                                appointments={
                                    filteredAppointments
                                }
                                filter={
                                    bookingFilter
                                }
                                onFilter={
                                    setBookingFilter
                                }
                                search={
                                    search
                                }
                                onSearch={
                                    setSearch
                                }
                                selected={
                                    selectedBooking
                                }
                                onSelect={
                                    setSelectedBookingId
                                }
                                updatingId={
                                    updatingId
                                }
                                onStatusUpdate={
                                    handleStatusUpdate
                                }
                            />
                        )}

                    {activeTab ===
                        'schedule' && (
                            <ScheduleView
                                appointments={appointments}
                                weekAnchor={weekAnchor}
                                onStatusUpdate={handleStatusUpdate}
                                updatingId={updatingId}
                                onPrevious={() => {
                                    const next = new Date(weekAnchor)
                                    next.setDate(next.getDate() - 7)
                                    setWeekAnchor(next)
                                }}
                                onNext={() => {
                                    const next = new Date(weekAnchor)
                                    next.setDate(next.getDate() + 7)
                                    setWeekAnchor(next)
                                }}
                                onToday={() => setWeekAnchor(startOfWeek())}
                            />
                        )}

                    {activeTab ===
                        'messages' && (
                            <ContactsView
                                contacts={contacts}
                                onRefresh={() => loadData(true)}
                            />
                        )}

                    {activeTab ===
                        'customers' && (
                            <CustomersView
                                customers={
                                    customers
                                }
                            />
                        )}

                    {activeTab ===
                        'analytics' && (
                            <AnalyticsView
                                analytics={
                                    analytics
                                }
                                currentMonthData={
                                    currentMonthData
                                }
                                appointments={
                                    appointments
                                }
                                aiUsageRate={
                                    aiUsageRate
                                }
                                completedRate={
                                    completedRate
                                }
                            />
                        )}

                    {activeTab === 'notifications' && (
                        <NotificationsView
                            notifications={adminNotifications}
                            customers={customers}
                            loading={notifLoading}
                            onSend={async (payload) => {
                                setNotifLoading(true)
                                try {
                                    await adminApi.createNotification(payload)
                                    toast.success('Notification sent successfully!')
                                    const res = await adminApi.getNotifications()
                                    setAdminNotifications(res.data.notifications || [])
                                } catch (err) {
                                    toast.error(getErrorMessage(err))
                                } finally {
                                    setNotifLoading(false)
                                }
                            }}
                        />
                    )}
                </main>
            </div>

            <AdminCancelModal
                isOpen={Boolean(cancelModalAppointment)}
                appointment={cancelModalAppointment}
                loading={Boolean(updatingId)}
                onConfirm={(reason) => {
                    if (cancelModalAppointment) {
                        handleStatusUpdate(cancelModalAppointment, 'cancelled', reason)
                    }
                }}
                onClose={() => setCancelModalAppointment(null)}
            />
        </div>
    )
}

function AdminSidebar({
    activeTab,
    onChange,
    pendingCount,
    unreadContactsCount,
    user,
    open,
    onClose,
    onLogout
}) {
    return (
        <>
            {open && (
                <button
                    type='button'
                    onClick={onClose}
                    className='fixed inset-0 z-40 bg-black/35 lg:hidden'
                    aria-label='Close navigation overlay'
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col bg-[#1c3329] text-white transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo */}
                <div className='flex h-[70px] items-center justify-between border-b border-white/8 px-5'>
                    <div className='flex items-center gap-3'>
                        <span className='grid h-9 w-9 place-items-center rounded-xl bg-[#bf5a31]'>
                            <PawPrint size={17} />
                        </span>
                        <div>
                            <p className='font-serif text-base font-bold leading-tight'>Timmy Tails</p>
                            <p className='text-[10px] font-medium uppercase tracking-widest text-white/40'>Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className='grid h-8 w-8 place-items-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white lg:hidden'
                        aria-label='Close navigation'
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className='flex-1 space-y-0.5 px-3 py-4'>
                    {NAV_ITEMS.map(({ id, label, icon }) => {
                        const isActive = activeTab === id
                        return (
                            <button
                                key={id}
                                onClick={() => onChange(id)}
                                className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
                                    isActive
                                        ? 'bg-white/12 text-white'
                                        : 'text-white/55 hover:bg-white/7 hover:text-white'
                                }`}
                            >
                                {isActive && (
                                    <span className='absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#bf5a31]' />
                                )}
                                {createElement(icon, { size: 16 })}
                                <span className='flex-1'>{label}</span>
                                {id === 'bookings' && pendingCount > 0 && (
                                    <span className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#bf5a31] px-1.5 text-[10px] font-bold text-white'>
                                        {pendingCount}
                                    </span>
                                )}
                                {id === 'messages' && unreadContactsCount > 0 && (
                                    <span className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#bf5a31] px-1.5 text-[10px] font-bold text-white'>
                                        {unreadContactsCount}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* User Footer */}
                <div className='border-t border-white/8 p-4'>
                    <div className='mb-3 flex items-center gap-3'>
                        <span className='grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-bold'>
                            {(user?.firstName?.[0] || 'A').toUpperCase()}
                        </span>
                        <div className='min-w-0'>
                            <p className='truncate text-sm font-semibold text-white'>{user?.firstName || 'Admin'}</p>
                            <p className='truncate text-[10px] text-white/40'>{user?.email || user?.phone}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className='flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/50 transition hover:bg-white/8 hover:text-white'
                    >
                        <LogOut size={15} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    )
}

function DashboardView({
    stats,
    todaysAppointments,
    pendingAppointments,
    updatingId,
    onStatusUpdate,
    onViewBookings
}) {
    const confirmedToday =
        todaysAppointments.filter(
            (item) =>
                item.status ===
                'confirmed'
        ).length

    return (
        <div className='space-y-6'>
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                <MetricCard
                    icon={
                        CalendarDays
                    }
                    value={
                        stats?.todayAppointments ??
                        todaysAppointments.length
                    }
                    label="Today's Appointments"
                    tone='orange'
                />

                <MetricCard
                    icon={Clock3}
                    value={
                        stats?.pendingAppointments ??
                        pendingAppointments.length
                    }
                    label='Pending Approval'
                    tone='amber'
                />

                <MetricCard
                    icon={
                        CheckCircle2
                    }
                    value={
                        confirmedToday
                    }
                    label='Approved Today'
                    tone='blue'
                />

                <MetricCard
                    icon={
                        CircleDollarSign
                    }
                    value={formatPeso(
                        stats?.todayRevenue
                    )}
                    label="Today's Revenue"
                    tone='green'
                    compact
                />
            </div>

            <section className='overflow-hidden rounded-2xl border border-[#e0d3c3] bg-white shadow-xs'>
                <div className='flex items-center justify-between border-b border-[#e0d3c3] px-5 py-4'>
                    <div>
                        <h2 className='font-serif text-lg font-bold'>Today&apos;s Schedule</h2>
                        <p className='mt-0.5 text-xs text-[#9c7b68]'>{formatDate(new Date())}</p>
                    </div>
                    <button
                        onClick={onViewBookings}
                        className='rounded-lg border border-[#e0d3c3] px-3 py-1.5 text-xs font-semibold text-[#b84c25] transition hover:bg-[#fdf6ee]'
                    >
                        View all →
                    </button>
                </div>

                {todaysAppointments.length ? (
                    <div>
                        {todaysAppointments.map((appointment) => (
                            <ScheduleRow key={appointment._id} appointment={appointment} />
                        ))}
                    </div>
                ) : (
                    <EmptyPanel icon={CalendarDays} message='No appointments scheduled for today.' />
                )}
            </section>

            <section className='overflow-hidden rounded-2xl border border-amber-200 bg-amber-50'>
                <div className='flex items-center justify-between border-b border-amber-200 px-5 py-4'>
                    <div className='flex items-center gap-2.5'>
                        <span className='grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-700'>
                            <Clock3 size={16} />
                        </span>
                        <div>
                            <h2 className='font-serif text-lg font-bold text-amber-900'>Pending Approvals</h2>
                            <p className='text-[11px] text-amber-700'>{pendingAppointments.length} booking{pendingAppointments.length !== 1 ? 's' : ''} awaiting review</p>
                        </div>
                    </div>
                </div>

                <div className='space-y-2 p-4'>
                    {pendingAppointments.length ? (
                        pendingAppointments.slice(0, 6).map((appointment) => (
                            <div
                                key={appointment._id}
                                className='flex flex-col gap-3 rounded-xl border border-amber-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center'
                            >
                                <PetAvatar appointment={appointment} />

                                <div className='min-w-0 flex-1'>
                                    <div className='flex flex-wrap items-center gap-1.5'>
                                        <p className='font-bold text-[#2b2019]'>{appointment.petName}</p>
                                        <span className='text-[#9c7b68]'>·</span>
                                        <p className='text-sm text-[#5f4637]'>{getOwnerName(appointment)}</p>
                                    </div>
                                    <p className='mt-1 text-xs text-[#806654]'>
                                        {appointment.service} · {formatDate(appointment.date)} · {formatTime(appointment.time)}
                                    </p>
                                    {appointment.notes && (
                                        <p className='mt-1 truncate text-xs italic text-amber-700'>&ldquo;{appointment.notes}&rdquo;</p>
                                    )}
                                </div>

                                <div className='flex shrink-0 gap-2'>
                                    <button
                                        disabled={updatingId === appointment._id}
                                        onClick={() => onStatusUpdate(appointment, 'confirmed')}
                                        className='rounded-lg bg-[#1c3329] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#244936] disabled:opacity-50'
                                    >
                                        Approve
                                    </button>
                                    <button
                                        disabled={updatingId === appointment._id}
                                        onClick={() => onStatusUpdate(appointment, 'cancelled')}
                                        className='rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50'
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='flex items-center gap-3 rounded-xl border border-amber-100 bg-white p-4'>
                            <CheckCircle2 size={18} className='text-emerald-500' />
                            <p className='text-sm text-[#5f4637]'>All bookings have been reviewed. No pending approvals.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

function MetricCard({
    icon,
    value,
    label,
    tone,
    compact = false
}) {
    const config = {
        orange: { text: 'text-[#bf5a31]', bg: 'bg-[#fdf1ea]', bar: 'bg-[#bf5a31]' },
        amber:  { text: 'text-amber-700',  bg: 'bg-amber-50',  bar: 'bg-amber-400' },
        blue:   { text: 'text-blue-700',   bg: 'bg-blue-50',   bar: 'bg-blue-500' },
        green:  { text: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-500' }
    }
    const c = config[tone] || config.orange

    return (
        <div className='relative overflow-hidden rounded-2xl border border-[#e0d3c3] bg-white p-5 shadow-xs'>
            <span className={`absolute left-0 top-0 h-full w-1 ${c.bar}`} />
            <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-xl ${c.bg}`}>
                {createElement(icon, { size: 20, className: c.text })}
            </div>
            <p className={`font-serif font-bold ${compact ? 'text-2xl' : 'text-3xl'} ${c.text}`}>
                {value}
            </p>
            <p className='mt-1.5 text-xs font-medium text-[#9c7b68]'>{label}</p>
        </div>
    )
}

function ScheduleRow({ appointment }) {
    return (
        <div className='flex items-center gap-4 border-b border-[#ede4d8] px-5 py-3.5 last:border-b-0 hover:bg-[#fdf8f4]'>
            <PetAvatar appointment={appointment} />

            <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-2'>
                    <p className='text-sm font-bold text-[#2b2019]'>{appointment.petName}</p>
                    <span className='text-xs text-[#9c7b68]'>{getOwnerName(appointment)}</span>
                    <StatusBadge status={appointment.status} />
                </div>
                <p className='mt-0.5 text-xs text-[#9c7b68]'>
                    {appointment.service}{appointment.haircutStyle ? ` · ${appointment.haircutStyle}` : ''}
                </p>
            </div>

            <div className='shrink-0 text-right'>
                <p className='font-mono text-sm font-semibold text-[#b84c25]'>{formatTime(appointment.time)}</p>
                {appointment.endTime && (
                    <p className='text-[10px] text-[#9c7b68]'>→ {formatTime(appointment.endTime)}</p>
                )}
            </div>
        </div>
    )
}

function BookingsView({
    appointments,
    filter,
    onFilter,
    search,
    onSearch,
    selected,
    onSelect,
    updatingId,
    onStatusUpdate
}) {
    return (
        <div>
            <div className='mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
                <div className='flex items-center gap-1 rounded-xl border border-[#e0d3c3] bg-white p-1 shadow-xs'>
                    {BOOKING_FILTERS.map((item) => (
                        <button
                            key={item.id || 'all'}
                            onClick={() => onFilter(item.id)}
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                                filter === item.id
                                    ? 'bg-[#1c3329] text-white shadow-xs'
                                    : 'text-[#5f4637] hover:bg-[#f5ede3]'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <label className='relative block w-full xl:w-64'>
                    <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-[#9c8575]' />
                    <input
                        value={search}
                        onChange={(event) => onSearch(event.target.value)}
                        placeholder='Search bookings'
                        className='h-9 w-full rounded-xl border border-[#e0d3c3] bg-white pl-9 pr-4 text-sm shadow-xs outline-none transition focus:border-[#bf5a31] focus:ring-1 focus:ring-[#bf5a31]/20'
                    />
                </label>
            </div>

            <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]'>
                <div className='space-y-3'>
                    {appointments.length ? (
                        appointments.map((appointment) => (
                            <button
                                key={appointment._id}
                                onClick={() => onSelect(appointment._id)}
                                className={`flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-xs transition-all duration-150 ${
                                    selected?._id === appointment._id
                                        ? 'border-[#bf5a31] ring-2 ring-[#bf5a31]/20'
                                        : 'border-[#e0d3c3] hover:border-[#c9a88e] hover:shadow-sm'
                                }`}
                            >
                                <PetAvatar appointment={appointment} />

                                <div className='min-w-0 flex-1'>
                                    <div className='flex flex-wrap items-center gap-2'>
                                        <p className='font-bold text-[#2b2019]'>{appointment.petName}</p>
                                        <StatusBadge status={appointment.status} />
                                    </div>
                                    <p className='mt-0.5 truncate text-xs text-[#9c7b68]'>
                                        {getOwnerName(appointment)} · {appointment.service}
                                    </p>
                                    <p className='mt-0.5 font-mono text-xs font-semibold text-[#b84c25]'>
                                        {formatShortDate(appointment.date)} · {formatTime(appointment.time)}
                                    </p>
                                </div>

                                <div className='shrink-0 text-right'>
                                    <p className='font-bold text-[#2b2019]'>{formatPeso(appointment.price)}</p>
                                    <p className='mt-0.5 text-[10px] text-[#9c7b68]'>
                                        {appointment.aiPreviewUsed ? 'AI preview' : 'Standard'}
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <EmptyPanel icon={ClipboardList} message='No bookings match the selected filter.' />
                    )}
                </div>

                <div className='xl:sticky xl:top-[82px] xl:self-start'>
                    {selected ? (
                        <BookingDetail
                            appointment={selected}
                            updating={updatingId === selected._id}
                            onStatusUpdate={onStatusUpdate}
                        />
                    ) : (
                        <div className='grid min-h-[220px] place-items-center rounded-2xl border border-dashed border-[#e0d3c3] bg-white p-6 text-center'>
                            <div>
                                <span className='mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[#f5ede3] text-[#c9956a]'>
                                    <ClipboardList size={24} />
                                </span>
                                <p className='font-semibold text-[#2b2019]'>No booking selected</p>
                                <p className='mt-1 text-xs text-[#9c7b68]'>Click any booking on the left to view its details and actions.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function BookingDetail({
    appointment,
    updating,
    onStatusUpdate
}) {
    const [preview, setPreview] = useState(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [previewError, setPreviewError] = useState('')
    const [previewOpen, setPreviewOpen] = useState(false)

    useEffect(() => {
        let active = true

        queueMicrotask(() => {
            if (!active) return
            setPreview(null)
            setPreviewError('')
            setPreviewOpen(false)
            setPreviewLoading(
                Boolean(appointment?.aiPreviewUsed)
            )
        })

        if (!appointment?.aiPreviewUsed) {
            return () => { active = false }
        }

        adminApi.getAppointmentPreview(appointment._id)
            .then(({ data }) => {
                if (!active) return
                setPreview(data.preview || null)
            })
            .catch((error) => {
                if (!active) return
                setPreviewError(getErrorMessage(error))
            })
            .finally(() => {
                if (active) setPreviewLoading(false)
            })

        return () => {
            active = false
        }
    }, [appointment?._id, appointment?.aiPreviewUsed])

    const statusActions = [
        'pending',
        'confirmed',
        'completed',
        'cancelled'
    ]

    return (
        <aside className='rounded-2xl border border-[#eadbc9] bg-white p-5'>
            <div className='flex items-center gap-4'>
                <PetAvatar
                    appointment={
                        appointment
                    }
                    large
                />

                <div>
                    <h2 className='font-serif text-2xl font-bold'>
                        {
                            appointment.petName
                        }
                    </h2>

                    <p className='text-sm text-[#806654]'>
                        {
                            appointment.breed
                        }
                    </p>
                </div>
            </div>

            <dl className='mt-6 space-y-4 text-sm'>
                <DetailRow
                    label='Customer'
                    value={getOwnerName(
                        appointment
                    )}
                />

                <DetailRow
                    label='Phone'
                    value={
                        appointment.ownerPhone ||
                        '—'
                    }
                />

                <DetailRow
                    label='Email'
                    value={
                        appointment.ownerEmail ||
                        '—'
                    }
                />

                <DetailRow
                    label='Service'
                    value={
                        appointment.service
                    }
                />

                <DetailRow
                    label='Hairstyle'
                    value={
                        appointment.haircutStyle ||
                        'None'
                    }
                />

                <DetailRow
                    label='Date'
                    value={formatDate(
                        appointment.date
                    )}
                />

                <DetailRow
                    label='Time'
                    value={`${formatTime(
                        appointment.time
                    )}${appointment.endTime
                            ? ` – ${formatTime(appointment.endTime)}`
                            : ''
                        }`}
                />

                <DetailRow
                    label='Amount'
                    value={formatPeso(
                        appointment.price
                    )}
                />

                <DetailRow
                    label='AI preview'
                    value={
                        appointment.aiPreviewUsed
                            ? 'Used'
                            : 'Not used'
                    }
                />
            </dl>

            {appointment.aiPreviewUsed && (
                <div className='mt-6 rounded-2xl border border-[#eadbc9] bg-[#fcfaf7] p-4'>
                    <div className='flex items-center justify-between gap-3'>
                        <div>
                            <p className='font-mono text-[10px] uppercase tracking-[0.14em] text-[#8c6a57]'>
                                Grooming reference
                            </p>
                            <p className='mt-1 text-sm font-semibold text-[#3f322a]'>
                                {appointment.haircutStyle || 'Selected style'}
                            </p>
                        </div>
                        {preview && (
                            <span className='rounded-full bg-[#eef5f1] px-2.5 py-1 text-[10px] font-semibold text-[#315c49]'>
                                {preview.seasonLabel || 'AI preview'}
                            </span>
                        )}
                    </div>

                    {previewLoading ? (
                        <div className='mt-3 grid h-44 place-items-center rounded-xl bg-white text-sm text-[#806654]'>
                            Loading saved preview...
                        </div>
                    ) : preview?.image ? (
                        <button
                            type='button'
                            onClick={() => setPreviewOpen(true)}
                            className='group relative mt-3 block w-full overflow-hidden rounded-xl border border-[#eadbc9] bg-white'
                            title='Enlarge grooming preview'
                        >
                            <img
                                src={preview.image}
                                alt={`${appointment.petName} ${appointment.haircutStyle || ''} grooming preview`}
                                className='h-52 w-full object-contain transition group-hover:scale-[1.01]'
                            />
                            <span className='absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-[#244936] px-3 py-1.5 text-xs font-semibold text-white shadow-sm'>
                                <ZoomIn size={14} /> Enlarge
                            </span>
                        </button>
                    ) : (
                        <div className='mt-3 rounded-xl border border-dashed border-[#d9c7b6] bg-white p-4 text-center text-xs leading-5 text-[#806654]'>
                            <ImageIcon size={24} className='mx-auto mb-2 text-[#c88968]' />
                            {previewError || 'This older booking did not save an AI preview image.'}
                        </div>
                    )}

                    <p className='mt-3 text-xs leading-5 text-[#806654]'>
                        Use this customer-selected AI preview only as a visual grooming reference. The groomer should still confirm coat and safety suitability.
                    </p>
                </div>
            )}

            {appointment.notes && (
                <div className='mt-5 rounded-xl bg-[#f8f1e8] p-3 text-sm text-[#6f5545]'>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em]'>
                        Notes
                    </p>

                    <p className='mt-1'>
                        {
                            appointment.notes
                        }
                    </p>
                </div>
            )}

            <div className='mt-6'>
                <p className='mb-3 font-mono text-xs uppercase tracking-[0.14em] text-[#8c6a57]'>
                    Update status
                </p>

                <div className='space-y-2'>
                    {statusActions.map(
                        (status) => (
                            <button
                                key={
                                    status
                                }
                                disabled={
                                    updating ||
                                    [
                                        'completed',
                                        'cancelled'
                                    ].includes(
                                        appointment.status
                                    )
                                }
                                onClick={() =>
                                    onStatusUpdate(
                                        appointment,
                                        status
                                    )
                                }
                                className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${appointment.status ===
                                        status
                                        ? 'bg-[#244936] text-white'
                                        : 'bg-[#f8f3ec] text-[#5f4637] hover:bg-[#eee2d5]'
                                    }`}
                            >
                                {
                                    STATUS_META[
                                        status
                                    ].label
                                }
                            </button>
                        )
                    )}
                </div>
            </div>

            {previewOpen && preview?.image && (
                <div
                    className='fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4'
                    onClick={() => setPreviewOpen(false)}
                >
                    <div
                        className='relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white p-4 shadow-2xl sm:p-6'
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type='button'
                            onClick={() => setPreviewOpen(false)}
                            className='absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-[#3f322a] shadow-md hover:bg-[#f7f2eb]'
                            aria-label='Close enlarged preview'
                        >
                            <X size={20} />
                        </button>

                        <div className='pr-12'>
                            <p className='font-serif text-2xl font-bold'>
                                {appointment.petName} — {appointment.haircutStyle || 'Grooming preview'}
                            </p>
                            <p className='mt-1 text-sm text-[#806654]'>
                                Customer-selected AI grooming reference
                            </p>
                        </div>

                        <div className='mt-5 flex max-h-[75vh] items-center justify-center overflow-auto rounded-2xl bg-[#f7f2eb]'>
                            <img
                                src={preview.image}
                                alt='Enlarged AI grooming preview'
                                className='max-h-[75vh] max-w-full object-contain'
                            />
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}

function ScheduleView({
    appointments,
    weekAnchor,
    onPrevious,
    onNext,
    onToday,
    onStatusUpdate,
    updatingId
}) {
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [fetchedAiPreview, setFetchedAiPreview] = useState(null)
    const [fetchingPreview, setFetchingPreview] = useState(false)
    const [enlargedImage, setEnlargedImage] = useState(null)

    const [statusFilter, setStatusFilter] = useState('all')

    const week = buildWeek(weekAnchor)

    const hours = [
        '08:00',
        '10:00',
        '12:00',
        '14:00'
    ]

    const totalCount = appointments.filter((a) => a.status !== 'cancelled').length
    const approvedCount = appointments.filter((a) => ['confirmed', 'completed'].includes(a.status)).length
    const pendingCount = appointments.filter((a) => a.status === 'pending').length

    const activeAppointments = appointments.filter((appointment) => {
        if (appointment.status === 'cancelled') return false
        if (statusFilter === 'confirmed') return ['confirmed', 'completed'].includes(appointment.status)
        if (statusFilter === 'pending') return appointment.status === 'pending'
        return true
    })

    useEffect(() => {
        if (!selectedAppointment?._id) return
        const fresh = appointments.find((a) => a._id === selectedAppointment._id)
        if (fresh && fresh.status !== selectedAppointment.status) {
            setSelectedAppointment(fresh)
        }
    }, [appointments, selectedAppointment?._id, selectedAppointment?.status])

    useEffect(() => {
        if (!selectedAppointment?._id) {
            setFetchedAiPreview(null)
            return
        }

        if (selectedAppointment.aiPreviewUsed || selectedAppointment.haircutStyle) {
            setFetchingPreview(true)
            adminApi.getAppointmentPreview(selectedAppointment._id)
                .then(({ data }) => {
                    if (data?.preview?.image) {
                        setFetchedAiPreview(data.preview.image)
                    }
                })
                .catch(() => {})
                .finally(() => setFetchingPreview(false))
        } else {
            setFetchedAiPreview(null)
        }
    }, [selectedAppointment?._id])

    const aiPreviewImg = fetchedAiPreview || selectedAppointment?.generatedImagePreviewUrl || selectedAppointment?.previewImage || selectedAppointment?.aiPreviewImage
    const petPhotoImg = selectedAppointment?.pet?.photoUrl || selectedAppointment?.petPhotoUrl || selectedAppointment?.photoUrl || selectedAppointment?.sourcePhoto

    return (
        <section className='overflow-hidden rounded-2xl border border-[#e0d3c3] bg-white shadow-xs'>
            <div className='flex flex-col gap-3 border-b border-[#e0d3c3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                    <h2 className='font-serif text-lg font-bold'>Weekly Schedule</h2>
                    <p className='mt-0.5 text-xs text-[#9c7b68]'>
                        {formatDate(week[0])} – {formatDate(week[6])}
                    </p>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                    {/* Status Filter Buttons */}
                    <div className='flex items-center gap-0.5 rounded-xl border border-[#e0d3c3] bg-[#f5f0ea] p-1'>
                        <button
                            type='button'
                            onClick={() => setStatusFilter('all')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                statusFilter === 'all'
                                    ? 'bg-[#1c3329] text-white shadow-xs'
                                    : 'text-[#5f4637] hover:bg-white'
                            }`}
                        >
                            All · {totalCount}
                        </button>
                        <button
                            type='button'
                            onClick={() => setStatusFilter('confirmed')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                statusFilter === 'confirmed'
                                    ? 'bg-blue-700 text-white shadow-xs'
                                    : 'text-[#5f4637] hover:bg-white'
                            }`}
                        >
                            Approved · {approvedCount}
                        </button>
                        <button
                            type='button'
                            onClick={() => setStatusFilter('pending')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                statusFilter === 'pending'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-[#5f4637] hover:bg-white'
                            }`}
                        >
                            Pending · {pendingCount}
                        </button>
                    </div>

                    <div className='flex items-center gap-1'>
                        <button
                            onClick={onPrevious}
                            className='grid h-8 w-8 place-items-center rounded-lg border border-[#e0d3c3] bg-white text-[#5f4637] transition hover:bg-[#f5ede3]'
                            aria-label='Previous week'
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={onToday}
                            className='h-8 rounded-lg border border-[#e0d3c3] bg-white px-3 text-xs font-bold text-[#5f4637] transition hover:bg-[#f5ede3]'
                        >
                            Today
                        </button>
                        <button
                            onClick={onNext}
                            className='grid h-8 w-8 place-items-center rounded-lg border border-[#e0d3c3] bg-white text-[#5f4637] transition hover:bg-[#f5ede3]'
                            aria-label='Next week'
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className='overflow-x-auto'>
                <div className='min-w-[1050px]'>
                    <div className='grid grid-cols-[110px_repeat(7,minmax(130px,1fr))]'>
                        <div className='border-b border-r border-[#eadbc9] bg-[#fbf7f1] p-3 font-mono text-xs uppercase text-[#806654]'>
                            Time
                        </div>

                        {week.map((date) => (
                            <div
                                key={dateKey(date)}
                                className={`border-b border-r border-[#eadbc9] p-3 text-center last:border-r-0 ${dateKey(date) === dateKey(new Date()) ? 'bg-[#fff3ea]' : 'bg-white'}`}
                            >
                                <p className='text-xs text-[#806654]'>
                                    {date.toLocaleDateString('en-PH', { weekday: 'short' })}
                                </p>

                                <p className='font-serif text-lg font-bold'>
                                    {date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        ))}

                        {hours.flatMap((hour) => [
                            <div
                                key={`time-${hour}`}
                                className='min-h-[86px] border-b border-r border-[#eadbc9] bg-[#fbf7f1] p-3 font-mono text-xs text-[#806654]'
                            >
                                {formatTime(hour)}
                            </div>,

                            ...week.map((date) => {
                                const key = dateKey(date)

                                const items = activeAppointments.filter(
                                    (appointment) =>
                                        appointment.date === key &&
                                        appointment.time?.slice(0, 2) === hour.slice(0, 2)
                                )

                                return (
                                    <div
                                        key={`${key}-${hour}`}
                                        className='min-h-[86px] border-b border-r border-[#eadbc9] p-2 last:border-r-0'
                                    >
                                        {items.map((appointment) => {
                                            const displayImg = appointment.pet?.photoUrl || appointment.petPhotoUrl || appointment.photoUrl || appointment.generatedImagePreviewUrl || appointment.previewImage || appointment.aiPreviewImage
                                            return (
                                                <button
                                                    key={appointment._id}
                                                    type='button'
                                                    onClick={() => setSelectedAppointment(appointment)}
                                                    className='mb-1.5 w-full rounded-xl border border-[#d8b59e] bg-[#fff4ed] p-2 text-left text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b84c25] hover:bg-[#fff0e6] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#b84c25]'
                                                    title='Click to view appointment details'
                                                >
                                                    <div className='flex items-center gap-2'>
                                                        {displayImg ? (
                                                            <img
                                                                src={displayImg}
                                                                alt={appointment.petName}
                                                                className='h-8 w-8 shrink-0 rounded-lg border border-[#e5d6c5] object-cover bg-white'
                                                            />
                                                        ) : (
                                                            <div className='grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#e5d6c5] bg-white text-[#9c4424] font-bold text-[10px]'>
                                                                {appointment.petName?.[0] || 'P'}
                                                            </div>
                                                        )}
                                                        <div className='min-w-0 flex-1'>
                                                            <div className='flex items-center justify-between gap-1'>
                                                                <p className='truncate font-bold text-[#2b2019]'>
                                                                    {appointment.petName}
                                                                </p>
                                                                <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${appointment.status === 'confirmed' ? 'bg-blue-500' : appointment.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                            </div>

                                                            <p className='truncate text-[10px] text-[#806654]'>
                                                                {appointment.service}
                                                            </p>

                                                            <p className='font-mono text-[9px] font-bold text-[#b84c25]'>
                                                                {formatTime(appointment.time)}
                                                                {appointment.endTime ? `–${formatTime(appointment.endTime)}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )
                            })
                        ])}
                    </div>
                </div>
            </div>

            {/* Appointment Details Modal */}
            {selectedAppointment && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
                    onClick={() => setSelectedAppointment(null)}
                >
                    <div
                        className='relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8'
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className='flex items-start justify-between gap-4 border-b border-[#eadbc9] pb-5'>
                            <div>
                                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${STATUS_META[selectedAppointment.status]?.badge || 'bg-gray-100 text-gray-800'}`}>
                                    {STATUS_META[selectedAppointment.status]?.label || selectedAppointment.status}
                                </span>
                                <h3 className='mt-2 font-serif text-3xl font-bold text-[#2b2019]'>
                                    {selectedAppointment.petName}’s Appointment
                                </h3>
                                <p className='mt-1 text-xs text-[#806654]'>
                                    ID: <span className='font-mono'>{selectedAppointment._id}</span>
                                </p>
                            </div>

                            <button
                                type='button'
                                onClick={() => setSelectedAppointment(null)}
                                className='grid h-10 w-10 place-items-center rounded-full bg-[#fbf7f1] text-[#5f4637] transition hover:bg-[#eee3d5]'
                                aria-label='Close details'
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className='mt-6 space-y-6'>
                            {/* Grid Info */}
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <div className='rounded-2xl border border-[#eadbc9] bg-[#fffaf6] p-4 space-y-2'>
                                    <p className='text-[10px] font-bold uppercase tracking-wider text-[#a94723] flex items-center gap-1.5'>
                                        <PawPrint size={14} /> Pet Information
                                    </p>
                                    <p className='text-sm font-bold text-[#2b2019]'>{selectedAppointment.petName}</p>
                                    <p className='text-xs text-[#806654]'>Breed: <span className='font-semibold text-[#2b2019]'>{selectedAppointment.breed || selectedAppointment.petBreed || 'N/A'}</span></p>
                                    {selectedAppointment.petType && <p className='text-xs text-[#806654]'>Species: <span className='font-semibold text-[#2b2019]'>{selectedAppointment.petType}</span></p>}
                                </div>

                                <div className='rounded-2xl border border-[#eadbc9] bg-[#fffaf6] p-4 space-y-2'>
                                    <p className='text-[10px] font-bold uppercase tracking-wider text-[#a94723] flex items-center gap-1.5'>
                                        <UserRound size={14} /> Customer Contact
                                    </p>
                                    <p className='text-sm font-bold text-[#2b2019]'>{getOwnerName(selectedAppointment)}</p>
                                    <p className='text-xs text-[#806654]'>Phone: <span className='font-semibold text-[#2b2019]'>{selectedAppointment.ownerPhone || selectedAppointment.phone || 'N/A'}</span></p>
                                    <p className='text-xs text-[#806654] truncate'>Email: <span className='font-semibold text-[#2b2019]'>{selectedAppointment.ownerEmail || selectedAppointment.email || 'N/A'}</span></p>
                                </div>
                            </div>

                            {/* Service & Schedule */}
                            <div className='rounded-2xl border border-[#eadbc9] bg-[#fffaf6] p-4 space-y-3'>
                                <p className='text-[10px] font-bold uppercase tracking-wider text-[#a94723] flex items-center gap-1.5'>
                                    <Scissors size={14} /> Grooming Details
                                </p>
                                <div className='grid grid-cols-2 gap-3 text-xs'>
                                    <div>
                                        <p className='text-[#806654]'>Service</p>
                                        <p className='font-bold text-[#2b2019] text-sm mt-0.5'>{selectedAppointment.service}</p>
                                    </div>
                                    <div>
                                        <p className='text-[#806654]'>Price</p>
                                        <p className='font-serif font-bold text-[#b84c25] text-base mt-0.5'>{formatPeso(selectedAppointment.amount || selectedAppointment.price || 1200)}</p>
                                    </div>
                                    <div>
                                        <p className='text-[#806654]'>Date</p>
                                        <p className='font-semibold text-[#2b2019] mt-0.5'>{formatDate(selectedAppointment.date)}</p>
                                    </div>
                                    <div>
                                        <p className='text-[#806654]'>Time Slot</p>
                                        <p className='font-mono font-semibold text-[#2b2019] mt-0.5'>
                                            {formatTime(selectedAppointment.time)}
                                            {selectedAppointment.endTime ? `–${formatTime(selectedAppointment.endTime)}` : ''}
                                        </p>
                                    </div>
                                </div>

                                {selectedAppointment.haircutStyle && (
                                    <div className='flex items-center justify-between gap-4 border-t border-[#eadbc9] pt-3'>
                                        <div>
                                            <p className='text-xs text-[#806654]'>Selected Haircut Style:</p>
                                            <p className='font-semibold text-[#b84c25] text-sm mt-0.5'>{selectedAppointment.haircutStyle}</p>
                                            {aiPreviewImg && (
                                                <span className='mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#24523f] bg-[#eef6f1] px-2.5 py-0.5 rounded-full'>
                                                    AI Preview Attached
                                                </span>
                                            )}
                                        </div>

                                        {aiPreviewImg ? (
                                            <div
                                                className='group relative cursor-pointer overflow-hidden rounded-xl border border-[#d8b59e] bg-white shadow-sm transition hover:scale-105'
                                                onClick={() => setEnlargedImage(aiPreviewImg)}
                                                title='Click to enlarge AI haircut preview'
                                            >
                                                <img
                                                    src={aiPreviewImg}
                                                    alt={`AI Style preview for ${selectedAppointment.haircutStyle}`}
                                                    className='h-16 w-16 object-cover'
                                                />
                                                <span className='absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100'>
                                                    <ZoomIn size={14} />
                                                </span>
                                            </div>
                                        ) : fetchingPreview ? (
                                            <div className='flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-[#d8b59e] bg-white text-[#806654]'>
                                                <RefreshCw size={14} className='animate-spin' />
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {selectedAppointment.notes && (
                                <div className='rounded-2xl border border-[#eadbc9] bg-white p-4'>
                                    <p className='text-[10px] font-bold uppercase tracking-wider text-[#a94723]'>Notes for Groomer</p>
                                    <p className='mt-1.5 text-xs text-[#5f4637] leading-relaxed'>{selectedAppointment.notes}</p>
                                </div>
                            )}

                            {/* AI Style Preview Image */}
                            {(selectedAppointment.generatedImagePreviewUrl || selectedAppointment.previewImage || selectedAppointment.aiPreviewImage) && (
                                <div className='rounded-2xl border border-[#eadbc9] bg-[#fbf7f1] p-4'>
                                    <p className='text-[10px] font-bold uppercase tracking-wider text-[#a94723] mb-2 flex items-center gap-1.5'>
                                        <ImageIcon size={14} /> AI Grooming Preview Reference
                                    </p>
                                    <div className='relative overflow-hidden rounded-xl border border-[#e5d6c5] bg-white'>
                                        <img
                                            src={selectedAppointment.generatedImagePreviewUrl || selectedAppointment.previewImage || selectedAppointment.aiPreviewImage}
                                            alt={`AI Style preview for ${selectedAppointment.petName}`}
                                            className='max-h-64 w-full object-contain cursor-pointer transition hover:scale-[1.02]'
                                            onClick={() => setEnlargedImage(selectedAppointment.generatedImagePreviewUrl || selectedAppointment.previewImage || selectedAppointment.aiPreviewImage)}
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setEnlargedImage(selectedAppointment.generatedImagePreviewUrl || selectedAppointment.previewImage || selectedAppointment.aiPreviewImage)}
                                            className='absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm'
                                        >
                                            <ZoomIn size={12} /> Click to Enlarge
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Actions / Status Update */}
                            {onStatusUpdate && (
                                <div className='border-t border-[#eadbc9] pt-4'>
                                    <p className='text-xs font-bold text-[#806654] mb-3'>Update Appointment Status:</p>
                                    <div className='grid grid-cols-3 gap-2'>
                                        <button
                                            type='button'
                                            disabled={updatingId === selectedAppointment._id || selectedAppointment.status === 'confirmed'}
                                            onClick={() => onStatusUpdate(selectedAppointment, 'confirmed')}
                                            className={`rounded-xl px-3 py-2.5 text-xs font-bold transition disabled:opacity-50 ${selectedAppointment.status === 'confirmed' ? 'bg-[#174ea6] text-white' : 'border border-[#d0e0fb] bg-[#eef4ff] text-[#174ea6] hover:bg-[#d0e0fb]'}`}
                                        >
                                            Approve
                                        </button>

                                        <button
                                            type='button'
                                            disabled={updatingId === selectedAppointment._id || selectedAppointment.status === 'completed'}
                                            onClick={() => onStatusUpdate(selectedAppointment, 'completed')}
                                            className={`rounded-xl px-3 py-2.5 text-xs font-bold transition disabled:opacity-50 ${selectedAppointment.status === 'completed' ? 'bg-[#087443] text-white' : 'border border-[#c6f0dc] bg-[#eefcf4] text-[#087443] hover:bg-[#c6f0dc]'}`}
                                        >
                                            Complete
                                        </button>

                                        <button
                                            type='button'
                                            disabled={updatingId === selectedAppointment._id || selectedAppointment.status === 'cancelled'}
                                            onClick={() => onStatusUpdate(selectedAppointment, 'cancelled')}
                                            className={`rounded-xl px-3 py-2.5 text-xs font-bold transition disabled:opacity-50 ${selectedAppointment.status === 'cancelled' ? 'bg-[#b91c1c] text-white' : 'border border-[#fecaca] bg-[#fff5f5] text-[#b91c1c] hover:bg-[#fecaca]'}`}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Enlarged Image Zoom Overlay */}
            {enlargedImage && (
                <div
                    className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md'
                    onClick={() => setEnlargedImage(null)}
                >
                    <div className='relative max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl bg-white p-4 shadow-2xl'>
                        <button
                            type='button'
                            onClick={() => setEnlargedImage(null)}
                            className='absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white shadow-md hover:bg-black'
                        >
                            <X size={20} />
                        </button>
                        <img src={enlargedImage} alt='Enlarged Preview' className='max-h-[80vh] w-full object-contain rounded-2xl' />
                    </div>
                </div>
            )}
        </section>
    )
}

function CustomersView({
    customers
}) {
    const [
        query,
        setQuery
    ] = useState('')

    const filtered =
        useMemo(() => {
            const normalized =
                query
                    .trim()
                    .toLowerCase()

            if (!normalized) {
                return customers
            }

            return customers.filter(
                (customer) =>
                    [
                        customer.firstName,
                        customer.lastName,
                        customer.email,
                        customer.phone,
                        ...(customer.pets || []).flatMap(
                            (pet) => [
                                pet.name,
                                pet.breed
                            ]
                        )
                    ]
                        .filter(Boolean)
                        .some((value) =>
                            String(value)
                                .toLowerCase()
                                .includes(
                                    normalized
                                )
                        )
            )
        }, [
            customers,
            query
        ])

    return (
        <section className='overflow-hidden rounded-2xl border border-[#eadbc9] bg-white'>
            <div className='flex flex-col gap-3 border-b border-[#eadbc9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                    <h2 className='font-serif text-xl font-bold'>
                        Customer Records
                    </h2>

                    <p className='mt-1 text-sm text-[#806654]'>
                        {
                            customers.length
                        }{' '}
                        registered customers
                    </p>
                </div>

                <label className='relative block w-full sm:w-72'>
                    <Search
                        size={16}
                        className='absolute left-3 top-1/2 -translate-y-1/2 text-[#9c8575]'
                    />

                    <input
                        value={query}
                        onChange={(event) =>
                            setQuery(
                                event.target.value
                            )
                        }
                        placeholder='Search customers'
                        className='h-10 w-full rounded-full border border-[#eadbc9] pl-9 pr-4 text-sm outline-none focus:border-[#bf5a31]'
                    />
                </label>
            </div>

            {filtered.length ? (
                filtered.map(
                    (customer) => (
                        <div
                            key={
                                customer._id
                            }
                            className='grid gap-4 border-b border-[#eadbc9] px-5 py-5 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto]'
                        >
                            <div className='flex gap-4'>
                                <span className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#efe4d5] font-serif font-bold'>
                                    {getInitials(
                                        customer.firstName,
                                        customer.lastName
                                    )}
                                </span>

                                <div className='min-w-0'>
                                    <p className='font-semibold'>
                                        {
                                            customer.firstName
                                        }{' '}
                                        {
                                            customer.lastName
                                        }
                                    </p>

                                    <p className='mt-1 text-xs text-[#806654]'>
                                        {customer.email ||
                                            'No email'}{' '}
                                        ·{' '}
                                        {customer.phone ||
                                            'No phone'}
                                    </p>

                                    <p className='mt-1 text-xs text-[#806654]'>
                                        {getCustomerAddress(
                                            customer
                                        )}
                                    </p>

                                    <div className='mt-2 flex flex-wrap gap-2'>
                                        {(customer.pets ||
                                            []).length ? (
                                            customer.pets.map(
                                                (
                                                    pet
                                                ) => (
                                                    <span
                                                        key={
                                                            pet._id
                                                        }
                                                        className='rounded-full border border-[#dfcfbd] bg-[#fbf7f1] px-3 py-1 text-xs'
                                                    >
                                                        {
                                                            pet.name
                                                        }{' '}
                                                        (
                                                        {
                                                            pet.breed
                                                        }
                                                        )
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <span className='text-xs text-[#9c8575]'>
                                                No saved pet profiles
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className='grid grid-cols-3 gap-5 text-center lg:min-w-[330px]'>
                                <CustomerMetric
                                    value={
                                        customer.visits ||
                                        0
                                    }
                                    label='Bookings'
                                />

                                <CustomerMetric
                                    value={formatPeso(
                                        customer.totalSpend
                                    )}
                                    label='Total Spend'
                                    accent
                                />

                                <CustomerMetric
                                    value={formatShortDate(
                                        customer.lastVisit
                                    )}
                                    label='Last Visit'
                                    small
                                />
                            </div>
                        </div>
                    )
                )
            ) : (
                <EmptyPanel message='No customer records match your search.' />
            )}
        </section>
    )
}

function CustomerMetric({
    value,
    label,
    accent = false,
    small = false
}) {
    return (
        <div>
            <p
                className={`font-serif font-bold ${small ? 'text-sm' : 'text-lg'} ${accent ? 'text-[#bf5a31]' : ''}`}
            >
                {value}
            </p>

            <p className='mt-1 text-[11px] text-[#806654]'>
                {label}
            </p>
        </div>
    )
}

function AnalyticsView({
    analytics,
    currentMonthData,
    appointments,
    aiUsageRate,
    completedRate
}) {
    const monthlyData =
        analytics?.monthlyData ||
        []

    const serviceDistribution =
        analytics?.serviceDistribution ||
        []

    const maxAppointments =
        Math.max(
            1,
            ...monthlyData.map(
                (item) =>
                    item.appointments ||
                    0
            )
        )

    const maxRevenue =
        Math.max(
            1,
            ...monthlyData.map(
                (item) =>
                    item.revenue ||
                    0
            )
        )

    const styleUsage =
        useMemo(() => {
            const counts = {}

            appointments
                .filter(
                    (appointment) =>
                        appointment.haircutStyle &&
                        appointment.status !==
                        'cancelled'
                )
                .forEach(
                    (appointment) => {
                        const style =
                            appointment.haircutStyle

                        if (
                            !counts[
                            style
                            ]
                        ) {
                            counts[
                                style
                            ] = {
                                total: 0,
                                preview: 0
                            }
                        }

                        counts[
                            style
                        ].total += 1

                        if (
                            appointment.aiPreviewUsed
                        ) {
                            counts[
                                style
                            ].preview += 1
                        }
                    }
                )

            return Object.entries(
                counts
            )
                .map(
                    ([
                        style,
                        values
                    ]) => ({
                        style,
                        ...values,
                        rate:
                            values.total
                                ? Math.round(
                                    (values.preview /
                                        values.total) *
                                    100
                                )
                                : 0
                    })
                )
                .sort(
                    (first, second) =>
                        second.total -
                        first.total
                )
                .slice(0, 6)
        }, [appointments])

    const totalAppointments =
        currentMonthData
            ?.appointments || 0

    return (
        <div className='space-y-5'>
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                <MetricCard
                    icon={
                        ClipboardList
                    }
                    value={
                        totalAppointments
                    }
                    label='Appointments This Month'
                    tone='orange'
                />

                <MetricCard
                    icon={
                        CircleDollarSign
                    }
                    value={formatPeso(
                        currentMonthData
                            ?.revenue
                    )}
                    label='Monthly Revenue'
                    tone='green'
                    compact
                />

                <MetricCard
                    icon={Scissors}
                    value={`${aiUsageRate}%`}
                    label='AI Preview Usage'
                    tone='blue'
                />

                <MetricCard
                    icon={
                        CheckCircle2
                    }
                    value={`${completedRate}%`}
                    label='Completed Booking Rate'
                    tone='amber'
                />
            </div>

            <div className='grid gap-5 xl:grid-cols-2'>
                <ChartCard title='Monthly Appointments'>
                    <div className='flex h-64 items-end gap-3 pt-6'>
                        {monthlyData.map(
                            (item) => (
                                <div
                                    key={
                                        item.monthKey
                                    }
                                    className='flex min-w-0 flex-1 flex-col items-center justify-end'
                                >
                                    <span className='mb-2 text-xs font-semibold'>
                                        {
                                            item.appointments
                                        }
                                    </span>

                                    <div
                                        className='w-full max-w-16 rounded-t-md bg-[#bf5a31]'
                                        style={{
                                            height: `${Math.max(
                                                8,
                                                ((item.appointments ||
                                                    0) /
                                                    maxAppointments) *
                                                180
                                            )}px`
                                        }}
                                    />

                                    <span className='mt-2 text-xs text-[#806654]'>
                                        {
                                            item.month
                                        }
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </ChartCard>

                <ChartCard title='Monthly Revenue'>
                    <RevenueLineChart
                        data={
                            monthlyData
                        }
                        max={
                            maxRevenue
                        }
                    />
                </ChartCard>

                <ChartCard title='Service Breakdown'>
                    <ServiceBreakdown
                        items={
                            serviceDistribution
                        }
                    />
                </ChartCard>

                <ChartCard title='AI Style Preview Usage'>
                    <div className='space-y-4'>
                        {styleUsage.length ? (
                            styleUsage.map(
                                (item) => (
                                    <div
                                        key={
                                            item.style
                                        }
                                    >
                                        <div className='mb-1.5 flex items-center justify-between gap-3 text-sm'>
                                            <span className='font-semibold'>
                                                {
                                                    item.style
                                                }
                                            </span>

                                            <span className='font-mono text-xs text-[#806654]'>
                                                {
                                                    item.rate
                                                }
                                                % used ·{' '}
                                                {
                                                    item.total
                                                }{' '}
                                                bookings
                                            </span>
                                        </div>

                                        <div className='h-2 overflow-hidden rounded-full bg-[#eee5d9]'>
                                            <div
                                                className='h-full rounded-full bg-[#bf5a31]'
                                                style={{
                                                    width: `${item.rate}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <EmptyPanel message='No hairstyle bookings are available yet.' />
                        )}
                    </div>

                    <div className='mt-6 grid grid-cols-2 gap-3'>
                        <div className='rounded-xl bg-[#fbf7f1] p-4 text-center'>
                            <p className='font-serif text-2xl font-bold text-[#244936]'>
                                {
                                    appointments.filter(
                                        (
                                            appointment
                                        ) =>
                                            appointment.aiPreviewUsed
                                    ).length
                                }
                            </p>

                            <p className='mt-1 text-xs text-[#806654]'>
                                AI previews booked
                            </p>
                        </div>

                        <div className='rounded-xl bg-[#fbf7f1] p-4 text-center'>
                            <p className='font-serif text-2xl font-bold text-[#bf5a31]'>
                                {
                                    appointments.filter(
                                        (
                                            appointment
                                        ) =>
                                            appointment.haircutStyle
                                    ).length
                                }
                            </p>

                            <p className='mt-1 text-xs text-[#806654]'>
                                Style bookings
                            </p>
                        </div>
                    </div>
                </ChartCard>
            </div>
        </div>
    )
}

function ChartCard({
    title,
    children
}) {
    return (
        <section className='rounded-2xl border border-[#eadbc9] bg-white p-5'>
            <h2 className='font-serif text-xl font-bold'>
                {title}
            </h2>

            <div className='mt-4'>
                {children}
            </div>
        </section>
    )
}

function RevenueLineChart({
    data,
    max
}) {
    const width = 600
    const height = 230
    const padding = 26

    const points =
        data.map(
            (item, index) => {
                const x =
                    data.length <= 1
                        ? width / 2
                        : padding +
                        (index /
                            (data.length -
                                1)) *
                        (width -
                            padding * 2)

                const y =
                    height -
                    padding -
                    ((item.revenue ||
                        0) /
                        max) *
                    (height -
                        padding * 2)

                return {
                    x,
                    y,
                    item
                }
            }
        )

    const path =
        points
            .map(
                (point, index) =>
                    `${index ? 'L' : 'M'} ${point.x} ${point.y}`
            )
            .join(' ')

    return (
        <div>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className='h-60 w-full overflow-visible'
                role='img'
                aria-label='Monthly revenue line chart'
            >
                {[0.25, 0.5, 0.75].map(
                    (ratio) => (
                        <line
                            key={
                                ratio
                            }
                            x1={
                                padding
                            }
                            x2={
                                width -
                                padding
                            }
                            y1={
                                height *
                                ratio
                            }
                            y2={
                                height *
                                ratio
                            }
                            stroke='#eee5d9'
                            strokeWidth='1'
                        />
                    )
                )}

                <path
                    d={path}
                    fill='none'
                    stroke='#244936'
                    strokeWidth='4'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />

                {points.map(
                    (point) => (
                        <g
                            key={
                                point.item
                                    .monthKey
                            }
                        >
                            <circle
                                cx={
                                    point.x
                                }
                                cy={
                                    point.y
                                }
                                r='5'
                                fill='#244936'
                            />

                            <text
                                x={
                                    point.x
                                }
                                y={
                                    height -
                                    4
                                }
                                textAnchor='middle'
                                fontSize='12'
                                fill='#806654'
                            >
                                {
                                    point.item
                                        .month
                                }
                            </text>
                        </g>
                    )
                )}
            </svg>

            <p className='text-center text-xs text-[#806654]'>
                Highest visible month:{' '}
                {formatPeso(max)}
            </p>
        </div>
    )
}

function ServiceBreakdown({
    items
}) {
    const colors = [
        '#bf5a31',
        '#244936',
        '#d99f16',
        '#8b735e',
        '#b9a38d',
        '#739282'
    ]

    const segments =
        items.reduce(
            (
                result,
                item,
                index
            ) => {
                const start =
                    result.total

                const end =
                    start +
                    (item.percentage ||
                        0)

                return {
                    total: end,
                    values: [
                        ...result.values,
                        `${colors[index % colors.length]} ${start}% ${end}%`
                    ]
                }
            },
            {
                total: 0,
                values: []
            }
        ).values

    return (
        <div className='flex flex-col items-center gap-6 sm:flex-row sm:items-start'>
            <div
                className='relative h-52 w-52 shrink-0 rounded-full'
                style={{
                    background:
                        segments.length
                            ? `conic-gradient(${segments.join(', ')})`
                            : '#eee5d9'
                }}
            >
                <div className='absolute inset-12 rounded-full bg-white' />
            </div>

            <div className='grid flex-1 gap-3'>
                {items.length ? (
                    items.map(
                        (
                            item,
                            index
                        ) => (
                            <div
                                key={
                                    item.name
                                }
                                className='flex items-center justify-between gap-3 text-sm'
                            >
                                <span className='flex items-center gap-2'>
                                    <span
                                        className='h-3 w-3 rounded-full'
                                        style={{
                                            background:
                                                colors[
                                                index %
                                                colors.length
                                                ]
                                        }}
                                    />

                                    {
                                        item.name
                                    }
                                </span>

                                <span className='font-semibold'>
                                    {
                                        item.percentage
                                    }
                                    %
                                </span>
                            </div>
                        )
                    )
                ) : (
                    <p className='text-sm text-[#806654]'>
                        No service data available.
                    </p>
                )}
            </div>
        </div>
    )
}

function PetAvatar({
    appointment,
    large = false
}) {
    const photo =
        appointment?.pet?.photoUrl ||
        appointment?.petPhotoUrl ||
        ''

    const size =
        large
            ? 'h-14 w-14'
            : 'h-11 w-11'

    if (photo) {
        return (
            <img
                src={photo}
                alt=''
                className={`${size} shrink-0 rounded-full object-cover`}
            />
        )
    }

    return (
        <span
            className={`grid ${size} shrink-0 place-items-center rounded-full bg-[#efe4d5] text-[#8b5e44]`}
        >
            <PawPrint
                size={
                    large
                        ? 22
                        : 18
                }
            />
        </span>
    )
}

function StatusBadge({ status }) {
    const meta = STATUS_META[status] || STATUS_META.pending
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${meta.badge}`}>
            {meta.label}
        </span>
    )
}

function DetailRow({ label, value }) {
    return (
        <div className='flex items-start justify-between gap-4 py-1'>
            <dt className='text-xs text-[#9c7b68]'>{label}</dt>
            <dd className='max-w-[230px] text-right text-sm font-semibold text-[#2b2019]'>{value}</dd>
        </div>
    )
}

function EmptyPanel({ icon, message }) {
    return (
        <div className='flex flex-col items-center gap-2 p-10 text-center'>
            {icon && createElement(icon, { size: 28, className: 'text-[#cbb49a]' })}
            <p className='mt-1 text-sm text-[#9c7b68]'>{message}</p>
        </div>
    )
}

function ContactsView({ contacts = [], onRefresh }) {
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [selectedContact, setSelectedContact] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    const [markingId, setMarkingId] = useState(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)

    const safeContacts = useMemo(() => (Array.isArray(contacts) ? contacts : []), [contacts])

    const filteredContacts = useMemo(() => {
        return safeContacts
            .filter((c) => {
                if (!c) return false
                if (filter === 'unread' && c.read) return false
                if (filter === 'read' && !c.read) return false

                if (!search.trim()) return true
                const q = search.toLowerCase()
                return (
                    c.name?.toLowerCase().includes(q) ||
                    c.email?.toLowerCase().includes(q) ||
                    c.phone?.toLowerCase().includes(q) ||
                    c.message?.toLowerCase().includes(q)
                )
            })
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }, [safeContacts, filter, search])

    const handleMarkAsRead = async (id) => {
        setMarkingId(id)
        try {
            await adminApi.markContactRead(id)
            toast.success('Marked message as read')
            if (selectedContact?._id === id) {
                setSelectedContact((prev) => (prev ? { ...prev, read: true } : null))
            }
            onRefresh?.()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setMarkingId(null)
        }
    }

    const handleDelete = async (id) => {
        setDeletingId(id)
        try {
            await adminApi.deleteContact(id)
            toast.success('Deleted contact message')
            if (selectedContact?._id === id) {
                setSelectedContact(null)
            }
            setConfirmDeleteId(null)
            onRefresh?.()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setDeletingId(null)
        }
    }

    const unreadCount = safeContacts.filter((c) => c && !c.read).length

    return (
        <div className='space-y-6'>
            {/* Header Metrics */}
            <div className='grid gap-4 sm:grid-cols-3'>
                <div className='rounded-2xl border border-[#eadbc9] bg-white p-5 shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <p className='text-xs font-bold uppercase tracking-wider text-[#806654]'>Total Messages</p>
                        <span className='grid h-9 w-9 place-items-center rounded-xl bg-[#f8f3ec] text-[#244936]'>
                            <Mail size={18} />
                        </span>
                    </div>
                    <p className='mt-2 font-serif text-3xl font-bold text-[#2b2019]'>{safeContacts.length}</p>
                </div>

                <div className='rounded-2xl border border-[#eadbc9] bg-white p-5 shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <p className='text-xs font-bold uppercase tracking-wider text-[#806654]'>Unread Messages</p>
                        <span className='grid h-9 w-9 place-items-center rounded-xl bg-[#fff4ed] text-[#b84c25]'>
                            <MessageSquare size={18} />
                        </span>
                    </div>
                    <p className='mt-2 font-serif text-3xl font-bold text-[#b84c25]'>{unreadCount}</p>
                </div>

                <div className='rounded-2xl border border-[#eadbc9] bg-white p-5 shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <p className='text-xs font-bold uppercase tracking-wider text-[#806654]'>Read & Replied</p>
                        <span className='grid h-9 w-9 place-items-center rounded-xl bg-[#eef6f1] text-[#244936]'>
                            <CheckCheck size={18} />
                        </span>
                    </div>
                    <p className='mt-2 font-serif text-3xl font-bold text-[#244936]'>{safeContacts.length - unreadCount}</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-1.5 rounded-xl border border-[#eadbc9] bg-white p-1 shadow-sm'>
                    <button
                        type='button'
                        onClick={() => setFilter('all')}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${filter === 'all' ? 'bg-[#244936] text-white' : 'text-[#5f4637] hover:bg-[#f8f3ec]'}`}
                    >
                        All ({safeContacts.length})
                    </button>
                    <button
                        type='button'
                        onClick={() => setFilter('unread')}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${filter === 'unread' ? 'bg-[#b84c25] text-white' : 'text-[#5f4637] hover:bg-[#f8f3ec]'}`}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        type='button'
                        onClick={() => setFilter('read')}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${filter === 'read' ? 'bg-[#244936] text-white' : 'text-[#5f4637] hover:bg-[#f8f3ec]'}`}
                    >
                        Read ({safeContacts.length - unreadCount})
                    </button>
                </div>

                <div className='relative min-w-[240px]'>
                    <Search size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[#806654]' />
                    <input
                        type='text'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Search name, email, message...'
                        className='w-full rounded-xl border border-[#eadbc9] bg-white py-2 pl-9 pr-4 text-xs shadow-sm focus:border-[#b84c25] focus:outline-none focus:ring-1 focus:ring-[#b84c25]'
                    />
                </div>
            </div>

            {/* Main Content Grid: Messages List + Detailed View */}
            <div className='grid gap-6 lg:grid-cols-12'>
                <div className='space-y-3 lg:col-span-5'>
                    {filteredContacts.length === 0 ? (
                        <div className='rounded-2xl border border-dashed border-[#eadbc9] bg-white p-8 text-center'>
                            <Inbox size={32} className='mx-auto mb-2 text-[#806654]' />
                            <p className='font-bold text-[#2b2019]'>No messages found</p>
                            <p className='mt-1 text-xs text-[#806654]'>
                                {search ? 'Try adjusting your search query' : 'No contact form submissions received yet.'}
                            </p>
                        </div>
                    ) : (
                        filteredContacts.map((contact) => {
                            const isSelected = selectedContact?._id === contact._id
                            return (
                                <button
                                    key={contact._id}
                                    type='button'
                                    onClick={() => {
                                        setSelectedContact(contact)
                                        if (!contact.read) {
                                            handleMarkAsRead(contact._id)
                                        }
                                    }}
                                    className={`w-full rounded-2xl border p-4 text-left transition ${
                                        isSelected
                                            ? 'border-[#b84c25] bg-[#fff4ed] shadow-sm'
                                            : contact.read
                                            ? 'border-[#eadbc9] bg-white hover:bg-[#faf6f0]'
                                            : 'border-[#d8b59e] bg-[#fffaf6] shadow-sm'
                                    }`}
                                >
                                    <div className='flex items-start justify-between gap-2'>
                                        <div>
                                            <p className='font-bold text-[#2b2019] text-sm flex items-center gap-2'>
                                                {contact.name}
                                                {!contact.read && (
                                                    <span className='h-2 w-2 rounded-full bg-[#b84c25]' title='Unread message' />
                                                )}
                                            </p>
                                            <p className='text-xs text-[#806654] mt-0.5'>{contact.email}</p>
                                        </div>

                                        <span className='font-mono text-[10px] text-[#806654] shrink-0'>
                                            {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>

                                    <p className='mt-2.5 line-clamp-2 text-xs text-[#5f4637] leading-relaxed'>
                                        {contact.message}
                                    </p>
                                </button>
                            )
                        })
                    )}
                </div>

                {/* Selected Contact Message Detail View */}
                <div className='lg:col-span-7'>
                    {selectedContact ? (
                        <div className='sticky top-20 rounded-2xl border border-[#eadbc9] bg-white p-6 shadow-sm space-y-6'>
                            <div className='flex items-start justify-between gap-4 border-b border-[#eadbc9] pb-5'>
                                <div>
                                    <div className='flex items-center gap-2'>
                                        <h3 className='font-serif text-2xl font-bold text-[#2b2019]'>{selectedContact.name}</h3>
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                selectedContact.read ? 'bg-[#eef6f1] text-[#244936]' : 'bg-[#fff4ed] text-[#b84c25]'
                                            }`}
                                        >
                                            {selectedContact.read ? 'Read' : 'Unread'}
                                        </span>
                                    </div>

                                    <p className='mt-1 text-xs text-[#806654]'>
                                        Received on {new Date(selectedContact.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => setConfirmDeleteId(selectedContact._id)}
                                        disabled={deletingId === selectedContact._id}
                                        className='grid h-9 w-9 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-50'
                                        title='Delete message'
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Contact Details Card */}
                            <div className='grid gap-3 sm:grid-cols-2 rounded-xl border border-[#eadbc9] bg-[#fffaf6] p-4 text-xs'>
                                <div>
                                    <p className='text-[#806654] font-bold uppercase tracking-wider text-[10px]'>Email Address</p>
                                    <a
                                        href={`mailto:${selectedContact.email}`}
                                        className='mt-1 block font-semibold text-[#b84c25] hover:underline truncate'
                                    >
                                        {selectedContact.email}
                                    </a>
                                </div>

                                {selectedContact.phone && (
                                    <div>
                                        <p className='text-[#806654] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1'>
                                            <Phone size={11} /> Phone Number
                                        </p>
                                        <a
                                            href={`tel:${selectedContact.phone}`}
                                            className='mt-1 block font-mono font-semibold text-[#244936] hover:underline'
                                        >
                                            {selectedContact.phone}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Message Body */}
                            <div>
                                <p className='text-xs font-bold uppercase tracking-wider text-[#a94723] mb-2'>Message Content</p>
                                <div className='rounded-xl border border-[#eadbc9] bg-[#fbf7f1] p-4 text-sm text-[#2b2019] leading-relaxed whitespace-pre-wrap'>
                                    {selectedContact.message}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className='flex items-center justify-between border-t border-[#eadbc9] pt-4'>
                                <a
                                    href={`mailto:${selectedContact.email}?subject=Re:%20Timmy%20Tails%20Inquiry`}
                                    className='inline-flex items-center gap-2 rounded-xl bg-[#244936] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1b3829]'
                                >
                                    <Mail size={14} /> Reply via Email
                                </a>

                                {!selectedContact.read && (
                                    <button
                                        type='button'
                                        onClick={() => handleMarkAsRead(selectedContact._id)}
                                        disabled={markingId === selectedContact._id}
                                        className='inline-flex items-center gap-1.5 rounded-xl border border-[#eadbc9] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#5f4637] transition hover:bg-[#f8f3ec]'
                                    >
                                        <CheckCheck size={14} /> Mark as Read
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className='rounded-2xl border border-dashed border-[#eadbc9] bg-white p-12 text-center'>
                            <Mail size={40} className='mx-auto mb-3 text-[#c88968]' />
                            <h4 className='font-serif text-xl font-bold text-[#2b2019]'>Select a Message</h4>
                            <p className='mt-1 text-xs text-[#806654] max-w-xs mx-auto'>
                                Click on any contact submission on the left side to read full details and reply.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={Boolean(confirmDeleteId)}
                title='Delete Contact Message'
                description='Are you sure you want to delete this contact submission message? This action cannot be undone.'
                confirmText='Yes, Delete Message'
                cancelText='Keep Message'
                variant='danger'
                loading={Boolean(deletingId)}
                onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                onClose={() => setConfirmDeleteId(null)}
            />
        </div>
    )
}

// ─────────────────────────────────────────────────────────
// NOTIFICATIONS VIEW
// ─────────────────────────────────────────────────────────
function NotificationsView({ notifications, customers, loading, onSend }) {
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [audience, setAudience] = useState('all-users')
    const [targetUserId, setTargetUserId] = useState('')
    const [sending, setSending] = useState(false)
    const [search, setSearch] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim() || !message.trim()) {
            return
        }
        if (audience === 'user' && !targetUserId) {
            return
        }
        setSending(true)
        try {
            await onSend({
                title: title.trim(),
                message: message.trim(),
                audience,
                ...(audience === 'user' ? { targetUserId } : {})
            })
            setTitle('')
            setMessage('')
            setTargetUserId('')
        } finally {
            setSending(false)
        }
    }

    const filtered = (notifications || []).filter((n) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
            n.title?.toLowerCase().includes(q) ||
            n.message?.toLowerCase().includes(q)
        )
    })

    const broadcastCount = (notifications || []).filter((n) => n.audience === 'all-users').length
    const targetedCount = (notifications || []).filter((n) => n.audience === 'user').length

    function timeAgo(dateStr) {
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
        if (diff < 60) return 'just now'
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
        return `${Math.floor(diff / 86400)}d ago`
    }

    return (
        <div className='space-y-6'>
            {/* Page header */}
            <div className='flex items-center gap-3 border-b border-[#e8ddd0] pb-4'>
                <span className='grid h-10 w-10 place-items-center rounded-xl bg-[#1c3329] text-white'>
                    <Bell size={20} />
                </span>
                <div>
                    <h2 className='font-serif text-2xl font-bold text-[#201711]'>Notifications</h2>
                    <p className='text-xs text-[#786150]'>Compose and send notifications to customers</p>
                </div>
            </div>

            {/* Stats row */}
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                <div className='rounded-xl border border-[#e8ddd0] bg-white p-4'>
                    <p className='text-2xl font-bold text-[#201711]'>{(notifications || []).length}</p>
                    <p className='text-xs font-medium text-[#786150]'>Total Sent</p>
                </div>
                <div className='rounded-xl border border-[#e8ddd0] bg-white p-4'>
                    <p className='text-2xl font-bold text-[#1c3329]'>{broadcastCount}</p>
                    <p className='text-xs font-medium text-[#786150]'>Broadcasts</p>
                </div>
                <div className='rounded-xl border border-[#e8ddd0] bg-white p-4'>
                    <p className='text-2xl font-bold text-[#bf5a31]'>{targetedCount}</p>
                    <p className='text-xs font-medium text-[#786150]'>Targeted</p>
                </div>
            </div>

            <div className='grid gap-6 lg:grid-cols-5'>
                {/* ── Compose Form ── */}
                <div className='lg:col-span-2'>
                    <div className='rounded-2xl border border-[#e8ddd0] bg-white shadow-sm'>
                        <div className='border-b border-[#f0e8de] px-5 py-4'>
                            <div className='flex items-center gap-2'>
                                <Megaphone size={16} className='text-[#bf5a31]' />
                                <h3 className='font-bold text-[#201711]'>Send Notification</h3>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className='space-y-4 p-5'>
                            {/* Audience toggle */}
                            <div>
                                <label className='mb-1.5 block text-xs font-bold text-[#4e382b]'>Send To</label>
                                <div className='flex gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => { setAudience('all-users'); setTargetUserId('') }}
                                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-bold transition ${
                                            audience === 'all-users'
                                                ? 'border-[#1c3329] bg-[#1c3329] text-white'
                                                : 'border-[#e5d8c8] bg-white text-[#4e382b] hover:border-[#1c3329]'
                                        }`}
                                    >
                                        <Users size={13} />
                                        All Users
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setAudience('user')}
                                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-bold transition ${
                                            audience === 'user'
                                                ? 'border-[#bf5a31] bg-[#bf5a31] text-white'
                                                : 'border-[#e5d8c8] bg-white text-[#4e382b] hover:border-[#bf5a31]'
                                        }`}
                                    >
                                        <UserRound size={13} />
                                        Specific User
                                    </button>
                                </div>
                            </div>

                            {/* Target user selector */}
                            {audience === 'user' && (
                                <div>
                                    <label className='mb-1.5 block text-xs font-bold text-[#4e382b]'>Select Customer</label>
                                    <select
                                        value={targetUserId}
                                        onChange={(e) => setTargetUserId(e.target.value)}
                                        required
                                        className='w-full rounded-lg border border-[#e5d8c8] bg-white px-3 py-2.5 text-xs font-medium text-[#201711] focus:border-[#bf5a31] focus:outline-none'
                                    >
                                        <option value=''>— Choose a customer —</option>
                                        {(customers || []).map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.firstName} {c.lastName} ({c.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className='mb-1.5 block text-xs font-bold text-[#4e382b]'>
                                    Title <span className='text-[#bf5a31]'>*</span>
                                </label>
                                <input
                                    type='text'
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={120}
                                    placeholder='e.g. Shop Holiday Hours'
                                    required
                                    className='w-full rounded-lg border border-[#e5d8c8] px-3 py-2.5 text-xs text-[#201711] placeholder-[#c0a98b] focus:border-[#bf5a31] focus:outline-none'
                                />
                                <p className='mt-1 text-right text-[10px] text-[#b0a090]'>{title.length}/120</p>
                            </div>

                            {/* Message */}
                            <div>
                                <label className='mb-1.5 block text-xs font-bold text-[#4e382b]'>
                                    Message <span className='text-[#bf5a31]'>*</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={1000}
                                    rows={5}
                                    placeholder='Write your notification message here…'
                                    required
                                    className='w-full resize-none rounded-lg border border-[#e5d8c8] px-3 py-2.5 text-xs text-[#201711] placeholder-[#c0a98b] focus:border-[#bf5a31] focus:outline-none'
                                />
                                <p className='mt-1 text-right text-[10px] text-[#b0a090]'>{message.length}/1000</p>
                            </div>

                            {/* Preview */}
                            {(title || message) && (
                                <div className='rounded-xl border border-dashed border-[#e0d0c0] bg-[#faf6f0] p-3'>
                                    <p className='mb-1 text-[10px] font-bold uppercase tracking-wider text-[#b0a090]'>Preview</p>
                                    <p className='text-xs font-bold text-[#201711]'>{title || '—'}</p>
                                    <p className='mt-0.5 text-xs text-[#5f4637]'>{message || '—'}</p>
                                </div>
                            )}

                            <button
                                type='submit'
                                disabled={sending || loading || !title.trim() || !message.trim() || (audience === 'user' && !targetUserId)}
                                className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#bf5a31] py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#a94723] disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {sending ? (
                                    <>
                                        <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                                        Sending…
                                    </>
                                ) : (
                                    <>
                                        <Send size={13} />
                                        {audience === 'all-users' ? 'Send to All Users' : 'Send to User'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── Sent History ── */}
                <div className='lg:col-span-3'>
                    <div className='rounded-2xl border border-[#e8ddd0] bg-white shadow-sm'>
                        <div className='flex items-center justify-between border-b border-[#f0e8de] px-5 py-4'>
                            <div className='flex items-center gap-2'>
                                <Bell size={15} className='text-[#1c3329]' />
                                <h3 className='font-bold text-[#201711]'>Sent History</h3>
                                <span className='rounded-full bg-[#f0e8dd] px-2 py-0.5 text-[10px] font-bold text-[#7a5c3a]'>
                                    {(notifications || []).length}
                                </span>
                            </div>
                            {/* Search */}
                            <div className='relative'>
                                <Search size={13} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c0a98b]' />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder='Search…'
                                    className='rounded-lg border border-[#e5d8c8] bg-[#faf6f0] py-1.5 pl-7 pr-3 text-xs text-[#201711] focus:border-[#bf5a31] focus:outline-none w-36'
                                />
                            </div>
                        </div>

                        <div className='max-h-[520px] overflow-y-auto divide-y divide-[#f5ede3]'>
                            {filtered.length === 0 ? (
                                <div className='flex flex-col items-center gap-3 py-14 text-[#9e8a7a]'>
                                    <Bell size={32} strokeWidth={1.5} />
                                    <p className='text-sm font-medium'>No notifications sent yet</p>
                                    <p className='text-xs text-[#b0a090]'>Use the form on the left to send one</p>
                                </div>
                            ) : (
                                filtered.map((n) => (
                                    <div key={n._id} className='flex items-start gap-3 px-5 py-4 hover:bg-[#faf6f0]'>
                                        <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                                            n.audience === 'all-users'
                                                ? 'bg-[#eef4f1] text-[#1c3329]'
                                                : 'bg-[#f6ede2] text-[#bf5a31]'
                                        }`}>
                                            {n.audience === 'all-users' ? <Megaphone size={14} /> : <UserRound size={14} />}
                                        </span>
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-start justify-between gap-2'>
                                                <p className='text-xs font-bold text-[#201711] leading-snug'>{n.title}</p>
                                                <span className='shrink-0 text-[10px] text-[#b0a090] whitespace-nowrap'>{timeAgo(n.createdAt)}</span>
                                            </div>
                                            <p className='mt-0.5 text-xs text-[#5f4637] leading-relaxed line-clamp-2'>{n.message}</p>
                                            <div className='mt-1.5 flex items-center gap-2'>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                    n.audience === 'all-users'
                                                        ? 'bg-[#eef4f1] text-[#1c3329]'
                                                        : 'bg-[#fff0e8] text-[#bf5a31]'
                                                }`}>
                                                    {n.audience === 'all-users' ? <Users size={9} /> : <UserRound size={9} />}
                                                    {n.audience === 'all-users' ? 'Broadcast' : 'Targeted'}
                                                </span>
                                                {n.readBy?.length > 0 && (
                                                    <span className='inline-flex items-center gap-1 rounded-full bg-[#f0f4ff] px-2 py-0.5 text-[10px] font-bold text-[#4466bb]'>
                                                        <CheckCheck size={9} />
                                                        {n.readBy.length} read
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
