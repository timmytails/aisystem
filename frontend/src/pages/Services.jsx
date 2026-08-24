import { Link } from 'react-router-dom'
import { Bath, CalendarDays, Clock3, Ear, Scissors, Sparkles, WandSparkles } from 'lucide-react'

const services = [
    { icon: Bath, name: 'Basic Grooming', price: 500, duration: '60 minutes', desc: 'Refreshing bath with coat conditioner, gentle brush-out, nail trimming, ear hygiene, and a fluff blow dry.', ai: false },
    { icon: Sparkles, name: 'Full Grooming', price: 1200, duration: '120 minutes', desc: 'Complete spa care including bath, styling haircut, sanitary trim, pad cleaning, and customized coat finishing.', ai: true },
    { icon: WandSparkles, name: 'Custom Styling', price: 1000, duration: '90 minutes', desc: 'A specialized haircut session designed around your chosen style reference or custom coat pattern.', ai: true },
    { icon: Bath, name: 'Bath & Blow Dry', price: 800, duration: '90 minutes', desc: 'Deep cleansing shampoo, soothing conditioner, thorough drying, and complete coat de-shedding brushing.', ai: false },
    { icon: Scissors, name: 'Nail Trimming', price: 200, duration: '30 minutes', desc: 'Careful nail clipping and edge smoothing for dogs and cats to maintain comfort and paw health.', ai: false },
    { icon: Ear, name: 'Ear Cleaning', price: 250, duration: '30 minutes', desc: 'Gentle external ear cleaning and wax removal to keep ears fresh, clean, and healthy.', ai: false }
]

export default function Services() {
    return (
        <div className='min-h-screen bg-[#FAF7F2] px-4 py-12 text-[#261C14] sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-7xl'>

                {/* Header */}
                <div className='mx-auto max-w-3xl text-center'>
                    <span className='inline-block rounded-full bg-[#C25E2B]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                        Grooming Menu
                    </span>
                    <h1 className='mt-2 font-serif text-3xl font-bold tracking-tight text-[#261C14] sm:text-5xl'>
                        Professional Care for Your Companion
                    </h1>
                    <p className='mt-3 text-sm text-[#68594E] sm:text-base'>
                        Whether your pet needs a routine bath &amp; nail trim or a full styling haircut, our certified groomers provide compassionate treatment for every breed.
                    </p>
                </div>

                {/* Services Grid */}
                <div className='mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {services.map((s) => {
                        const Icon = s.icon
                        return (
                            <article
                                key={s.name}
                                className='flex flex-col justify-between rounded-xl border border-[#E2D9C8] bg-white p-6 shadow-xs transition hover:border-[#C25E2B]/60'
                            >
                                <div>
                                    <div className='flex items-start justify-between gap-3'>
                                        <span className='inline-grid h-10 w-10 place-items-center rounded-lg bg-[#FAF7F2] text-[#C25E2B]'>
                                            <Icon size={20} />
                                        </span>
                                        {s.ai && (
                                            <span className='inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800'>
                                                <Sparkles size={12} />
                                                <span>AI Preview</span>
                                            </span>
                                        )}
                                    </div>
                                    <h2 className='mt-4 font-serif text-xl font-bold text-[#261C14]'>{s.name}</h2>
                                    <p className='mt-2 text-sm leading-relaxed text-[#68594E]'>{s.desc}</p>
                                </div>

                                <div className='mt-6 flex items-center justify-between border-t border-[#E2D9C8] pt-4'>
                                    <span className='font-serif text-2xl font-bold text-[#C25E2B]'>
                                        ₱{s.price.toLocaleString('en-PH')}
                                    </span>
                                    <span className='flex items-center gap-1.5 text-xs font-semibold text-[#68594E]'>
                                        <Clock3 size={14} />
                                        <span>{s.duration}</span>
                                    </span>
                                </div>
                            </article>
                        )
                    })}
                </div>

                {/* CTA Banner */}
                <div className='mt-14 rounded-xl border border-[#E2D9C8] bg-[#2B4C3F] p-8 text-center text-white shadow-xs sm:p-10'>
                    <div className='flex items-center justify-center gap-2'>
                        <CalendarDays size={20} className='text-amber-200' />
                        <h2 className='font-serif text-2xl font-bold sm:text-3xl'>Ready to reserve a grooming slot?</h2>
                    </div>
                    <p className='mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base'>
                        Select your saved pet profile, pick your preferred haircut style preview, and confirm a guaranteed 2-hour schedule.
                    </p>
                    <Link
                        to='/booking'
                        className='mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C25E2B] px-7 py-3.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#A84E20]'
                    >
                        <span>Book an Appointment</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
