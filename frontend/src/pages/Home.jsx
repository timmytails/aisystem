import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, Check, Clock3, Scissors, Sparkles, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { rememberReturnTo } from '../utils/authRouting'
import StyleCarousel from '../components/StyleCarousel'
import HeroCarousel from '../components/HeroCarousel'
import heroImage from '../assets/images/hero-grooming.png'
import salonImage from '../assets/images/salon-grooming.png'
import shihTzu from '../assets/images/style-shih-tzu.png'
import persian from '../assets/images/style-persian.png'
import maltese from '../assets/images/style-maltese.png'
import poodle from '../assets/images/style-poodle.png'
import mixed from '../assets/images/style-mixed.png'
import yorkie from '../assets/images/style-yorkie.png'

const services = [
    { name: 'Basic Grooming', desc: 'Refreshing bath, gentle brushing, nail trimming, ear hygiene, and a soft blow dry.', price: '₱500', duration: '60 min' },
    { name: 'Full Grooming', desc: 'Complete spa experience including bath, styling haircut, sanitary trim, and coat finishing.', price: '₱1,200', duration: '120 min', featured: true },
    { name: 'Custom Styling', desc: 'A specialized haircut session with visual AI preview options for your pet.', price: '₱1,000', duration: '90 min' },
    { name: 'Bath & Blow Dry', desc: 'Deep cleansing shampoo, coat conditioner, thorough drying, and gentle coat brushing.', price: '₱800', duration: '90 min' },
    { name: 'Nail Trimming', desc: 'Quick, safe, and stress-free nail care for dogs and cats of all sizes.', price: '₱200', duration: '30 min' },
    { name: 'Ear Cleaning', desc: 'Gentle external ear cleaning to keep your pet fresh and healthy.', price: '₱250', duration: '30 min' }
]

const gallery = [
    [shihTzu, 'Teddy Bear Cut', 'Shih Tzu'],
    [persian, 'Lion Cut', 'Persian Cat'],
    [maltese, 'Puppy Cut', 'Maltese'],
    [poodle, 'Rounded Style', 'Poodle'],
    [mixed, 'Asian Fusion Cut', 'Mixed Breed'],
    [yorkie, 'Natural Trim', 'Yorkshire Terrier']
]

const steps = [
    ['01', 'Quick Sign In', 'Create your account or sign in with Google in seconds.'],
    ['02', 'Select Pet & Service', 'Choose your saved pet profile or enter details for a new companion.'],
    ['03', 'Preview Haircut Style', 'Upload a pet photo to preview species-appropriate haircut options before your visit.'],
    ['04', 'Lock in Your Schedule', 'Pick a convenient 2-hour time slot from 8:00 AM to 4:00 PM and confirm.']
]

