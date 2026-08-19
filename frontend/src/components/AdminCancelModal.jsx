import { useState, useEffect } from 'react'
import { AlertTriangle, X, XCircle } from 'lucide-react'

const QUICK_REASONS = [
    'Customer did not arrive on time (10+ mins late)',
    'Fully booked schedule slot',
    'Groomer unavailable / sick leave',
    'Requested cancellation by customer',
    'Pet health or safety condition',
    'Emergency studio closure'
]

export default function AdminCancelModal({
    isOpen,
    appointment,
    loading = false,
    onConfirm,
    onClose
}) {
    const [reason, setReason] = useState('')

    useEffect(() => {
        if (isOpen) {
            setReason('')
        }
    }, [isOpen])

    if (!isOpen || !appointment) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        onConfirm(reason.trim() || 'Cancelled by admin')
    }

    return (
        <div
            className='fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 animate-in fade-in duration-150'
            onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}
        >
            <div className='w-full max-w-md overflow-hidden rounded-2xl bg-white p-5 shadow-xl border border-[#eadcc9] space-y-4 text-[#201711]'>
                {/* Header */}
                <div className='flex items-center gap-3 border-b border-[#eadcc9] pb-3'>
                    <span className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 border border-red-200'>
                        <AlertTriangle size={20} />
                    </span>
                    <div>
                        <h3 className='font-serif text-lg font-bold text-[#201711] leading-tight'>
                            Cancel Appointment
                        </h3>
                        <p className='text-xs text-[#765b49] font-medium'>
                            {appointment.service} for <strong>{appointment.petName}</strong>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* Reason Input */}
                    <div>
                        <label className='block text-xs font-bold uppercase tracking-wider text-[#7b5f4c] mb-1.5'>
                            Reason for Cancellation <span className='text-red-500'>*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder='State why this booking is being cancelled. This message will be sent & shown to the pet owner...'
                            rows={3}
                            required
                            className='w-full rounded-xl border border-[#dfcfbd] p-3 text-xs outline-none focus:border-[#bf5a31] focus:ring-1 focus:ring-[#bf5a31] placeholder:text-[#a08a7b]'
                        />
                        <p className='mt-1 text-[11px] text-[#806654] italic'>
                            This explanation will be stored and displayed directly to the customer.
                        </p>
                    </div>

                    {/* Quick Selection Chips */}
                    <div>
                        <p className='text-[10px] font-bold uppercase tracking-wider text-[#7b5f4c] mb-1.5'>
                            Quick Reason Suggestions:
                        </p>
                        <div className='flex flex-wrap gap-1.5'>
                            {QUICK_REASONS.map((quickText) => (
                                <button
                                    key={quickText}
                                    type='button'
                                    onClick={() => setReason(quickText)}
                                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                        reason === quickText
                                            ? 'border-[#bf5a31] bg-[#bf5a31] text-white'
                                            : 'border-[#eadcc9] bg-[#faf6f0] text-[#4e382b] hover:bg-[#f6ede2]'
                                    }`}
                                >
                                    {quickText}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='grid grid-cols-2 gap-2.5 pt-3 border-t border-[#eadcc9]'>
                        <button
                            type='button'
                            onClick={onClose}
                            disabled={loading}
                            className='w-full rounded-xl border border-[#eadcc9] bg-white px-3 py-2.5 text-xs font-bold text-[#4e382b] text-center transition-colors hover:bg-[#faf6f0] disabled:opacity-50'
                        >
                            Keep Booking
                        </button>
                        <button
                            type='submit'
                            disabled={loading || !reason.trim()}
                            className='inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white text-center shadow-xs transition-colors hover:bg-red-700 active:scale-[0.98] disabled:opacity-50'
                        >
                            <XCircle size={14} />
                            <span>{loading ? 'Cancelling...' : 'Confirm Cancel'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
