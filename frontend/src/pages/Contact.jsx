import { createElement, useState } from 'react'
import { Clock3, Mail, MapPin, Phone, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { contactApi, getErrorMessage } from '../utils/api'
import PhoneField from '../components/PhoneField'

const initialForm = { name: '', email: '', phone: '', message: '' }

export default function Contact() {
    const [form, setForm] = useState(initialForm)
    const [submitting, setSubmitting] = useState(false)

    const validate = () => {
        if (!form.name.trim() || form.name.trim().length < 2) {
            toast.error('Please enter a valid full name (at least 2 characters)')
            return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
            toast.error('Please enter a valid email address (e.g. example@gmail.com)')
            return false
        }
        if (!form.phone || form.phone.replace(/\D/g, '').length < 12) {
            toast.error('Please enter a valid 10-digit mobile number (e.g. 917 123 4567)')
            return false
        }
        if (!form.message.trim() || form.message.trim().length < 10) {
            toast.error('Message must be at least 10 characters long')
            return false
        }
        return true
    }

    const submit = async (event) => {
        event.preventDefault()
        if (!validate()) return

        setSubmitting(true)
        try {
            const { data } = await contactApi.send(form)
            toast.success(data.message || 'Thank you! Your message has been sent successfully.')
            setForm(initialForm)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#fbf7f1] text-[#201711]'>
            {/* Page Header */}
            <div className='border-b border-[#e8ddd0] bg-white px-6 py-12'>
                <div className='mx-auto max-w-6xl'>
                    <span className='inline-block rounded-full bg-[#bf5a31]/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#bf5a31]'>
                        Contact TimmyTails
                    </span>
                    <h1 className='mt-3 font-serif text-4xl font-bold text-[#201711] sm:text-5xl'>
                        We&apos;re Here to Help
                    </h1>
                    <p className='mt-4 max-w-xl text-base leading-7 text-[#765b49]'>
                        Have a question about our grooming services or special coat care? Send us a message and our team will get back to you promptly.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className='mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr]'>

                {/* Info Panel */}
                <section className='space-y-4'>
                    <h2 className='font-serif text-2xl font-bold text-[#201711]'>Our Details</h2>
                    <p className='text-sm leading-6 text-[#765b49]'>
                        To book a haircut or bath appointment, visit our{' '}
                        <a href='/booking' className='font-semibold text-[#bf5a31] hover:underline'>Booking page</a>.
                    </p>

                    <div className='mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-1'>
                        <InfoCard icon={MapPin} label='Address' text='Baliuag City, Bulacan, Philippines' />
                        <InfoCard icon={Phone} label='Customer Care' text='+63 975 669 2647' />
                        <InfoCard icon={Mail} label='Email Inquiry' text='contact@timmytails.com' />
                        <InfoCard icon={Clock3} label='Operating Hours' text='Mon – Sat: 8:00 AM – 6:00 PM' />
                    </div>
                </section>

                {/* Contact Form */}
                <form onSubmit={submit} className='space-y-5 rounded-2xl border border-[#e0d3c3] bg-white p-7 shadow-xs sm:p-9'>
                    <div>
                        <h2 className='font-serif text-xl font-bold text-[#201711]'>Send a Message</h2>
                        <p className='mt-1 text-xs text-[#9c7b68]'>We typically respond within one business day.</p>
                    </div>

                    <div className='grid gap-5 sm:grid-cols-2'>
                        <Field label='Full Name' name='name' placeholder='e.g. Juan dela Cruz' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <Field label='Email Address' name='email' type='email' placeholder='example@gmail.com' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>

                    <PhoneField
                        label='Mobile Phone Number'
                        name='phone'
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder='917 123 4567'
                    />

                    <div>
                        <Label>Message</Label>
                        <textarea
                            name='message'
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            required
                            minLength={10}
                            maxLength={1000}
                            rows={5}
                            placeholder='Write your message or inquiry here (minimum 10 characters)...'
                            className='w-full rounded-xl border border-[#e0d3c3] px-4 py-3 text-sm outline-none transition placeholder:text-[#b5a090] focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10'
                        />
                        <p className='mt-1 text-right text-[11px] font-medium text-[#9c7b68]'>{form.message.length}/1000</p>
                    </div>

                    <button
                        disabled={submitting}
                        className='inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#bf5a31] px-8 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#a94723] active:scale-[0.98] disabled:opacity-60 sm:w-auto'
                    >
                        <Send size={15} />
                        {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </div>
    )
}

function InfoCard({ icon, label, text }) {
    return (
        <div className='flex items-center gap-4 rounded-2xl border border-[#e5ddd0] bg-white p-4 shadow-xs'>
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f6ede2] text-[#bf5a31]'>
                {createElement(icon, { size: 18 })}
            </span>
            <div>
                <p className='text-[10px] font-bold uppercase tracking-wider text-[#9c7b68]'>{label}</p>
                <p className='mt-0.5 text-sm font-semibold text-[#201711]'>{text}</p>
            </div>
        </div>
    )
}

function Label({ children }) {
    return <span className='mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#7b5f4c]'>{children}</span>
}

function Field({ label, ...props }) {
    return (
        <label className='block'>
            <Label>{label}</Label>
            <input
                required
                className='w-full rounded-xl border border-[#e0d3c3] px-4 py-3 text-sm outline-none transition placeholder:text-[#b5a090] focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10'
                {...props}
            />
        </label>
    )
}
