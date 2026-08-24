import { createElement } from 'react'
import { Camera, CalendarDays, ShieldCheck, UserRoundCheck } from 'lucide-react'
import salonImage from '../assets/images/salon-grooming.png'

const points = [
    [Camera, 'Visual Haircut Previews', 'Upload your pet photo to visualize species-appropriate haircuts and choose the perfect look before your appointment.'],
    [CalendarDays, 'Guaranteed Time Slots', 'View real-time availability and lock in a dedicated 2-hour window so your pet gets undivided professional attention.'],
    [UserRoundCheck, 'Companion Profiles', 'Store your pet’s breed, coat type, and special handling preferences so our groomers are always fully prepared.'],
    [ShieldCheck, 'Certified Hygiene & Care', 'Every tool is sanitized between sessions, and our groomers strictly follow coat health and gentle stress-free care.']
]

export default function About() {
    return (
        <div className='bg-[#FAF7F2] text-[#261C14]'>

            {/* Hero Section */}
            <section className='mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 sm:py-20'>
                <div>
                    <span className='inline-block rounded-full bg-[#C25E2B]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                        About TimmyTails
                    </span>
                    <h1 className='mt-2 font-serif text-3xl font-bold leading-tight text-[#261C14] sm:text-5xl'>
                        Where gentle pet care meets modern visual previews.
                    </h1>
                    <p className='mt-4 text-sm leading-relaxed text-[#68594E] sm:text-base'>
                        At TimmyTails, we believe grooming should be a calming, enjoyable experience for every pet. TimmyTails combines certified grooming expertise with interactive visual previews, allowing pet owners to choose hairstyles with confidence and schedule convenient appointments.
                    </p>
                </div>

                <div className='overflow-hidden rounded-xl border border-[#E2D9C8] bg-white shadow-xs'>
                    <img
                        src={salonImage}
                        alt='A pet receiving gentle professional grooming'
                        className='h-[380px] w-full object-cover'
                    />
                </div>
            </section>

            {/* Commitments Section */}
            <section className='border-t border-[#E2D9C8] bg-white'>
                <div className='mx-auto max-w-7xl px-6 py-16 sm:py-20'>
                    <div className='mx-auto mb-12 max-w-2xl text-center'>
                        <span className='inline-block rounded-full bg-[#C25E2B]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                            Our Commitments
                        </span>
                        <h2 className='mt-2 font-serif text-3xl font-bold tracking-tight text-[#261C14] sm:text-4xl'>
                            Why Pet Owners Trust Us
                        </h2>
                    </div>

                    <div className='grid gap-6 md:grid-cols-2'>
                        {points.map(([icon, title, description]) => (
                            <article
                                key={title}
                                className='rounded-xl border border-[#E2D9C8] bg-[#FAF7F2] p-6 shadow-xs transition hover:border-[#C25E2B]/60'
                            >
                                <span className='mb-4 inline-grid h-10 w-10 place-items-center rounded-lg bg-white text-[#C25E2B] border border-[#E2D9C8]'>
                                    {createElement(icon, { size: 20 })}
                                </span>
                                <h3 className='font-serif text-lg font-bold text-[#261C14]'>{title}</h3>
                                <p className='mt-2 text-sm leading-relaxed text-[#68594E]'>{description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
