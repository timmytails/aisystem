import { createElement, useState } from 'react'
import { Link } from 'react-router-dom'
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
            toast.error('Please enter a valid email address')
            return false
        }
        if (!form.phone || form.phone.replace(/\D/g, '').length < 12) {
            toast.error('Please enter a valid 10-digit mobile number')
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
        <div className='min-h-screen bg-[#FAF7F2] text-[#261C14]'>
            {/* Page Header */}
            <div className='border-b border-[#E2D9C8] bg-white px-6 py-12'>
                <div className='mx-auto max-w-6xl'>
                    <span className='inline-block rounded-full bg-[#C25E2B]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                        Get in Touch
                    </span>
                    <h1 className='mt-2 font-serif text-3xl font-bold tracking-tight text-[#261C14] sm:text-5xl'>
                        We&apos;re Here to Help
                    </h1>
                    <p className='mt-2 max-w-xl text-sm text-[#68594E] sm:text-base'>
                        Have a question about our grooming services or special pet handling? Send us a message and our salon team will get back to you promptly.
                    </p>
                </div>
            </div>

            {/* Content Container */}
            <div className='mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8'>

                {/* Details Panel */}
                <section className='space-y-4'>
                    <h2 className='font-serif text-xl font-bold text-[#261C14]'>Contact Details</h2>
                    <p className='text-sm text-[#68594E]'>
                        Looking to schedule an appointment? Visit our{' '}
                        <Link to='/booking' className='font-bold text-[#C25E2B] hover:underline'>Booking Page</Link>.
                    </p>

                    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-1'>
                        <InfoCard icon={MapPin} label='Location' text='Baliuag City, Bulacan, Philippines' />
                        <InfoCard icon={Phone} label='Salon Phone' text='+63 975 669 2647' />
                        <InfoCard icon={Mail} label='Email Inquiry' text='contact@timmytails.com' />
                        <InfoCard icon={Clock3} label='Salon Hours' text='Mon – Sat: 8:00 AM – 6:00 PM' />
                    </div>
                </section>

                {/* Contact Form Panel */}
                <form onSubmit={submit} className='space-y-4 rounded-xl border border-[#E2D9C8] bg-white p-6 shadow-xs sm:p-8'>
                    <div>
                        <h2 className='font-serif text-xl font-bold text-[#261C14]'>Send a Message</h2>
                        <p className='mt-0.5 text-xs text-[#8C7A6D]'>We usually reply within one business day.</p>
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
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
                            rows={4}
                            placeholder='Write your inquiry or question here...'
                            className='w-full rounded-lg border border-[#E2D9C8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#C25E2B] placeholder:text-[#A8988A]'
                        />
                        <p className='mt-1 text-right text-[11px] font-medium text-[#8C7A6D]'>{form.message.length}/1000</p>
                    </div>

                    <button
                        disabled={submitting}
                        className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#C25E2B] px-6 py-3 font-bold text-white shadow-xs transition hover:bg-[#A84E20] disabled:opacity-60 sm:w-auto'
                    >
                        <Send size={15} />
                        <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

function InfoCard({ icon, label, text }) {
    return (
        <div className='flex items-center gap-3.5 rounded-xl border border-[#E2D9C8] bg-white p-4 shadow-xs'>
            <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#FAF7F2] text-[#C25E2B]'>
                {createElement(icon, { size: 18 })}
            </span>
            <div>
                <p className='text-[10px] font-bold uppercase tracking-wider text-[#8C7A6D]'>{label}</p>
                <p className='mt-0.5 text-sm font-semibold text-[#261C14]'>{text}</p>
            </div>
        </div>
    )
}

function Label({ children }) {
    return <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#68594E]'>{children}</span>
}

function Field({ label, ...props }) {
    return (
        <label className='block'>
            <Label>{label}</Label>
            <input
                required
                className='h-11 w-full rounded-lg border border-[#E2D9C8] bg-white px-3.5 text-sm outline-none transition focus:border-[#C25E2B] placeholder:text-[#A8988A]'
                {...props}
            />
        </label>
    )
}
