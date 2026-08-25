import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    AlertTriangle, Ban, CalendarDays, ChevronRight, Clock3, Eye,
    Plus, Scissors, Settings, Dog, Cat
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { appointmentsApi, getErrorMessage, petsApi } from '../utils/api'
import { formatDateLong, formatTimeRange } from '../features/booking/utils/dateTime'
import AppointmentDetailsModal from '../components/AppointmentDetailsModal'
import ConfirmModal from '../components/ConfirmModal'
import RescheduleModal from '../components/RescheduleModal'

const appointmentDate = (appointment, useEnd = false) => {
    const directValue = useEnd ? appointment.endAt : appointment.startAt
    if (directValue) return new Date(directValue)
    const time = useEnd ? (appointment.endTime || appointment.time) : appointment.time
    if (!appointment.date || !time) return new Date(0)
    return new Date(`${appointment.date}T${time}:00+08:00`)
}

const STATUS_STYLES = {
    confirmed: { pill: 'bg-blue-50 text-blue-800 border-blue-200', bar: 'bg-blue-500' },
    completed: { pill: 'bg-emerald-50 text-emerald-800 border-emerald-200', bar: 'bg-emerald-500' },
    cancelled: { pill: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-400' },
    pending:   { pill: 'bg-amber-50 text-amber-800 border-amber-200', bar: 'bg-amber-400' }
}

export default function UserDashboard() {
    const { user, refreshUser } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [confirmCancelAppointment, setConfirmCancelAppointment] = useState(null)
    const [rescheduleAppointment, setRescheduleAppointment] = useState(null)
    const [cancelling, setCancelling] = useState(false)

    useEffect(() => {
        if (refreshUser) refreshUser()
    }, [refreshUser])

    useEffect(() => {
        if (user?.accountStatus === 'banned') {
            localStorage.removeItem('token')
            const msg = encodeURIComponent(user.statusReason || 'Your customer account has been suspended by salon administration.')
            if (window.location.pathname !== '/login') {
                window.location.href = `/login?reason=banned&msg=${msg}`
            }
        }
    }, [user])

    const loadData = () => {
        Promise.all([appointmentsApi.getMy(), petsApi.getMine()])
            .then(([ar, pr]) => {
                setAppointments(ar.data.appointments || [])
                setPets(pr.data.pets || [])
            })
            .catch((err) => {
                if (err.response?.status === 403) {
                    localStorage.removeItem('token')
                    const msg = encodeURIComponent(err.response?.data?.message || 'Your customer account has been suspended by salon administration.')
                    window.location.href = `/login?reason=banned&msg=${msg}`
                }
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadData() }, [])

    const handleConfirmCancel = async () => {
        if (!confirmCancelAppointment) return
        setCancelling(true)
        try {
            await appointmentsApi.cancel(confirmCancelAppointment._id)
            toast.success('Appointment cancelled successfully')
            setConfirmCancelAppointment(null)
            await loadData()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setCancelling(false)
        }
    }

    const upcoming = useMemo(() =>
        appointments
            .filter((a) => ['pending', 'confirmed'].includes(a.status) && appointmentDate(a, true) >= new Date())
            .sort((a, b) => appointmentDate(a) - appointmentDate(b)),
        [appointments]
    )
    const completedCount = appointments.filter((a) => a.status === 'completed').length

    return (
        <div className='min-h-screen bg-[#F8F7F4] px-4 py-8 text-slate-900 sm:px-6 sm:py-10'>
            <div className='mx-auto max-w-6xl space-y-8'>

                {/* ── Welcome Banner ── */}
                <section className='overflow-hidden rounded-xl border border-slate-800 bg-[#0F172A] text-white'>
                    <div className='px-5 py-6 sm:px-8 sm:py-8'>
                        <div className='flex flex-col justify-between gap-6 md:flex-row md:items-center'>
                            <div>
                                <span className='mb-2 inline-block rounded-md bg-slate-800 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                                    Customer Workspace
                                </span>
                                <h1 className='font-serif text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-white'>
                                    Welcome back, {user.firstName}!
                                </h1>
                                <p className='mt-2 max-w-lg text-xs sm:text-sm text-slate-300'>
                                    {upcoming.length
                                        ? `You have ${upcoming.length} upcoming grooming appointment${upcoming.length === 1 ? '' : 's'} scheduled.`
                                        : 'You currently have no upcoming grooming appointments.'}
                                </p>
                            </div>

                            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:shrink-0 w-full sm:w-auto'>
                                <Link
                                    to='/profile'
                                    className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700 hover:text-white'
                                >
                                    <Settings size={15} />
                                    <span>Profile Settings</span>
                                </Link>
                                <Link
                                    to='/booking'
                                    className='inline-flex items-center justify-center gap-2 rounded-lg bg-[#C25E2B] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#A84E20]'
                                >
                                    <Plus size={16} />
                                    <span>Book Appointment</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Enforcement Status Banner */}
                {user?.accountStatus === 'warned' && (
                    <div className='rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 flex items-start gap-3 shadow-xs'>
                        <AlertTriangle className='h-5 w-5 shrink-0 text-amber-600 mt-0.5' />
                        <div className='space-y-1'>
                            <p className='font-bold text-amber-900 text-sm'>Account Policy Notice</p>
                            <p className='text-amber-800 leading-relaxed'>
                                {user.warningMessage || user.statusReason || 'You have received a formal warning regarding multiple booking cancellations or no-show policy violations. Please attend scheduled appointments on time.'}
                            </p>
                        </div>
                    </div>
                )}

                {(user?.accountStatus === 'booking_blocked' || user?.accountStatus === 'banned') && (
                    <div className='rounded-xl border border-red-300 bg-red-50 p-5 text-xs text-red-950 flex items-start gap-3 shadow-md'>
                        <Ban className='h-6 w-6 shrink-0 text-red-600 mt-0.5' />
                        <div className='space-y-1.5'>
                            <p className='font-bold text-red-900 text-base'>Booking Privileges Suspended</p>
                            <p className='text-red-800 leading-relaxed text-sm'>
                                {user.statusReason || user.warningMessage || 'Your customer account has been blocked from scheduling new grooming appointments by salon administration due to repeated cancellations or policy violations.'}
                            </p>
                            <p className='text-xs font-semibold text-red-900 pt-1'>
                                Contact TimmyTails salon support at +63 975 669 2647 for assistance.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Metric Cards ── */}
                <section className='grid gap-4 sm:grid-cols-3'>
                    <StatCard icon={CalendarDays} label='Upcoming Bookings' value={upcoming.length} accent='#C25E2B' />
                    <StatCard icon={Dog} label='Saved Pets' value={pets.length} accent='#0F172A' />
                    <StatCard icon={Scissors} label='Completed Groomings' value={completedCount} accent='#475569' />
                </section>

                {/* ── Upcoming Appointments Section ── */}
                <section>
                    <div className='mb-4 flex items-center justify-between border-b border-slate-200 pb-3'>
                        <div className='flex items-center gap-2'>
                            <CalendarDays size={18} className='text-[#C25E2B]' />
                            <h2 className='font-serif text-xl font-bold text-slate-900'>Upcoming Appointments</h2>
                        </div>
                        <Link
                            to='/appointments'
                            className='inline-flex items-center gap-1 text-xs font-bold text-[#C25E2B] transition hover:underline'
                        >
                            <span>View All</span>
                            <ChevronRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <LoadingCard text='Loading your schedule...' />
                    ) : upcoming.length ? (
                        <div className='space-y-4'>
                            {upcoming.slice(0, 3).map((a) => {
                                const petPhoto = a.pet?.photoUrl || a.photoUrl || pets.find((p) => p.name?.toLowerCase() === a.petName?.toLowerCase())?.photoUrl
                                return (
                                    <article
                                        key={a._id}
                                        onClick={() => setSelectedAppointment(a)}
                                        className='group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300'
                                    >
                                        <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                                            <div className='flex items-center gap-4'>
                                                {/* Pet Photo / Avatar */}
                                                <div className='h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100'>
                                                    {petPhoto ? (
                                                        <img src={petPhoto} alt={a.petName} className='h-full w-full object-cover' />
                                                    ) : (
                                                        <div className='flex h-full w-full items-center justify-center text-slate-400'>
                                                            {a.petType === 'cat' ? <Cat size={22} /> : <Dog size={22} />}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className='flex flex-wrap items-center gap-2'>
                                                        <h3 className='font-serif text-lg font-bold text-slate-900 group-hover:text-[#C25E2B] transition-colors'>
                                                            {a.petName}
                                                        </h3>
                                                        <StatusPill status={a.status} />
                                                    </div>
                                                    <p className='mt-0.5 text-xs font-medium text-slate-600'>
                                                        {a.service}{a.haircutStyle ? ` · Style: ${a.haircutStyle}` : ''}
                                                    </p>
                                                    <div className='mt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-[#C25E2B]'>
                                                        <span>{formatDateLong(a.date)}</span>
                                                        <span className='flex items-center gap-1 font-semibold text-slate-600'>
                                                            <Clock3 size={13} />
                                                            {formatTimeRange(a.time, a.endTime)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='flex items-center justify-between border-t border-slate-100 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0'>
                                                <span className='font-serif text-xl font-bold text-slate-900'>
                                                    ₱{Number(a.price).toLocaleString('en-PH')}
                                                </span>
                                                <span className='inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 group-hover:bg-[#C25E2B] group-hover:text-white group-hover:border-[#C25E2B] transition'>
                                                    <Eye size={13} />
                                                    <span>View Details</span>
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    ) : (
                        <EmptyAppointments />
                    )}
                </section>

                {/* ── My Pets Overview Section ── */}
                <section>
                    <div className='mb-4 flex items-center justify-between border-b border-slate-200 pb-3'>
                        <div className='flex items-center gap-2'>
                            <Dog size={18} className='text-[#C25E2B]' />
                            <h2 className='font-serif text-xl font-bold text-slate-900'>My Pets</h2>
                        </div>
                        <Link
                            to='/my-pets'
                            className='inline-flex items-center gap-1 text-xs font-bold text-[#C25E2B] transition hover:underline'
                        >
                            <span>Manage Profiles</span>
                            <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                        {pets.slice(0, 5).map((pet) => (
                            <article
                                key={pet._id}
                                className='group flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300'
                            >
                                <div className='h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100'>
                                    {pet.photoUrl ? (
                                        <img src={pet.photoUrl} alt={pet.name} className='h-full w-full object-cover' />
                                    ) : (
                                        <div className='flex h-full w-full items-center justify-center text-slate-400'>
                                            {pet.type === 'cat' ? <Cat size={22} /> : <Dog size={22} />}
                                        </div>
                                    )}
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <h3 className='truncate font-serif text-base font-bold text-slate-900'>{pet.name}</h3>
                                    <p className='truncate text-xs text-slate-600'>
                                        {pet.type === 'cat' ? 'Cat' : 'Dog'} · {pet.breed}
                                    </p>
                                </div>
                            </article>
                        ))}

                        <Link
                            to='/my-pets'
                            className='group flex min-h-[72px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-[#C25E2B] hover:bg-white'
                        >
                            <div className='flex items-center gap-2 text-xs font-bold text-[#C25E2B]'>
                                <Plus size={16} />
                                <span>Add New Pet</span>
                            </div>
                        </Link>
                    </div>
                </section>
            </div>

            {/* Modals */}
            {selectedAppointment && (
                <AppointmentDetailsModal
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                    onCancel={(a) => setConfirmCancelAppointment(a)}
                    onReschedule={(a) => setRescheduleAppointment(a)}
                />
            )}

            <RescheduleModal
                isOpen={Boolean(rescheduleAppointment)}
                appointment={rescheduleAppointment}
                onClose={() => setRescheduleAppointment(null)}
                onSuccess={() => loadData()}
            />

            <ConfirmModal
                isOpen={Boolean(confirmCancelAppointment)}
                title='Cancel Appointment'
                description={confirmCancelAppointment
                    ? `Are you sure you want to cancel the ${confirmCancelAppointment.service} appointment for ${confirmCancelAppointment.petName}?`
                    : ''}
                confirmText='Cancel Appointment'
                cancelText='Keep Booking'
                variant='danger'
                loading={cancelling}
                onConfirm={handleConfirmCancel}
                onClose={() => setConfirmCancelAppointment(null)}
            />
        </div>
    )
}

function StatCard({ icon: Icon, label, value, accent }) {
    return (
        <div className='rounded-xl border border-slate-200 bg-white p-5'>
            <div className='flex items-center justify-between'>
                <span className='text-xs font-bold uppercase tracking-wider text-slate-500'>{label}</span>
                <span className='grid h-9 w-9 place-items-center rounded-lg bg-slate-100' style={{ color: accent }}>
                    <Icon size={18} />
                </span>
            </div>
            <p className='mt-2 font-serif text-3xl font-bold text-slate-900'>{value}</p>
        </div>
    )
}

function StatusPill({ status }) {
    const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending
    const label = status === 'confirmed' ? 'Approved' : status === 'completed' ? 'Completed' : status === 'cancelled' ? 'Cancelled' : 'Pending'
    return (
        <span className={`rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.pill}`}>
            {label}
        </span>
    )
}

function LoadingCard({ text }) {
    return (
        <div className='rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-600'>
            {text}
        </div>
    )
}

function EmptyAppointments() {
    return (
        <div className='rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center'>
            <div className='mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-[#C25E2B]'>
                <CalendarDays size={24} />
            </div>
            <h3 className='mt-3 font-serif text-lg font-bold text-slate-900'>No Upcoming Appointments</h3>
            <p className='mt-1 text-xs text-slate-600'>Schedule a grooming session for your pet whenever you are ready.</p>
            <Link
                to='/booking'
                className='mt-4 inline-flex items-center gap-2 rounded-lg bg-[#C25E2B] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#A84E20]'
            >
                <Plus size={15} />
                <span>Book Appointment</span>
            </Link>
        </div>
    )
}
