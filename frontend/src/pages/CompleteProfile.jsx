import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, PawPrint, ShieldCheck } from 'lucide-react'
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
    const [sendingOtp, setSendingOtp] = useState(false)
    const [submitting, setSubmitting] = useState(false)

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
    const updatePhone = (e) => { setForm((c) => ({ ...c, phone: e.target.value })); setOtp(''); setOtpSent(false) }
    const updateAddress = (e) => setForm((c) => ({ ...c, address: { ...c.address, [e.target.name]: e.target.value } }))

    const requestOtp = async () => {
        if (!normalizedPhone) { toast.error('Enter a valid mobile number using +63 or 09 format'); return }
        setSendingOtp(true)
        try {
            const data = await sendCompleteProfileOtp(normalizedPhone)
            setForm((c) => ({ ...c, phone: data.phone || normalizedPhone }))
            setOtpSent(true)
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
        <div className='min-h-screen bg-[#fbf7f1] px-5 py-12 text-[#201711]'>
            <div className='mx-auto max-w-3xl'>

                {/* Brand */}
                <div className='mb-8 flex items-center gap-3'>
                    <span className='grid h-10 w-10 place-items-center rounded-xl bg-[#bf5a31] text-white shadow-sm'>
                        <PawPrint size={19} />
                    </span>
                    <span className='font-serif text-xl font-bold'>TimmyTails</span>
                </div>

                <div className='rounded-2xl border border-[#e0d3c3] bg-white p-7 shadow-sm sm:p-10'>
                    {/* Step indicator */}
                    <div className='mb-6 flex items-center gap-3'>
                        <span className='inline-flex items-center gap-1.5 rounded-full bg-[#f6ede2] px-3.5 py-1 text-xs font-bold text-[#bf5a31]'>
                            Step 2 of 2
                        </span>
                        <span className='h-px flex-1 bg-[#e8ddd0]' />
                    </div>

                    <h1 className='font-serif text-3xl font-bold text-[#201711]'>Complete your profile</h1>
                    <p className='mt-2 text-sm leading-relaxed text-[#806654]'>
                        Google provided your verified email. Fill in your contact details and verify your mobile number before continuing.
                    </p>

                    <form onSubmit={submit} className='mt-8 space-y-5'>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <Field label='First name' name='firstName' value={form.firstName} onChange={(e) => setForm((c) => ({ ...c, firstName: e.target.value }))} />
                            <Field label='Last name'  name='lastName'  value={form.lastName}  onChange={(e) => setForm((c) => ({ ...c, lastName:  e.target.value }))} />
                        </div>

                        <label className='block'>
                            <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6e5645]'>Email address</span>
                            <input value={user?.email || ''} readOnly className='h-11 w-full rounded-xl border border-[#e0d3c3] bg-[#f7f2ec] px-4 text-sm text-[#8a7060] cursor-not-allowed' />
                            <span className='mt-1 block text-[11px] text-[#9c7b68]'>Managed by your Google account — cannot be changed here.</span>
                        </label>

                        <div>
                            <PhoneField label='Phone number' name='phone' value={form.phone} onChange={updatePhone} placeholder='917 123 4567' />
                            <p className='mt-1.5 text-[11px] text-[#9c7b68]'>Enter your 10-digit number starting with 9. Stored as +63 format.</p>
                        </div>

                        {/* OTP Section */}
                        <div className='rounded-xl border border-[#e0d3c3] bg-[#faf7f3] p-5'>
                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                                <div className='flex items-start gap-3'>
                                    <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${otpSent ? 'bg-emerald-100 text-emerald-700' : 'bg-[#f6ede2] text-[#bf5a31]'}`}>
                                        {otpSent ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
                                    </span>
                                    <div>
                                        <p className='font-semibold text-[#2b2019]'>Mobile number verification</p>
                                        <p className='mt-0.5 text-xs text-[#9c7b68]'>
                                            {otpSent ? `A code was sent to ${form.phone}.` : 'Request a one-time code before saving your profile.'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type='button'
                                    onClick={requestOtp}
                                    disabled={sendingOtp}
                                    className='shrink-0 rounded-xl border border-[#bf5a31] px-4 py-2 text-xs font-bold text-[#bf5a31] transition hover:bg-[#fff1e9] disabled:cursor-not-allowed disabled:opacity-60'
                                >
                                    {sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                                </button>
                            </div>

                            {otpSent && (
                                <div className='mt-4'>
                                    <Field
                                        label='Six-digit verification code'
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

                        {/* Address */}
                        <div className='border-t border-[#e8ddd0] pt-6'>
                            <h2 className='font-serif text-xl font-bold text-[#201711]'>Home Address</h2>
                            <p className='mt-1 text-xs text-[#9c7b68]'>All address fields are required.</p>
                            <div className='mt-4 space-y-4'>
                                <Field label='Street / House number' name='street' value={form.address.street} onChange={updateAddress} placeholder='123 Pawsome Street' autoComplete='street-address' />
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <Field label='Barangay' name='barangay' value={form.address.barangay} onChange={updateAddress} />
                                    <Field label='City'     name='city'     value={form.address.city}     onChange={updateAddress} autoComplete='address-level2' />
                                </div>
                                <Field label='Province' name='province' value={form.address.province} onChange={updateAddress} autoComplete='address-level1' />
                            </div>
                        </div>

                        <button
                            disabled={submitting || !otpSent || otp.length !== 6}
                            className='h-12 w-full rounded-xl bg-[#bf5a31] px-5 font-bold text-white shadow-xs transition hover:bg-[#a94723] disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            {submitting ? 'Saving profile...' : 'Verify & Save Profile'}
                        </button>
                    </form>

                    <button
                        onClick={() => { logout(); navigate('/login') }}
                        className='mt-5 w-full text-xs font-semibold text-[#9c7b68] transition hover:text-[#bf5a31]'
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
            <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6e5645]'>{label}</span>
            <input
                required={required}
                className='h-11 w-full rounded-xl border border-[#e0d3c3] bg-white px-4 text-sm outline-none transition placeholder:text-[#b5a090] focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10'
                {...props}
            />
        </label>
    )
}
