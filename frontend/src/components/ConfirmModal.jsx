import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({
    isOpen,
    title = 'Confirm Action',
    description = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
    onConfirm,
    onClose
}) {
    if (!isOpen) return null

    const isDanger = variant === 'danger'

    return (
        <div
            className='fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto'
            onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}
        >
            <div className='w-full max-w-sm overflow-hidden rounded-t-2xl sm:rounded-xl bg-white p-5 shadow-lg border border-slate-200 space-y-4 text-slate-900 pb-safe sm:pb-5'>
                <div className='flex items-start gap-3'>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${isDanger ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-[#C25E2B] border border-slate-200'}`}>
                        <AlertTriangle size={20} />
                    </span>
                    <div className='min-w-0'>
                        <h3 className='font-serif text-lg font-bold text-slate-900 leading-snug'>
                            {title}
                        </h3>
                        <p className='mt-1 text-xs text-slate-600 leading-relaxed'>
                            {description}
                        </p>
                    </div>
                </div>

                <div className='flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-200'>
                    <button
                        type='button'
                        onClick={onClose}
                        disabled={loading}
                        className='w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 text-center transition hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0'
                    >
                        {cancelText}
                    </button>
                    <button
                        type='button'
                        onClick={onConfirm}
                        disabled={loading}
                        className={`w-full sm:w-auto rounded-lg px-4 py-2 text-xs font-bold text-white text-center transition disabled:opacity-60 whitespace-nowrap shrink-0 ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-[#C25E2B] hover:bg-[#A84E20]'
                        }`}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

