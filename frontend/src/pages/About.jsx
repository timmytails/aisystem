import { createElement } from 'react'
import { Camera, CalendarDays, ShieldCheck, UserRoundCheck } from 'lucide-react'
import salonImage from '../assets/images/salon-grooming.png'

const points = [
    [Camera,         'Visual Haircut Previews',         'Upload your pet photo to visualize species-appropriate haircuts and choose the perfect look before your appointment.'],
    [CalendarDays,   'Guaranteed Time Slots',           'View live real-time availability and lock in a dedicated 2-hour window so your pet gets undivided professional attention.'],
    [UserRoundCheck, 'Personalized Companion Profiles', 'Store your pet\'s breed, coat type, and special handling preferences so our groomers are always fully prepared.'],
    [ShieldCheck,    'Certified Hygiene & Care',        'Every tool is sanitized between sessions, and our groomers strictly follow coat health and gentle stress-free care.']
]

export default function About() {
    return (
        <div className='bg-[#fbf7f1] text-[#201711]'>

            {/* Hero */}
            <section className='mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2'>
                <div>
                    <span className='inline-block rounded-full bg-[#bf5a31]/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#bf5a31]'>
                        About TimmyTails
                    </span>
                    <h1 className='mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl'>
                        Where gentle pet care meets modern visual previews.
                    </h1>
                    <p className='mt-6 text-base leading-8 text-[#765b49] sm:text-lg'>
                        At TimmyTails, we believe grooming should be a calming, enjoyable experience for every pet. TimmyTails combines certified grooming expertise with interactive visual previews, allowing pet owners to choose hairstyles with confidence and schedule convenient appointments.
                    </p>
                </div>

                <div className='overflow-hidden rounded-3xl border border-[#e0d3c3] shadow-md'>
                    <img
                        src={salonImage}
                        alt='A pet receiving gentle professional grooming'
                        className='h-[420px] w-full object-cover transition-transform duration-500 hover:scale-105'
                    />
                </div>
            </section>

            {/* Commitments */}
            <section className='border-t border-[#e8ddd0] bg-white'>
                <div className='mx-auto max-w-7xl px-6 py-20'>
                    <div className='mx-auto mb-14 max-w-2xl text-center'>
                        <span className='inline-block rounded-full bg-[#bf5a31]/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#bf5a31]'>
                            Our Commitments
                        </span>
                        <h2 className='mt-3 font-serif text-4xl font-bold tracking-tight text-[#201711] sm:text-5xl'>
                            Why Pet Owners Trust Us
                        </h2>
                    </div>

                    <div className='grid gap-5 md:grid-cols-2'>
                        {points.map(([icon, title, description]) => (
                            <article
                                key={title}
                                className='relative overflow-hidden rounded-2xl border border-[#e5ddd0] bg-[#fffdf9] p-8 shadow-xs transition hover:border-[#bf5a31]/40 hover:shadow-md'
                            >
                                <span className='absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#bf5a31]' />
                                <span className='mb-5 inline-grid h-11 w-11 place-items-center rounded-xl bg-[#f6ede2] text-[#bf5a31]'>
                                    {createElement(icon, { size: 20 })}
                                </span>
                                <h3 className='font-serif text-xl font-bold text-[#201711]'>{title}</h3>
                                <p className='mt-3 text-sm leading-7 text-[#765b49]'>{description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
