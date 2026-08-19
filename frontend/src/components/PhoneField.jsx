import { useMemo } from 'react'

export default function PhoneField({
    label = 'Phone Number',
    name = 'phone',
    value = '',
    onChange,
    required = true,
    disabled = false,
    placeholder = '917 123 4567',
    help,
    error,
    className = ''
}) {
    // Extract local 10 digits for display (strip +63, 63, or leading 0)
    const displayValue = useMemo(() => {
        let digits = String(value || '').replace(/\D/g, '')
        if (digits.startsWith('63')) digits = digits.slice(2)
        if (digits.startsWith('0')) digits = digits.slice(1)
        return digits.slice(0, 10)
    }, [value])

    const handleChange = (e) => {
        let raw = e.target.value.replace(/\D/g, '')
        if (raw.startsWith('63')) raw = raw.slice(2)
        if (raw.startsWith('0')) raw = raw.slice(1)
        raw = raw.slice(0, 10)

        // Pass full +63... phone to parent handler
        const formatted = raw ? `+63${raw}` : ''
        onChange?.({
            target: {
                name,
                value: formatted,
                raw
            }
        })
    }

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className='block text-xs font-bold uppercase tracking-[0.14em] text-[#7b5f4c]'>
                    {label}
                </label>
            )}
            <div
                className={`flex h-11 items-center rounded-xl border bg-white overflow-hidden transition ${
                    error
                        ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10'
                        : 'border-[#e0d3c3] focus-within:border-[#bf5a31] focus-within:ring-2 focus-within:ring-[#bf5a31]/10'
                } ${disabled ? 'opacity-60' : ''}`}
            >
                <div className='flex h-full items-center gap-1.5 border-r border-[#e0d3c3] bg-[#f7f2ec] px-3 text-xs font-bold text-[#5f4637] select-none shrink-0'>
                    <span className='text-sm leading-none'>🇵🇭</span>
                    <span>+63</span>
                </div>
                <input
                    type='tel'
                    name={name}
                    placeholder={placeholder}
                    value={displayValue}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled}
                    className='h-full w-full bg-transparent px-3.5 text-sm font-mono text-[#2b2019] outline-none placeholder:font-sans placeholder:text-[#b5a090]'
                />
            </div>
            {help && <p className='text-xs text-[#806654]'>{help}</p>}
            {error && <p className='text-xs font-medium text-rose-600'>{error}</p>}
        </div>
    )
}
