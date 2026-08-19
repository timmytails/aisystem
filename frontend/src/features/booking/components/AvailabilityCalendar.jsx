import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, monthFromKey, toDateKey, toMonthKey } from '../utils/dateTime'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AvailabilityCalendar({
    monthKey,
    selectedDate,
    statuses,
    onMonthChange,
    onSelect,
    minDate,
    maxDate,
    loading
}) {
    const monthDate = monthFromKey(monthKey)
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const firstDay = new Date(year, month, 1, 12).getDay()
    const daysInMonth = new Date(year, month + 1, 0, 12).getDate()
    const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, index) => index + 1))
    const previousMonth = toMonthKey(addMonths(monthDate, -1))
    const nextMonth = toMonthKey(addMonths(monthDate, 1))
    const minMonth = minDate.slice(0, 7)
    const maxMonth = maxDate.slice(0, 7)

    return (
        <div className='rounded-2xl border border-[#e5d6c5] bg-white p-5'>
            <div className='mb-5 flex items-center justify-between'>
                <button
                    type='button'
                    disabled={previousMonth < minMonth}
                    onClick={() => onMonthChange(previousMonth)}
                    className='grid h-9 w-9 place-items-center rounded-full border border-[#e4d5c4] disabled:cursor-not-allowed disabled:opacity-30'
                    aria-label='Previous month'
                >
                    <ChevronLeft size={18} />
                </button>
                <h3 className='font-serif text-xl font-bold'>{monthDate.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</h3>
                <button
                    type='button'
                    disabled={nextMonth > maxMonth}
                    onClick={() => onMonthChange(nextMonth)}
                    className='grid h-9 w-9 place-items-center rounded-full border border-[#e4d5c4] disabled:cursor-not-allowed disabled:opacity-30'
                    aria-label='Next month'
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className='grid grid-cols-7 gap-1 text-center'>
                {weekdays.map((day) => <div key={day} className='py-2 text-[11px] font-bold uppercase tracking-wide text-[#937867]'>{day}</div>)}
                {cells.map((day, index) => {
                    if (!day) return <div key={`blank-${index}`} />
                    const dateKey = toDateKey(new Date(year, month, day, 12))
                    const status = statuses[dateKey] || (loading ? 'loading' : 'available')
                    const selected = selectedDate === dateKey
                    const disabled = dateKey < minDate || dateKey > maxDate || ['past', 'closed', 'fully-booked', 'outside-range', 'loading'].includes(status)
                    const className = selected
                        ? 'border-[#a84522] bg-[#bf5a31] text-white'
                        : status === 'fully-booked' || status === 'closed'
                            ? 'border-red-200 bg-red-50 text-red-500'
                            : status === 'past' || status === 'outside-range'
                                ? 'border-stone-200 bg-stone-100 text-stone-400'
                                : 'border-[#eadfce] bg-white text-[#2d211a] hover:border-[#bd5a34] hover:bg-[#fff6f0]'

                    return (
                        <button
                            key={dateKey}
                            type='button'
                            disabled={disabled}
                            onClick={() => onSelect(dateKey)}
                            className={`aspect-square rounded-xl border text-sm font-bold transition disabled:cursor-not-allowed ${className}`}
                            title={status === 'fully-booked' ? 'Fully booked' : status === 'closed' ? 'Closed' : ''}
                        >
                            {day}
                        </button>
                    )
                })}
            </div>

            <div className='mt-5 flex flex-wrap gap-4 border-t border-[#eee2d4] pt-4 text-xs text-[#806654]'>
                <Legend className='bg-white border-[#eadfce]' label='Available' />
                <Legend className='bg-red-50 border-red-200' label='Booked or closed' />
                <Legend className='bg-stone-100 border-stone-200' label='Past or unavailable' />
            </div>
        </div>
    )
}

function Legend({ className, label }) {
    return <span className='flex items-center gap-2'><span className={`h-4 w-4 rounded border ${className}`} />{label}</span>
}
