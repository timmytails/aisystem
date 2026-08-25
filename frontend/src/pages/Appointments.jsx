import { useEffect, useMemo, useState } from 'react'
import { Calendar, CalendarDays, ChevronRight, Clock3, Eye, XCircle, Dog, Cat } from 'lucide-react'
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
    confirmed: { pill: 'bg-blue-50 text-blue-800 border-blue-200', bar: 'bg-blue-500', label: 'Approved' },
    completed: { pill: 'bg-emerald-50 text-emerald-800 border-emerald-200', bar: 'bg-emerald-500', label: 'Completed' },
    cancelled: { pill: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-400', label: 'Cancelled' },
    pending:   { pill: 'bg-amber-50 text-amber-800 border-amber-200', bar: 'bg-amber-400', label: 'Pending' }
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
        <div className='min-h-screen bg-[#FAF7F2] px-4 py-8 text-[#261C14] sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-5xl'>

                {/* Page Header */}
                <div className='mb-8 border-b border-[#E2D9C8] pb-6'>
                    <span className='inline-block rounded-full bg-[#C25E2B]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                        My Schedule
                    </span>
                    <h1 className='mt-2 font-serif text-3xl font-bold tracking-tight text-[#261C14] sm:text-4xl'>
                        Grooming Appointments
                    </h1>
                    <p className='mt-1 text-sm text-[#68594E]'>
                        Review your upcoming grooming sessions and appointment history.
                    </p>
                </div>

                {loading ? (
                    <div className='rounded-xl border border-[#E2D9C8] bg-white p-12 text-center text-sm font-medium text-[#68594E]'>
                        Loading your grooming appointments...
                    </div>
                ) : (
                    <div className='space-y-10'>
                        {/* Upcoming */}
                        <section>
                            <SectionHeader title='Upcoming Sessions' count={upcoming.length} />
                            <div className='mt-4 space-y-4'>
                                {upcoming.length ? upcoming.map((a) => (
                                    <AppointmentCard
                                        key={a._id}
                                        appointment={a}
                                        onClick={() => setSelectedAppointment(a)}
                                        onCancel={() => setConfirmCancelAppointment(a)}
                                        onReschedule={() => setRescheduleAppointment(a)}
                                    />
                                )) : <EmptyCard text='No upcoming grooming sessions scheduled.' />}
                            </div>
                        </section>

                        {/* History */}
                        <section>
                            <SectionHeader title='Past & Cancelled Visits' count={history.length} />
                            <div className='mt-4 space-y-4'>
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

function SectionHeader({ title, count }) {
    return (
        <div className='flex items-center gap-3 border-b border-[#E2D9C8] pb-3'>
            <h2 className='font-serif text-xl font-bold text-[#261C14]'>{title}</h2>
            {count > 0 && (
                <span className='rounded-full bg-[#C25E2B]/10 px-2.5 py-0.5 text-xs font-bold text-[#C25E2B]'>
                    {count}
                </span>
            )}
        </div>
    )
}

function AppointmentCard({ appointment: a, onClick, onCancel, onReschedule }) {
    const isEditable = canEditAppointmentDate(a)
    const s = STATUS[a.status] ?? STATUS.pending
    const petPhoto = a.pet?.photoUrl || a.petPhotoUrl || a.photoUrl

    return (
        <article
            onClick={onClick}
            className='group relative cursor-pointer overflow-hidden rounded-xl border border-[#E2D9C8] bg-white p-5 shadow-xs transition hover:border-[#C25E2B]/60 hover:shadow-sm'
        >
            <div className='flex flex-col justify-between gap-5 sm:flex-row sm:items-center'>
                <div className='flex items-start gap-4'>
                    {/* Pet Image Display */}
                    <div className='h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#E2D9C8] bg-[#F4EFE6]'>
                        {petPhoto ? (
                            <img src={petPhoto} alt={a.petName} className='h-full w-full object-cover' />
                        ) : (
                            <div className='flex h-full w-full items-center justify-center text-[#8C7A6D]'>
                                {a.petType === 'cat' ? <Cat size={26} /> : <Dog size={26} />}
                            </div>
                        )}
                    </div>

                    <div className='min-w-0 flex-1'>
                        <div className='flex flex-wrap items-center gap-2.5'>
                            <h3 className='font-serif text-xl font-bold text-[#261C14] transition-colors group-hover:text-[#C25E2B]'>
                                {a.petName}
                            </h3>
                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${s.pill}`}>
                                {s.label}
                            </span>
                        </div>
                        <p className='mt-0.5 text-sm font-medium text-[#68594E]'>
                            {a.service}{a.haircutStyle ? ` · Style: ${a.haircutStyle}` : ''}
                        </p>
                        <div className='mt-2 flex flex-wrap gap-4 text-xs font-bold text-[#C25E2B]'>
                            <span className='flex items-center gap-1.5'>
                                <CalendarDays size={14} />
                                {formatDateLong(a.date)}
                            </span>
                            <span className='flex items-center gap-1.5 font-semibold text-[#68594E]'>
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

                <div className='flex flex-col gap-3 border-t border-[#E2D9C8] pt-4 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0'>
                    <div className='flex items-center justify-between sm:justify-end w-full sm:w-auto'>
                        <span className='text-xs text-[#68594E] sm:hidden font-medium'>Total Amount</span>
                        <span className='font-serif text-2xl font-bold text-[#261C14]'>
                            ₱{Number(a.price).toLocaleString('en-PH')}
                        </span>
                    </div>
                    <div className='flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto'>
                        {onReschedule && isEditable && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onReschedule() }}
                                className='inline-flex flex-1 sm:flex-initial justify-center items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100 active:scale-[0.98] whitespace-nowrap'
                            >
                                <Calendar size={13} className='shrink-0' />
                                <span className='whitespace-nowrap'>Edit Date</span>
                            </button>
                        )}
                        {onCancel && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onCancel() }}
                                className='inline-flex flex-1 sm:flex-initial justify-center items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 hover:border-red-300 active:scale-[0.98] whitespace-nowrap'
                            >
                                <XCircle size={14} className='shrink-0' />
                                <span className='whitespace-nowrap'>Cancel</span>
                            </button>
                        )}
                        <span className='inline-flex flex-1 sm:flex-initial justify-center items-center gap-1.5 rounded-lg border border-[#E2D9C8] bg-[#FAF7F2] px-2.5 py-2 text-xs font-bold text-[#C25E2B] transition group-hover:bg-[#C25E2B] group-hover:text-white group-hover:border-[#C25E2B] active:scale-[0.98] whitespace-nowrap'>
                            <Eye size={13} className='shrink-0' />
                            <span className='whitespace-nowrap'>Details</span>
                            <ChevronRight size={13} className='shrink-0' />
                        </span>
                    </div>
                </div>
            </div>
        </article>
    )
}

function EmptyCard({ text }) {
    return (
        <div className='rounded-xl border border-dashed border-[#E2D9C8] bg-white px-8 py-10 text-center'>
            <div className='mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#FAF7F2] text-[#C25E2B]'>
                <CalendarDays size={22} />
            </div>
            <p className='mt-3 text-sm font-medium text-[#68594E]'>{text}</p>
        </div>
    )
}
