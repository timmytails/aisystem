import { useEffect, useState } from 'react'
import { Calendar, CalendarDays, Clock3, MapPin, Phone, Scissors, Sparkles, User, XCircle } from 'lucide-react'
import { formatDateLong, formatTimeRange } from '../features/booking/utils/dateTime'
import { getRemainingEditSeconds, formatRemainingTime } from '../utils/appointmentEditWindow'

export default function AppointmentDetailsModal({ appointment, onClose, onCancel, onReschedule }) {
    if (!appointment) return null

    const [secondsLeft, setSecondsLeft] = useState(() => getRemainingEditSeconds(appointment))

    useEffect(() => {
        setSecondsLeft(getRemainingEditSeconds(appointment))
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [appointment])

    const statusLabel = appointment.status === 'confirmed' ? 'Approved' : appointment.status === 'pending' ? 'Pending' : appointment.status === 'completed' ? 'Completed' : 'Cancelled'
    const statusStyle =
        appointment.status === 'confirmed'
            ? 'bg-blue-50 text-blue-800 border-blue-200'
            : appointment.status === 'pending'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : appointment.status === 'completed'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'

    const isUpcoming = ['pending', 'confirmed'].includes(appointment.status)
    const isEditable = secondsLeft > 0 && isUpcoming

    return (
        <div
            className='fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto'
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className='w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl bg-white p-5 sm:p-6 border border-slate-200 space-y-4 text-slate-900 pb-safe'>
                {/* Header */}
                <div className='flex items-start justify-between border-b border-slate-200 pb-3.5 gap-3'>
                    <div>
                        <div className='flex items-center gap-2'>
                            <span className={`inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}>
                                {statusLabel}
                            </span>
                            {appointment._id && (
                                <span className='text-[10px] font-mono text-slate-500'>
                                    ID: #{appointment._id.slice(-6).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <h2 className='mt-1.5 font-serif text-2xl font-bold text-slate-900'>
                            {appointment.petName}
                        </h2>
                        <p className='mt-0.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider'>
                            {appointment.petType === 'cat' ? 'Cat' : 'Dog'} {appointment.breed ? `· ${appointment.breed}` : ''}
                        </p>
                    </div>

                    {/* Top Right Action / Status Badge */}
                    {isUpcoming && isEditable && onReschedule && (
                        <button
                            onClick={() => {
                                onReschedule(appointment)
                                onClose()
                            }}
                            className='inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100 shrink-0'
                        >
                            <Calendar size={14} className='text-amber-700' />
                            <span>Edit Date ({formatRemainingTime(secondsLeft)})</span>
                        </button>
                    )}
                    {isUpcoming && !isEditable && (
                        <span className='inline-block text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shrink-0' title='Rescheduling is only allowed within 3 minutes of booking.'>
                            Cannot be edited
                        </span>
                    )}
                </div>

                {/* Service & Price Details */}
                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3'>
                    <div className='flex items-start justify-between gap-4'>
                        <div className='flex items-center gap-3'>
                            <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#C25E2B] text-white'>
                                <Scissors size={16} />
                            </span>
                            <div>
                                <h3 className='font-serif text-base font-bold text-slate-900'>
                                    {appointment.service}
                                </h3>
                                {appointment.haircutStyle && (
                                    <p className='text-xs font-semibold text-[#C25E2B]'>
                                        Style: {appointment.haircutStyle}
                                    </p>
                                )}
                            </div>
                        </div>
                        <span className='font-serif text-xl font-bold text-slate-900 shrink-0'>
                            ₱{Number(appointment.price || 0).toLocaleString('en-PH')}
                        </span>
                    </div>

                    <div className='grid gap-2 pt-2.5 border-t border-slate-200 sm:grid-cols-2 text-xs text-slate-700 font-semibold'>
                        <div className='flex items-center gap-2'>
                            <CalendarDays size={14} className='text-[#C25E2B]' />
                            <span>{formatDateLong(appointment.date)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Clock3 size={14} className='text-[#C25E2B]' />
                            <span>{formatTimeRange(appointment.time, appointment.endTime)}</span>
                        </div>
                    </div>
                </div>

                {/* AI Preview Image (if available) */}
                {(appointment.aiPreviewImage || appointment.aiPreview?.generatedImage) && (
                    <div className='space-y-1.5'>
                        <div className='flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C25E2B]'>
                            <Sparkles size={13} />
                            <span>Requested Haircut Style Preview</span>
                        </div>
                        <div className='overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-center p-2'>
                            <img
                                src={appointment.aiPreviewImage || appointment.aiPreview?.generatedImage}
                                alt='Haircut preview'
                                className='max-h-52 w-full object-contain mx-auto'
                            />
                        </div>
                    </div>
                )}

                {/* Customer Information */}
                <div className='space-y-2 pt-0.5'>
                    <h4 className='text-[10px] font-bold uppercase tracking-wider text-slate-500'>
                        Customer & Appointment Info
                    </h4>
                    <div className='grid gap-2.5 text-xs text-slate-700 sm:grid-cols-2'>
                        {appointment.ownerName && (
                            <div className='flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5'>
                                <User size={15} className='shrink-0 text-[#C25E2B]' />
                                <div>
                                    <p className='text-[9px] text-slate-500 uppercase font-bold'>Pet Owner</p>
                                    <p className='font-bold text-slate-900'>{appointment.ownerName}</p>
                                </div>
                            </div>
                        )}
                        {appointment.ownerPhone && (
                            <div className='flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5'>
                                <Phone size={15} className='shrink-0 text-[#C25E2B]' />
                                <div>
                                    <p className='text-[9px] text-slate-500 uppercase font-bold'>Mobile Phone</p>
                                    <p className='font-bold text-slate-900'>{appointment.ownerPhone}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                    <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1'>
                        <p className='font-bold text-slate-700 uppercase tracking-wider text-[9px]'>Special Instructions</p>
                        <p className='text-slate-600 leading-relaxed'>&quot;{appointment.notes}&quot;</p>
                    </div>
                )}

                {/* Cancellation Reason Alert (if cancelled) */}
                {appointment.status === 'cancelled' && (
                    <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900 space-y-1'>
                        <div className='flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] text-red-700'>
                            <XCircle size={14} />
                            <span>Cancellation Explanation</span>
                        </div>
                        <p className='leading-relaxed font-medium text-xs'>
                            {appointment.cancellationReason || 'This booking was cancelled.'}
                        </p>
                    </div>
                )}

                {/* Location & Arrival Policy Reminder */}
                <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950 space-y-1'>
                    <div className='flex items-center gap-2 font-bold text-amber-900'>
                        <MapPin size={15} className='shrink-0 text-[#C25E2B]' />
                        <span>TimmyTails · Baliuag City, Bulacan</span>
                    </div>
                    <p className='pl-5 text-[11px] text-amber-900/90 leading-normal'>
                        Please arrive <strong>5–10 minutes before</strong> your appointment. Late arrival beyond 10 minutes will automatically cancel your booking.
                    </p>
                </div>

                {/* Actions */}
                <div className='flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200'>
                    {isUpcoming && onCancel && (
                        <button
                            onClick={() => {
                                onCancel(appointment)
                                onClose()
                            }}
                            className='inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 hover:border-red-300'
                        >
                            <XCircle size={14} />
                            <span>Cancel Appointment</span>
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className='rounded-lg bg-[#C25E2B] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#A84E20]'
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
