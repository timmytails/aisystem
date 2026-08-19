import { useEffect, useMemo, useState } from 'react'
import { Calendar, CalendarDays, ChevronRight, Clock3, Eye, PawPrint, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { appointmentsApi, getErrorMessage } from '../utils/api'
import { formatDateLong, formatTimeRange } from '../features/booking/utils/dateTime'
import AppointmentDetailsModal from '../components/AppointmentDetailsModal'
import ConfirmModal from '../components/ConfirmModal'
import RescheduleModal from '../components/RescheduleModal'
import { canEditAppointmentDate } from '../utils/appointmentEditWindow'

const appointmentDate = (appointment, useEnd = false) => {
    const directValue = useEnd ? appointment.endAt : appointment.startAt
    if (directValue) return new Date(directValue)
    const time = useEnd ? (appointment.endTime || appointment.time) : appointment.time
    if (!appointment.date || !time) return new Date(0)
    return new Date(`${appointment.date}T${time}:00+08:00`)
}

const STATUS = {
    confirmed: { pill: 'bg-blue-50 text-blue-800 border-blue-200',     bar: 'bg-blue-500',    label: 'Approved' },
    completed: { pill: 'bg-emerald-50 text-emerald-800 border-emerald-200', bar: 'bg-emerald-500', label: 'Completed' },
    cancelled: { pill: 'bg-red-50 text-red-700 border-red-200',         bar: 'bg-red-400',     label: 'Cancelled' },
    pending:   { pill: 'bg-amber-50 text-amber-800 border-amber-200',   bar: 'bg-amber-400',   label: 'Pending' }
}

export default function Appointments() {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [confirmCancelAppointment, setConfirmCancelAppointment] = useState(null)
    const [cancelling, setCancelling] = useState(false)
    const [rescheduleAppointment, setRescheduleAppointment] = useState(null)

    const load = () =>
        appointmentsApi.getMy()
            .then(({ data }) => setAppointments(data.appointments || []))
            .finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    const upcoming = useMemo(() =>
        appointments
            .filter((a) => ['pending', 'confirmed'].includes(a.status) && appointmentDate(a, true) >= new Date())
            .sort((a, b) => appointmentDate(a) - appointmentDate(b)),
        [appointments]
    )
    const history = useMemo(() =>
        appointments
            .filter((a) => !upcoming.some((u) => u._id === a._id))
            .sort((a, b) => appointmentDate(b) - appointmentDate(a)),
        [appointments, upcoming]
    )

    const handleConfirmCancel = async () => {
        if (!confirmCancelAppointment) return
        setCancelling(true)
        try {
            await appointmentsApi.cancel(confirmCancelAppointment._id)
            toast.success('Appointment cancelled successfully')
            setConfirmCancelAppointment(null)
            await load()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setCancelling(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#fbf7f1] px-4 py-10 text-[#201711] sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-5xl'>

                {/* Page Header */}
                <div className='mb-10'>
                    <span className='inline-block rounded-full bg-[#bf5a31]/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#bf5a31]'>
                        My Schedule
                    </span>
                    <h1 className='mt-2 font-serif text-3xl font-bold tracking-tight text-[#201711] sm:text-4xl'>
                        Grooming Appointments
                    </h1>
                    <p className='mt-2 text-sm text-[#765b49]'>
                        Click any card to view full details, haircut previews, and schedule notes.
                    </p>
                </div>

                {loading ? (
                    <div className='rounded-2xl border border-[#e8ddd0] bg-white p-10 text-center text-sm font-medium text-[#9c7b68]'>
                        Loading appointment history...
                    </div>
                ) : (
                    <div className='space-y-10'>
                        {/* Upcoming */}
                        <section>
                            <SectionHeader title='Upcoming Sessions' count={upcoming.length} />
                            <div className='mt-4 space-y-3.5'>
                                {upcoming.length ? upcoming.map((a) => (
                                    <AppointmentCard
                                        key={a._id}
                                        appointment={a}
                                        onClick={() => setSelectedAppointment(a)}
                                        onCancel={() => setConfirmCancelAppointment(a)}
                                        onReschedule={() => setRescheduleAppointment(a)}
                                    />
                                )) : <EmptyCard text='No upcoming appointments scheduled.' />}
                            </div>
                        </section>

                        {/* History */}
                        <section>
                            <SectionHeader title='Past & Cancelled Visits' count={history.length} />
                            <div className='mt-4 space-y-3.5'>
                                {history.length ? history.map((a) => (
                                    <AppointmentCard
                                        key={a._id}
                                        appointment={a}
                                        onClick={() => setSelectedAppointment(a)}
                                    />
                                )) : <EmptyCard text='No past grooming visits recorded.' />}
                            </div>
                        </section>
                    </div>
                )}
            </div>

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
                onSuccess={() => load()}
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

function SectionHeader({ title, count }) {
    return (
        <div className='flex items-center gap-3 border-b border-[#e8ddd0] pb-3'>
            <h2 className='font-serif text-2xl font-bold text-[#201711]'>{title}</h2>
            {count > 0 && (
                <span className='rounded-full bg-[#bf5a31]/10 px-2.5 py-0.5 text-xs font-bold text-[#bf5a31]'>
                    {count}
                </span>
            )}
        </div>
    )
}

function AppointmentCard({ appointment: a, onClick, onCancel, onReschedule }) {
    const isEditable = canEditAppointmentDate(a)
    const s = STATUS[a.status] ?? STATUS.pending

    return (
        <article
            onClick={onClick}
            className='group relative cursor-pointer overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white shadow-xs transition-all duration-200 hover:border-[#bf5a31]/50 hover:shadow-md active:scale-[0.99]'
        >
            {/* Status bar */}
            <span className={`absolute left-0 top-0 h-full w-1 ${s.bar}`} />

            <div className='flex flex-col justify-between gap-5 px-6 py-5 sm:flex-row sm:items-center'>
                <div className='flex items-start gap-4'>
                    <span className='grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f6ede2] text-[#bf5a31] border border-[#e8d2c2] transition-transform group-hover:scale-105'>
                        <PawPrint size={22} />
                    </span>
                    <div>
                        <div className='flex flex-wrap items-center gap-2.5'>
                            <h3 className='font-serif text-xl font-bold text-[#201711] transition-colors group-hover:text-[#bf5a31]'>
                                {a.petName}
                            </h3>
                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${s.pill}`}>
                                {s.label}
                            </span>
                        </div>
                        <p className='mt-1 text-sm font-medium text-[#765b49]'>
                            {a.service}{a.haircutStyle ? ` · ${a.haircutStyle}` : ''}
                        </p>
                        <div className='mt-2.5 flex flex-wrap gap-4 text-xs font-bold text-[#bf5a31]'>
                            <span className='flex items-center gap-1.5'>
                                <CalendarDays size={14} />
                                {formatDateLong(a.date)}
                            </span>
                            <span className='flex items-center gap-1.5 font-semibold text-[#765b49]'>
                                <Clock3 size={14} />
                                {formatTimeRange(a.time, a.endTime)}
                            </span>
                        </div>
                        {a.status === 'cancelled' && a.cancellationReason && (
                            <p className='mt-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800'>
                                Reason: {a.cancellationReason}
                            </p>
                        )}
                    </div>
                </div>

                <div className='flex items-center justify-between border-t border-[#f0e4d7] pt-4 sm:border-t-0 sm:pt-0 sm:flex-col sm:items-end sm:justify-center gap-2.5'>
                    <span className='font-serif text-2xl font-bold text-[#201711]'>
                        ₱{Number(a.price).toLocaleString('en-PH')}
                    </span>
                    <div className='flex items-center gap-2'>
                        {onReschedule && isEditable && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onReschedule() }}
                                className='inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100'
                            >
                                <Calendar size={13} className='text-amber-700' />
                                Edit Date
                            </button>
                        )}
                        {onCancel && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onCancel() }}
                                className='inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 hover:border-red-300'
                            >
                                <XCircle size={14} />
                                Cancel
                            </button>
                        )}
                        <span className='inline-flex items-center gap-1 rounded-lg border border-[#e8ddd0] bg-[#faf6f0] px-2.5 py-1.5 text-xs font-bold text-[#bf5a31] transition group-hover:bg-[#bf5a31] group-hover:text-white group-hover:border-[#bf5a31]'>
                            <Eye size={13} />
                            Details
                            <ChevronRight size={13} />
                        </span>
                    </div>
                </div>
            </div>
        </article>
    )
}

function EmptyCard({ text }) {
    return (
        <div className='rounded-2xl border border-dashed border-[#dfcfbd] bg-white px-8 py-10 text-center'>
            <span className='mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f6ede2] text-[#bf5a31]'>
                <CalendarDays size={22} />
            </span>
            <p className='mt-3 text-sm font-medium text-[#765b49]'>{text}</p>
        </div>
    )
}
