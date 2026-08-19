import { Link } from 'react-router-dom'
import { Bath, CalendarDays, Clock3, Ear, Scissors, Sparkles, WandSparkles } from 'lucide-react'

const services = [
    { icon: Bath,         name: 'Basic Grooming',  price: 500,  duration: '60 minutes',  desc: 'Refreshing bath with coat conditioner, gentle brush-out, nail trimming, ear hygiene, and a fluff blow dry.', ai: false },
    { icon: Sparkles,     name: 'Full Grooming',   price: 1200, duration: '120 minutes', desc: 'Complete spa care including bath, styling haircut, sanitary trim, pad cleaning, and customized coat finishing.', ai: true },
    { icon: WandSparkles, name: 'Custom Styling',  price: 1000, duration: '90 minutes',  desc: 'A specialized haircut session designed around your chosen style reference or custom coat pattern.', ai: true },
    { icon: Bath,         name: 'Bath & Blow Dry', price: 800,  duration: '90 minutes',  desc: 'Deep cleansing shampoo, soothing conditioner, thorough drying, and complete coat de-shedding brushing.', ai: false },
    { icon: Scissors,     name: 'Nail Trimming',   price: 200,  duration: '30 minutes',  desc: 'Careful nail clipping and edge smoothing for dogs and cats to maintain comfort and paw health.', ai: false },
    { icon: Ear,          name: 'Ear Cleaning',    price: 250,  duration: '30 minutes',  desc: 'Gentle external ear cleaning and wax removal to keep ears fresh, clean, and healthy.', ai: false }
]

export default function Services() {
    return (
        <div className='min-h-screen bg-[#fbf7f1] px-5 py-16 text-[#201711]'>
            <div className='mx-auto max-w-7xl'>

                {/* Header */}
                <div className='mx-auto max-w-3xl text-center'>
                    <span className='inline-block rounded-full bg-[#bf5a31]/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#bf5a31]'>
                        Grooming Menu
                    </span>
                    <h1 className='mt-3 font-serif text-4xl font-bold sm:text-5xl'>
                        Professional Care for Your Companion
                    </h1>
                    <p className='mt-5 text-base leading-relaxed text-[#765b49]'>
                        Whether your pet needs a routine bath &amp; nail trim or a full styling haircut, our certified groomers use coat-safe products tailored for every breed.
                    </p>
                </div>

                {/* Cards */}
                <div className='mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
                    {services.map((s) => {
                        const Icon = s.icon
                        return (
                            <article
                                key={s.name}
                                className='relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e5ddd0] bg-white p-7 shadow-xs transition hover:-translate-y-0.5 hover:border-[#bf5a31]/40 hover:shadow-md'
                            >
                                <span className='absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#bf5a31]' />

                                <div>
                                    <div className='flex items-start justify-between gap-3'>
                                        <span className='inline-grid h-11 w-11 place-items-center rounded-xl bg-[#f6ede2] text-[#bf5a31]'>
                                            <Icon size={20} />
                                        </span>
                                        {s.ai && (
                                            <span className='inline-flex items-center gap-1 rounded-full border border-[#b8dec9] bg-[#e6f2eb] px-3 py-1 text-[11px] font-bold text-[#1f4a38]'>
                                                <Sparkles size={12} />
                                                AI Preview
                                            </span>
                                        )}
                                    </div>
                                    <h2 className='mt-5 font-serif text-xl font-bold text-[#201711]'>{s.name}</h2>
                                    <p className='mt-2.5 min-h-14 text-sm leading-6 text-[#765b49]'>{s.desc}</p>
                                </div>

                                <div className='mt-6 flex items-center justify-between border-t border-[#ede4d8] pt-5'>
                                    <span className='font-serif text-2xl font-bold text-[#bf5a31]'>
                                        ₱{s.price.toLocaleString('en-PH')}
                                    </span>
                                    <span className='flex items-center gap-1.5 text-xs font-semibold text-[#9c7b68]'>
                                        <Clock3 size={13} />
                                        {s.duration}
                                    </span>
                                </div>
                            </article>
                        )
                    })}
                </div>

                {/* CTA Banner */}
                <div className='mt-14 overflow-hidden rounded-2xl border border-[#2a4535] bg-[#1c3329] p-8 text-center text-white shadow-md sm:p-10'>
                    <div className='flex items-center justify-center gap-2.5'>
                        <CalendarDays size={20} className='text-[#f5c26b]' />
                        <h2 className='font-serif text-2xl font-bold sm:text-3xl'>Ready to reserve a grooming slot?</h2>
                    </div>
                    <p className='mx-auto mt-3 max-w-xl text-sm leading-7 text-white/80 sm:text-base'>
                        Choose your pet profile, select your preferred haircut preview, and pick a guaranteed 2-hour schedule.
                    </p>
                    <Link
                        to='/booking'
                        className='mt-7 inline-flex items-center gap-2 rounded-xl bg-[#bf5a31] px-8 py-4 font-bold text-white shadow-sm transition hover:bg-[#a94723] active:scale-[0.98]'
                    >
                        Book an Appointment
                    </Link>
                </div>
            </div>
        </div>
    )
}
