import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, Check, Clock3, PawPrint, Scissors, Sparkles, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { rememberReturnTo } from '../utils/authRouting'
import heroImage from '../assets/images/hero-grooming.png'
import salonImage from '../assets/images/salon-grooming.png'
import shihTzu from '../assets/images/style-shih-tzu.png'
import persian from '../assets/images/style-persian.png'
import maltese from '../assets/images/style-maltese.png'
import poodle from '../assets/images/style-poodle.png'
import mixed from '../assets/images/style-mixed.png'
import yorkie from '../assets/images/style-yorkie.png'

const services = [
    { name: 'Basic Grooming',   desc: 'Refreshing bath, gentle brushing, nail trimming, ear hygiene, and a soft blow dry.',                  price: '₱500',   duration: '60 min' },
    { name: 'Full Grooming',    desc: 'Complete spa experience including bath, styling haircut, sanitary trim, and coat finishing.',           price: '₱1,200', duration: '120 min', featured: true },
    { name: 'Custom Styling',   desc: 'A specialized haircut session with visual AI preview options for your pet.',                          price: '₱1,000', duration: '90 min' },
    { name: 'Bath & Blow Dry',  desc: 'Deep cleansing shampoo, coat conditioner, thorough drying, and gentle coat brushing.',                price: '₱800',   duration: '90 min' },
    { name: 'Nail Trimming',    desc: 'Quick, safe, and stress-free nail care for dogs and cats of all sizes.',                             price: '₱200',   duration: '30 min' },
    { name: 'Ear Cleaning',     desc: 'Gentle external ear cleaning to keep your pet fresh and healthy.',                                    price: '₱250',   duration: '30 min' }
]

const gallery = [
    [shihTzu,  'Teddy Bear Cut',     'Shih Tzu'],
    [persian,  'Lion Cut',           'Persian Cat'],
    [maltese,  'Puppy Cut',          'Maltese'],
    [poodle,   'Rounded Style',      'Poodle'],
    [mixed,    'Asian Fusion Cut',   'Mixed Breed'],
    [yorkie,   'Natural Trim',       'Yorkshire Terrier']
]