export default function Home() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const book = () => {
        if (user) {
            navigate(user.profileCompleted ? '/booking' : '/complete-profile')
            return
        }
        rememberReturnTo('/booking')
        navigate('/login', { state: { returnTo: '/booking', reason: 'booking-required' } })
    }

    return (
        <div className='bg-[#F8F7F4] text-slate-900'>

            {/* ── Hero Section ── */}
            <section className='relative border-b border-slate-800 bg-[#0F172A] text-white'>
                <div className='mx-auto grid max-w-7xl items-center gap-10 lg:gap-16 px-6 py-16 lg:py-20 lg:grid-cols-2'>
                    <div>
                        <span className='inline-flex items-center gap-2 rounded-md bg-[#C25E2B]/15 border border-[#C25E2B]/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                            <Sparkles size={14} />
                            <span>Professional Pet Care</span>
                        </span>

                        <h1 className='mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl text-white tracking-tight'>
                            Gentle care &amp; tailored grooming for your pets.
                        </h1>
                        <p className='mt-4 text-base leading-relaxed text-slate-300 sm:text-lg max-w-xl'>
                            Preview species-appropriate haircut styles with our visual generator, select your service package, and book your appointment in minutes.
                        </p>

                        <div className='mt-8 flex flex-wrap items-center gap-3.5'>
                            <button
                                onClick={book}
                                className='inline-flex items-center gap-2.5 rounded-lg bg-[#C25E2B] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#A84E20] active:scale-[0.98] shadow-md'
                            >
                                <CalendarDays size={18} />
                                <span>Book an Appointment</span>
                            </button>

                            {!user && (
                                <Link
                                    to='/login'
                                    className='inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-slate-700 hover:text-white'
                                >
                                    <UserRound size={18} />
                                    <span>Sign In</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    <HeroCarousel />
                </div>
            </section>

            {/* ── Services Showcase ── */}
            <section id='services' className='mx-auto max-w-7xl px-6 py-16 sm:py-20'>
                <div className='mx-auto mb-12 max-w-2xl text-center'>
                    <span className='inline-block rounded-md bg-[#C25E2B]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                        Grooming Menu
                    </span>
                    <h2 className='mt-2 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                        Services Tailored for Every Pet
                    </h2>
                    <p className='mt-3 text-sm text-slate-600 sm:text-base'>
                        We provide compassionate, hygienic grooming treatments for dogs and cats of all breeds.
                    </p>
                </div>

                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {services.map((s) => (
                        <article
                            key={s.name}
                            className={`flex flex-col justify-between rounded-xl border p-6 transition-all ${s.featured
                                    ? 'border-[#C25E2B] bg-white ring-1 ring-[#C25E2B]'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                        >
                            <div>
                                <div className='mb-4 flex items-center justify-between'>
                                    <div className='inline-grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-[#C25E2B]'>
                                        <Scissors size={20} />
                                    </div>
                                    {s.featured && (
                                        <span className='rounded bg-[#C25E2B] px-2.5 py-0.5 text-[10px] font-bold uppercase text-white'>
                                            Popular
                                        </span>
                                    )}
                                </div>
                                <h3 className='font-serif text-xl font-bold text-slate-900'>{s.name}</h3>
                                <p className='mt-2 text-sm leading-relaxed text-slate-600'>
                                    {s.desc}
                                </p>
                            </div>

                            <div className='mt-6 flex items-center justify-between border-t border-slate-100 pt-4'>
                                <span className='font-serif text-xl font-bold text-[#C25E2B]'>
                                    {s.price}
                                </span>
                                <span className='flex items-center gap-1.5 text-xs font-semibold text-slate-500'>
                                    <Clock3 size={14} />
                                    <span>{s.duration}</span>
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id='how-it-works' className='border-y border-slate-200 bg-[#0F172A] text-white'>
                <div className='mx-auto max-w-7xl px-6 py-16 sm:py-20'>
                    <div className='mx-auto mb-12 max-w-2xl text-center'>
                        <span className='inline-block rounded-md bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                            Simple Workflow
                        </span>
                        <h2 className='mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                            How Booking Works
                        </h2>
                    </div>

                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                        {steps.map(([number, title, body]) => (
                            <div
                                key={number}
                                className='rounded-xl border border-slate-800 bg-slate-900/60 p-6'
                            >
                                <span className='inline-grid h-9 w-9 place-items-center rounded-lg bg-[#C25E2B] font-mono text-sm font-bold text-white'>
                                    {number}
                                </span>
                                <h3 className='mt-4 font-serif text-lg font-bold text-white'>{title}</h3>
                                <p className='mt-1.5 text-xs leading-relaxed text-slate-300'>{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Haircut Gallery Showcase ── */}
            <section id='gallery' className='mx-auto max-w-7xl px-6 py-16 sm:py-20'>
                <div className='mx-auto mb-10 max-w-2xl text-center'>
                    <span className='inline-block rounded-md bg-[#C25E2B]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                        Style Catalog
                    </span>
                    <h2 className='mt-2 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                        Popular Haircut Styles
                    </h2>
                    <p className='mt-3 text-sm text-slate-600 sm:text-base'>
                        Reference styles crafted by our professional grooming team for dogs and cats.
                    </p>
                </div>

                <StyleCarousel />
            </section>

            {/* ── Salon Commitment & CTA ── */}
            <section id='about' className='border-t border-slate-200 bg-white text-slate-900'>
                <div className='mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 sm:py-20'>
                    <div>
                        <span className='inline-block rounded-md bg-[#C25E2B]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                            Visit TimmyTails
                        </span>
                        <h2 className='mt-3 font-serif text-3xl font-bold leading-tight text-slate-900 sm:text-4xl'>
                            Ready to schedule your pet&apos;s grooming visit?
                        </h2>

                        <div className='mt-6 space-y-3'>
                            {[
                                'Gentle handling with hypoallergenic products and coat conditioners.',
                                'Visual style selection and haircut customizer before booking.',
                                'Guaranteed 2-hour appointment slots with immediate confirmation.'
                            ].map((item) => (
                                <p key={item} className='flex items-start gap-2.5 text-sm text-slate-600'>
                                    <span className='mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-900 text-white'>
                                        <Check size={12} />
                                    </span>
                                    <span>{item}</span>
                                </p>
                            ))}
                        </div>

                        <button
                            onClick={book}
                            className='mt-8 inline-flex items-center gap-2.5 rounded-lg bg-[#C25E2B] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#A84E20] active:scale-[0.98]'
                        >
                            <CalendarDays size={18} />
                            <span>Schedule Appointment</span>
                        </button>
                    </div>

                    <div className='overflow-hidden rounded-xl border border-slate-200 bg-slate-100'>
                        <img
                            src={salonImage}
                            alt='Professional groomer caring for a dog at TimmyTails'
                            className='h-[360px] w-full object-cover'
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}
