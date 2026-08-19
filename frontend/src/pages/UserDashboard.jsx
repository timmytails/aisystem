import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    CalendarDays, ChevronRight, Clock3, Eye, PawPrint,
    Plus, Scissors, Settings, Sparkles
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
    confirmed: { pill: 'bg-blue-50 text-blue-700 border-blue-200',   bar: 'bg-blue-500' },
    completed: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
    cancelled: { pill: 'bg-red-50 text-red-600 border-red-200',      bar: 'bg-red-400' },
    pending:   { pill: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400' }
}

export default function UserDashboard() {
    const { user } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [confirmCancelAppointment, setConfirmCancelAppointment] = useState(null)
    const [rescheduleAppointment, setRescheduleAppointment] = useState(null)
    const [cancelling, setCancelling] = useState(false)

    const loadData = () => {
        Promise.all([appointmentsApi.getMy(), petsApi.getMine()])
            .then(([ar, pr]) => {
                setAppointments(ar.data.appointments || [])
                setPets(pr.data.pets || [])
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
        <div className='min-h-screen bg-[#fbf7f1] px-4 py-8 text-[#201711] sm:px-6 sm:py-12'>
            <div className='mx-auto max-w-6xl space-y-8'>

                {/* ── Welcome Banner ── */}
                <section className='overflow-hidden rounded-2xl bg-[#1c3329] text-white shadow-md'>
                    <div className='px-7 py-8 sm:px-10 sm:py-10'>
                        <div className='flex flex-col justify-between gap-6 md:flex-row md:items-center'>
                            <div>
                                <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider'>
                                    <Sparkles size={13} className='text-amber-300' />
                                    Customer Dashboard
                                </div>
                                <h1 className='font-serif text-3xl font-bold tracking-tight sm:text-4xl'>
                                    Welcome back, {user.firstName}!
                                </h1>
                                <p className='mt-2 max-w-lg text-sm text-white/80 sm:text-base'>
                                    {upcoming.length
                                        ? `You have ${upcoming.length} upcoming grooming appointment${upcoming.length === 1 ? '' : 's'}.`
                                        : 'You have no upcoming grooming appointments.'}
                                </p>
                            </div>

                            <div className='flex flex-col gap-3 sm:flex-row sm:shrink-0'>
                                <Link
                                    to='/profile'
                                    className='inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/20'
                                >
                                    <Settings size={15} />
                                    Manage Profile
                                </Link>
                                <Link
                                    to='/booking'
                                    className='inline-flex items-center justify-center gap-2 rounded-xl bg-[#bf5a31] px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#a94723]'
                                >
                                    <Plus size={15} />
                                    Book Appointment
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Bottom accent bar */}
                    <div className='h-1 bg-[#bf5a31]' />
                </section>

                {/* ── Quick Stats ── */}
                <section className='grid gap-4 sm:grid-cols-3'>
                    <StatCard icon={CalendarDays} label='Upcoming'       value={upcoming.length}  accent='#bf5a31' />
                    <StatCard icon={PawPrint}     label='Saved Pets'     value={pets.length}       accent='#1c3329' />
                    <StatCard icon={Scissors}     label='Completed Visits' value={completedCount}  accent='#7a5c3a' />
                </section>

                {/* ── Upcoming Appointments ── */}
                <section>
                    <div className='mb-5 flex items-center justify-between border-b border-[#e8ddd0] pb-3'>
                        <div className='flex items-center gap-2.5'>
                            <span className='grid h-8 w-8 place-items-center rounded-lg bg-[#f6ede2] text-[#bf5a31]'>
                                <CalendarDays size={17} />
                            </span>
                            <h2 className='font-serif text-2xl font-bold text-[#201711]'>Upcoming Appointments</h2>
                        </div>
                        <Link
                            to='/appointments'
                            className='inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#bf5a31] transition hover:underline'
                        >
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <LoadingCard text='Loading appointments...' />
                    ) : upcoming.length ? (
                        <div className='space-y-3.5'>
                            {upcoming.slice(0, 3).map((a) => (
                                <article
                                    key={a._id}
                                    onClick={() => setSelectedAppointment(a)}
                                    className='group relative cursor-pointer overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white shadow-xs transition hover:border-[#bf5a31]/50 hover:shadow-md active:scale-[0.99]'
                                >
                                    {/* status bar */}
                                    <span className={`absolute left-0 top-0 h-full w-1 ${STATUS_STYLES[a.status]?.bar ?? 'bg-amber-400'}`} />

                                    <div className='flex flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center'>
                                        <div className='flex items-start gap-4'>
                                            <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f6ede2] text-[#bf5a31] border border-[#e8d2c2]'>
                                                <PawPrint size={20} />
                                            </span>
                                            <div>
                                                <div className='flex flex-wrap items-center gap-2'>
                                                    <h3 className='font-serif text-lg font-bold text-[#201711] transition-colors group-hover:text-[#bf5a31]'>
                                                        {a.petName}
                                                    </h3>
                                                    <StatusPill status={a.status} />
                                                </div>
                                                <p className='mt-0.5 text-xs font-medium text-[#786150]'>
                                                    {a.service}{a.haircutStyle ? ` · ${a.haircutStyle}` : ''}
                                                </p>
                                                <p className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-[#bf5a31]'>
                                                    <span>{formatDateLong(a.date)}</span>
                                                    <span className='flex items-center gap-1 font-semibold text-[#8d7565]'>
                                                        <Clock3 size={12} />
                                                        {formatTimeRange(a.time, a.endTime)}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className='flex items-center justify-between sm:flex-col sm:items-end gap-2'>
                                            <span className='font-serif text-2xl font-bold text-[#201711]'>
                                                ₱{Number(a.price).toLocaleString('en-PH')}
                                            </span>
                                            <span className='inline-flex items-center gap-1 rounded-lg border border-[#e8ddd0] bg-[#faf6f0] px-2.5 py-1 text-xs font-bold text-[#bf5a31] transition group-hover:bg-[#bf5a31] group-hover:text-white group-hover:border-[#bf5a31]'>
                                                <Eye size={12} /> Details
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyAppointments />
                    )}
                </section>

                {/* ── My Pets ── */}
                <section>
                    <div className='mb-5 flex items-center justify-between border-b border-[#e8ddd0] pb-3'>
                        <div className='flex items-center gap-2.5'>
                            <span className='grid h-8 w-8 place-items-center rounded-lg bg-[#f6ede2] text-[#bf5a31]'>
                                <PawPrint size={17} />
                            </span>
                            <h2 className='font-serif text-2xl font-bold text-[#201711]'>My Pets</h2>
                        </div>
                        <Link
                            to='/my-pets'
                            className='inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#bf5a31] transition hover:underline'
                        >
                            Manage <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                        {pets.slice(0, 5).map((pet) => (
                            <article
                                key={pet._id}
                                className='group rounded-2xl border border-[#e8ddd0] bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#bf5a31]/40 hover:shadow-md'
                            >
                                <div className='flex items-center gap-3.5'>
                                    <span className='grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1c3329] font-bold text-white text-base'>
                                        {pet.name?.[0]?.toUpperCase() ?? '?'}
                                    </span>
                                    <div className='min-w-0'>
                                        <h3 className='font-serif text-lg font-bold text-[#201711] truncate'>{pet.name}</h3>
                                        <p className='mt-0.5 text-xs font-medium text-[#786150] truncate'>
                                            {pet.type === 'cat' ? 'Cat' : 'Dog'} · {pet.breed}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}

                        <Link
                            to='/my-pets'
                            className='group grid min-h-[92px] place-items-center rounded-2xl border border-dashed border-[#dfcfbd] bg-[#fcfaf7] text-center transition hover:border-[#bf5a31] hover:bg-[#fff9f4]'
                        >
                            <div className='flex flex-col items-center gap-1.5'>
                                <Plus className='text-[#bf5a31] transition-transform group-hover:scale-110' size={22} />
                                <span className='text-xs font-bold uppercase tracking-wider text-[#bf5a31]'>Add a Pet</span>
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
                confirmText='Yes, Cancel'
                cancelText='Keep'
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
        <div className='relative overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white p-5 shadow-xs'>
            <span className='absolute left-0 top-0 h-full w-1 rounded-l-2xl' style={{ background: accent }} />
            <span className='grid h-10 w-10 place-items-center rounded-xl' style={{ background: accent + '18' }}>
                <Icon size={19} style={{ color: accent }} />
            </span>
            <p className='mt-4 font-serif text-3xl font-bold text-[#201711]'>{value}</p>
            <p className='mt-0.5 text-xs font-semibold uppercase tracking-wider text-[#786150]'>{label}</p>
        </div>
    )
}

function StatusPill({ status }) {
    const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending
    const label = status === 'confirmed' ? 'Approved' : status === 'completed' ? 'Completed' : status === 'cancelled' ? 'Cancelled' : 'Pending'
    return (
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.pill}`}>
            {label}
        </span>
    )
}

function LoadingCard({ text }) {
    return (
        <div className='rounded-2xl border border-[#e8ddd0] bg-white p-8 text-center text-sm font-medium text-[#9c7b68]'>
            {text}
        </div>
    )
}

function EmptyAppointments() {
    return (
        <div className='rounded-2xl border border-dashed border-[#dfcfbd] bg-white p-10 text-center'>
            <span className='mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f6ede2] text-[#bf5a31]'>
                <CalendarDays size={26} />
            </span>
            <h3 className='mt-4 font-serif text-xl font-bold text-[#201711]'>No Upcoming Appointments</h3>
            <p className='mt-1.5 text-xs text-[#786150]'>Choose a service and an available schedule when you are ready.</p>
            <Link
                to='/booking'
                className='mt-5 inline-flex items-center gap-2 rounded-xl bg-[#bf5a31] px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#a94723]'
            >
                <Plus size={15} /> Start Booking
            </Link>
        </div>
    )
}