const steps = [
    ['01', 'Quick Sign In',         'Register with your phone number or sign in with Google in seconds.'],
    ['02', 'Select Pet & Service',  'Choose your saved pet profile or enter details for a new furry companion.'],
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
        <div className='bg-[#fbf7f1] text-[#201711]'>

            {/* ── Hero ────────────────────────────────────────────── */}
            <section className='relative min-h-[calc(100dvh-64px)] overflow-hidden bg-[#1c140e]'>
                <img
                    src={heroImage}
                    alt='A pet receiving gentle grooming care'
                    className='absolute inset-0 h-full w-full object-cover opacity-75'
                />
                <div className='absolute inset-0 bg-black/55' />

                <div className='relative mx-auto flex min-h-[calc(100dvh-64px)] max-w-7xl items-center px-6 py-24'>
                    <div className='max-w-2xl text-white'>
                        <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#bf5a31] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white'>
                            <Sparkles size={13} />
                            Visual Grooming Style Preview
                        </div>

                        <h1 className='font-serif text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl'>
                            See your pet&apos;s new haircut before the grooming visit.
                        </h1>
                        <p className='mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg'>
                            Upload your pet&apos;s photo to preview tailored grooming styles, select your favorite service, and reserve your appointment with ease.
                        </p>

                        <div className='mt-9 flex flex-wrap gap-3'>
                            <button
                                onClick={book}
                                className='inline-flex items-center gap-2.5 rounded-xl bg-[#bf5a31] px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-[#a94723] active:scale-[0.98]'
                            >
                                <CalendarDays size={18} />
                                Book an Appointment
                            </button>

                            {!user && (
                                <Link
                                    to='/login'
                                    className='inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.98]'
                                >
                                    <UserRound size={18} />
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Services ─────────────────────────────────────────── */}
            <section id='services' className='mx-auto max-w-7xl px-6 py-20'>
                <div className='mx-auto mb-14 max-w-2xl text-center'>
                    <span className='inline-block rounded-full bg-[#bf5a31]/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#bf5a31]'>
                        Our Grooming Menu
                    </span>
                    <h2 className='mt-3 font-serif text-4xl font-bold tracking-tight text-[#201711] sm:text-5xl'>
                        Services Tailored for Every Pet
                    </h2>
                    <p className='mt-4 text-base leading-relaxed text-[#765b49]'>
                        Every pet deserves gentle, professional care. Visual AI preview is available for Full Grooming and Custom Styling.
                    </p>
                </div>

                <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
                    {services.map((s) => (
                        <article
                            key={s.name}
                            className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                                s.featured
                                    ? 'border-[#1c3329] bg-[#1c3329] text-white'
                                    : 'border-[#e5ddd0] bg-white hover:border-[#bf5a31]/40'
                            }`}
                        >
                            {/* left accent bar */}
                            {!s.featured && <span className='absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#bf5a31]' />}

                            <div>
                                <div className={`mb-5 inline-grid h-11 w-11 place-items-center rounded-xl ${s.featured ? 'bg-white/15 text-white' : 'bg-[#f6ede2] text-[#bf5a31]'}`}>
                                    <Scissors size={20} />
                                </div>
                                <h3 className='font-serif text-xl font-bold'>{s.name}</h3>
                                <p className={`mt-2.5 text-sm leading-relaxed ${s.featured ? 'text-white/85' : 'text-[#765b49]'}`}>
                                    {s.desc}
                                </p>
                            </div>

                            <div className={`mt-7 flex items-center justify-between border-t pt-4 ${s.featured ? 'border-white/15' : 'border-[#ede4d8]'}`}>
                                <span className={`font-serif text-xl font-bold ${s.featured ? 'text-[#f5c26b]' : 'text-[#bf5a31]'}`}>
                                    {s.price}
                                </span>
                                <span className={`flex items-center gap-1.5 text-xs font-semibold ${s.featured ? 'text-white/75' : 'text-[#9c7b68]'}`}>
                                    <Clock3 size={13} />{s.duration}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* ── How It Works ─────────────────────────────────────── */}
            <section id='how-it-works' className='bg-[#1c3329] text-white'>
                <div className='mx-auto max-w-7xl px-6 py-20'>
                    <div className='mx-auto mb-14 max-w-2xl text-center'>
                        <span className='inline-block rounded-full bg-white/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300'>
                            Simple Steps
                        </span>
                        <h2 className='mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl'>
                            How Booking Works
                        </h2>
                    </div>

                    <div className='grid gap-5 md:grid-cols-4'>
                        {steps.map(([number, title, body]) => (
                            <div
                                key={number}
                                className='rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/25 hover:bg-white/[0.09]'
                            >
                                <span className='inline-grid h-10 w-10 place-items-center rounded-xl bg-[#bf5a31] font-mono text-base font-bold text-white'>
                                    {number}
                                </span>
                                <h3 className='mt-5 font-serif text-lg font-bold'>{title}</h3>
                                <p className='mt-2 text-sm leading-relaxed text-white/75'>{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Gallery ──────────────────────────────────────────── */}
            <section id='gallery' className='mx-auto max-w-7xl px-6 py-20'>
                <div className='mx-auto mb-14 max-w-2xl text-center'>
                    <span className='inline-block rounded-full bg-[#bf5a31]/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#bf5a31]'>
                        Grooming Showcase
                    </span>
                    <h2 className='mt-3 font-serif text-4xl font-bold tracking-tight text-[#201711] sm:text-5xl'>
                        Popular Haircut Styles
                    </h2>
                    <p className='mt-4 leading-relaxed text-[#765b49]'>
                        Reference cuts crafted by our professional grooming team. Preview these styles on your own pet on the booking page.
                    </p>
                </div>

                <div className='grid auto-rows-[260px] gap-4 md:grid-cols-3'>
                    {gallery.map(([image, style, breed], index) => (
                        <figure
                            key={style}
                            className={`group relative overflow-hidden rounded-2xl shadow-sm ${
                                index === 0 || index === 4 ? 'md:row-span-2' : ''
                            }`}
                        >
                            <img
                                src={image}
                                alt={`${style} reference cut`}
                                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                            />
                            <figcaption className='absolute inset-x-0 bottom-0 flex items-end gap-3 bg-black/70 p-5 text-white'>
                                <span className='w-1 shrink-0 self-stretch rounded-full bg-[#bf5a31]' />
                                <div>
                                    <p className='font-serif text-lg font-bold leading-tight'>{style}</p>
                                    <p className='mt-0.5 text-xs font-medium text-[#f5a882]'>{breed}</p>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ───────────────────────────────────────── */}
            <section id='about' className='bg-[#bf5a31] text-white'>
                <div className='mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2'>
                    <div>
                        <span className='inline-block rounded-full border border-white/30 bg-black/15 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em]'>
                            Visit TimmyTails
                        </span>
                        <h2 className='mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl'>
                            Ready to pamper your pet?
                        </h2>

                        <div className='mt-8 space-y-3.5'>
                            {[
                                'Gentle handling, coat conditioning, and hypoallergenic products.',
                                'Preview haircut styles before confirming your appointment.',
                                'Guaranteed fixed 2-hour slots with instant SMS/email confirmation.'
                            ].map((item) => (
                                <p key={item} className='flex items-start gap-3 text-sm text-white/95'>
                                    <span className='mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20'>
                                        <Check size={12} className='text-[#f5c26b]' />
                                    </span>
                                    {item}
                                </p>
                            ))}
                        </div>

                        <button
                            onClick={book}
                            className='mt-9 inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-base font-bold text-[#bf5a31] shadow-md transition hover:bg-[#fff5ee] active:scale-[0.98]'
                        >
                            <CalendarDays size={18} />
                            Schedule Appointment
                        </button>
                    </div>

                    <div className='overflow-hidden rounded-3xl border border-white/20 shadow-xl'>
                        <img
                            src={salonImage}
                            alt='Professional groomer caring for a dog at TimmyTails'
                            className='h-[380px] w-full object-cover transition-transform duration-500 hover:scale-105'
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}
