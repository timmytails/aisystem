import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/api'
import { consumeReturnTo } from '../utils/authRouting'
import { normalizePhilippinePhone } from '../utils/phone'
import PhoneField from '../components/PhoneField'

const emptyAddress = { street: '', barangay: '', city: '', province: '' }

export default function CompleteProfile() {
    const { user, sendCompleteProfileOtp, completeProfile, logout } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: emptyAddress })
    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [otpTimer, setOtpTimer] = useState(0)
    const [sendingOtp, setSendingOtp] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (otpTimer <= 0) return
        const interval = setInterval(() => {
            setOtpTimer((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [otpTimer])

    useEffect(() => {
        if (!user) return
        queueMicrotask(() => setForm({
            firstName: user.firstName || '',
            lastName:  user.lastName  || '',
            phone:     user.phone     || '',
            address:   { ...emptyAddress, ...(user.address || {}) }
        }))
    }, [user])

    const normalizedPhone = useMemo(() => normalizePhilippinePhone(form.phone), [form.phone])
    const updatePhone = (e) => { setForm((c) => ({ ...c, phone: e.target.value })); setOtp(''); setOtpSent(false); setOtpTimer(0) }
    const updateAddress = (e) => setForm((c) => ({ ...c, address: { ...c.address, [e.target.name]: e.target.value } }))

    const requestOtp = async () => {
        if (sendingOtp || (otpSent && otpTimer > 0)) return
        if (!normalizedPhone) { toast.error('Enter a valid mobile number using +63 or 09 format'); return }
        setSendingOtp(true)
        try {
            const data = await sendCompleteProfileOtp(normalizedPhone)
            setForm((c) => ({ ...c, phone: data.phone || normalizedPhone }))
            setOtpSent(true)
            setOtpTimer(60)
            toast.success('Verification code sent to your mobile number')
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSendingOtp(false)
        }
    }

    const submit = async (e) => {
        e.preventDefault()
        if (!normalizedPhone) { toast.error('Enter a valid mobile number'); return }
        if (!otpSent || otp.length !== 6) { toast.error('Verify your mobile number using the 6-digit OTP'); return }
        setSubmitting(true)
        try {
            await completeProfile({ ...form, phone: normalizedPhone, otp })
            toast.success('Profile completed')
            navigate(consumeReturnTo() || '/dashboard', { replace: true })
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#F8F7F4] px-4 py-12 text-slate-900 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-2xl'>

                {/* Brand title */}
                <div className='mb-6'>
                    <span className='font-serif text-2xl font-bold tracking-tight text-slate-900'>
                        TimmyTails
                    </span>
                </div>

                <div className='rounded-xl border border-slate-200 bg-white p-6 sm:p-10'>
                    {/* Step indicator */}
                    <div className='mb-6 flex items-center gap-3'>
                        <span className='inline-flex items-center gap-1.5 rounded-md bg-[#C25E2B]/10 px-3 py-1 text-xs font-bold text-[#C25E2B]'>
                            Step 2 of 2
                        </span>
                        <span className='h-px flex-1 bg-slate-200' />
                    </div>

                    <h1 className='font-serif text-3xl font-bold text-slate-900'>Complete Your Profile</h1>
                    <p className='mt-1 text-sm text-slate-600'>
                        Your Google account is connected. Please fill in your contact details and verify your mobile number.
                    </p>

                    <form onSubmit={submit} className='mt-6 space-y-4'>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <Field label='First Name' name='firstName' value={form.firstName} onChange={(e) => setForm((c) => ({ ...c, firstName: e.target.value }))} />
                            <Field label='Last Name'  name='lastName'  value={form.lastName}  onChange={(e) => setForm((c) => ({ ...c, lastName:  e.target.value }))} />
                        </div>

                        <label className='block'>
                            <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700'>Email Address</span>
                            <input value={user?.email || ''} readOnly className='h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3.5 text-sm text-slate-500 cursor-not-allowed' />
                            <span className='mt-1 block text-xs text-slate-500'>Managed by your Google account.</span>
                        </label>

                        <div>
                            <PhoneField label='Mobile Number' name='phone' value={form.phone} onChange={updatePhone} placeholder='917 123 4567' />
                        </div>

                        {/* OTP Block */}
                        <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                                <div className='flex items-start gap-3'>
                                    <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${otpSent ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-[#C25E2B]'}`}>
                                        {otpSent ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
                                    </span>
                                    <div>
                                        <p className='font-semibold text-slate-900 text-sm'>Mobile Phone Verification</p>
                                        <p className='mt-0.5 text-xs text-slate-600'>
                                            {otpSent ? (otpTimer > 0 ? `Code sent to ${form.phone}. Resend available in ${otpTimer}s.` : `A verification code was sent to ${form.phone}.`) : 'Request an OTP code before saving.'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type='button'
                                    onClick={requestOtp}
                                    disabled={sendingOtp || (otpSent && otpTimer > 0)}
                                    className='shrink-0 rounded-lg border border-[#C25E2B] px-3.5 py-1.5 text-xs font-bold text-[#C25E2B] transition hover:bg-[#C25E2B]/10 disabled:opacity-60'
                                >
                                    {sendingOtp ? 'Sending...' : otpSent ? (otpTimer > 0 ? `Resend (${otpTimer}s)` : 'Resend OTP') : 'Send OTP'}
                                </button>
                            </div>

                            {otpSent && (
                                <div className='mt-4'>
                                    <Field
                                        label='Six-Digit Verification Code'
                                        name='otp'
                                        inputMode='numeric'
                                        autoComplete='one-time-code'
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        minLength={6}
                                        maxLength={6}
                                        placeholder='000000'
                                    />
                                </div>
                            )}
                        </div>

                        {/* Address Block */}
                        <div className='border-t border-slate-200 pt-5'>
                            <h2 className='font-serif text-lg font-bold text-slate-900'>Home Address</h2>
                            <p className='mt-0.5 text-xs text-slate-500'>Required for grooming appointment confirmation.</p>
                            <div className='mt-4 space-y-4'>
                                <Field label='Street / House Number' name='street' value={form.address.street} onChange={updateAddress} placeholder='e.g. 123 Grooming Street' autoComplete='street-address' />
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <Field label='Barangay' name='barangay' value={form.address.barangay} onChange={updateAddress} />
                                    <Field label='City'     name='city'     value={form.address.city}     onChange={updateAddress} autoComplete='address-level2' />
                                </div>
                                <Field label='Province' name='province' value={form.address.province} onChange={updateAddress} autoComplete='address-level1' />
                            </div>
                        </div>

                        <button
                            disabled={submitting || !otpSent || otp.length !== 6}
                            className='h-10 w-full rounded-lg bg-[#C25E2B] px-5 font-bold text-white transition hover:bg-[#A84E20] disabled:opacity-60 text-sm'
                        >
                            {submitting ? 'Saving Profile...' : 'Verify & Save Profile'}
                        </button>
                    </form>

                    <button
                        onClick={() => { logout(); navigate('/login') }}
                        className='mt-5 w-full text-xs font-bold text-slate-600 hover:text-slate-900'
                    >
                        Sign out and use another account
                    </button>
                </div>
            </div>
        </div>
    )
}

function Field({ label, required = true, ...props }) {
    return (
        <label className='block'>
            <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700'>{label}</span>
            <input
                required={required}
                className='h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#C25E2B] focus:ring-2 focus:ring-[#C25E2B]/20 placeholder:text-slate-400'
                {...props}
            />
        </label>
    )
}
