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
            className='fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 animate-in fade-in duration-150'
            onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}
        >
            <div className='w-full max-w-sm overflow-hidden rounded-2xl bg-white p-5 shadow-lg border border-[#eadcc9] space-y-4 text-[#201711]'>
                <div className='flex items-start gap-3'>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isDanger ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[#f6ede2] text-[#bf5a31] border border-[#e8d2c2]'}`}>
                        <AlertTriangle size={20} />
                    </span>
                    <div className='min-w-0'>
                        <h3 className='font-serif text-lg font-bold text-[#201711] leading-snug'>
                            {title}
                        </h3>
                        <p className='mt-1 text-xs text-[#765b49] leading-relaxed'>
                            {description}
                        </p>
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-2.5 pt-3 border-t border-[#eadcc9]'>
                    <button
                        type='button'
                        onClick={onClose}
                        disabled={loading}
                        className='w-full rounded-xl border border-[#eadcc9] bg-white px-3 py-2.5 text-xs font-bold text-[#4e382b] text-center transition-colors hover:bg-[#faf6f0] disabled:opacity-50 truncate'
                    >
                        {cancelText}
                    </button>
                    <button
                        type='button'
                        onClick={onConfirm}
                        disabled={loading}
                        className={`w-full rounded-xl px-3 py-2.5 text-xs font-bold text-white text-center shadow-xs transition-colors active:scale-[0.98] disabled:opacity-60 truncate ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-[#bf5a31] hover:bg-[#a94723]'
                        }`}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

