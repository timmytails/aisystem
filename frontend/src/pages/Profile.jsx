import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, LockKeyhole, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/api'
import { normalizePhilippinePhone } from '../utils/phone'
import PhoneField from '../components/PhoneField'

const emptyAddress = { street: '', barangay: '', city: '', province: '' }

export default function Profile() {
    const { user, sendProfilePhoneOtp, updateProfile } = useAuth()

    const [form, setForm] = useState({ email: '', phone: '', address: emptyAddress })
    const [phoneOtp, setPhoneOtp] = useState('')
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
            email: user.email || '',
            phone: user.phone || '',
            address: { ...emptyAddress, ...(user.address || {}) }
        }))
    }, [user])

    const normalizedPhone = useMemo(() => normalizePhilippinePhone(form.phone), [form.phone])
    const storedPhone = useMemo(() => normalizePhilippinePhone(user?.phone), [user?.phone])
    const phoneChanged = normalizedPhone !== storedPhone
    const googleAccount = user?.authProvider === 'google'

    const updateAddress = (e) => {
        const { name, value } = e.target
        setForm((c) => ({ ...c, address: { ...c.address, [name]: value } }))
    }

    const updatePhoneField = (e) => {
        setForm((c) => ({ ...c, phone: e.target.value }))
        setPhoneOtp('')
        setOtpSent(false)
        setOtpTimer(0)
    }

    const requestPhoneOtp = async () => {
        if (sendingOtp || (otpSent && otpTimer > 0)) return
        if (!normalizedPhone) { toast.error('Enter a valid mobile number using +63 or 09 format'); return }
        if (!phoneChanged) { toast.error('Enter a different mobile number before requesting an OTP'); return }
        setSendingOtp(true)
        try {
            const data = await sendProfilePhoneOtp(normalizedPhone)
            setForm((c) => ({ ...c, phone: data.phone || normalizedPhone }))
            setOtpSent(true)
            setOtpTimer(60)
            toast.success('Verification code sent to your new mobile number')
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSendingOtp(false)
        }
    }

    const submit = async (e) => {
        e.preventDefault()
        if (!normalizedPhone) { toast.error('Enter a valid mobile number using +63 or 09 format'); return }
        if (phoneChanged && (!otpSent || phoneOtp.length !== 6)) { toast.error('Verify the new mobile number before saving'); return }
        setSubmitting(true)
        try {
            await updateProfile({ email: form.email.trim() || undefined, phone: normalizedPhone, phoneOtp: phoneChanged ? phoneOtp : undefined, address: form.address })
            setPhoneOtp('')
            setOtpSent(false)
            toast.success('Profile updated successfully')
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase()

    return (
        <div className='min-h-screen bg-[#F8F7F4] px-4 py-8 text-slate-900 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-3xl'>

                {/* Page header */}
                <div className='mb-8 border-b border-slate-200 pb-6'>
                    <span className='inline-block rounded-md bg-[#C25E2B]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                        Account Settings
                    </span>
                    <h1 className='mt-2 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                        My Profile
                    </h1>
                    <p className='mt-1 text-sm text-slate-600'>
                        Manage your account information, mobile phone verification, and delivery address.
                    </p>
                </div>

                <form onSubmit={submit} className='space-y-6'>
                    {/* Profile Header Card */}
                    <div className='rounded-xl border border-slate-200 bg-white p-6'>
                        <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
                            <span className='grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#0F172A] text-xl font-bold text-white'>
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt='Profile' className='h-full w-full object-cover' />
                                ) : initials ? initials : (
                                    <UserRound size={28} />
                                )}
                            </span>
                            <div>
                                <h2 className='font-serif text-2xl font-bold text-slate-900'>
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <div className='mt-1.5 flex flex-wrap items-center gap-2'>
                                    <span className='rounded-md border border-slate-200 bg-slate-50 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#C25E2B]'>
                                        Customer Account
                                    </span>
                                    {googleAccount && (
                                        <span className='rounded-md border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700'>
                                            Google SSO
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className='rounded-xl border border-slate-200 bg-white'>
                        <div className='flex items-center gap-2 border-b border-slate-200 px-6 py-4'>
                            <LockKeyhole size={18} className='text-[#C25E2B]' />
                            <h3 className='font-serif text-lg font-bold text-slate-900'>Personal Details</h3>
                        </div>

                        <div className='space-y-4 p-6'>
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <ReadOnlyField label='First Name' value={user?.firstName || ''} />
                                <ReadOnlyField label='Last Name' value={user?.lastName || ''} />
                            </div>

                            <div>
                                <Field
                                    label='Email Address'
                                    type='email'
                                    value={form.email}
                                    onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                                    readOnly={googleAccount}
                                    required={false}
                                    className={googleAccount
                                        ? 'h-10 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3.5 text-sm text-slate-500'
                                        : undefined}
                                />
                                {googleAccount && (
                                    <p className='mt-1 text-xs text-slate-500'>Managed by your Google account.</p>
                                )}
                            </div>

                            <div>
                                <PhoneField label='Mobile Number' name='phone' value={form.phone} onChange={updatePhoneField} placeholder='917 123 4567' help='Changing your number requires OTP verification.' />
                            </div>

                            {/* OTP Verification Block */}
                            {phoneChanged && (
                                <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                                        <div className='flex items-start gap-3'>
                                            <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${otpSent ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-[#C25E2B]'}`}>
                                                {otpSent ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
                                            </span>
                                            <div>
                                                <p className='font-semibold text-slate-900 text-sm'>Verify Mobile Number</p>
                                                <p className='mt-0.5 text-xs text-slate-600'>
                                                    {otpSent ? (otpTimer > 0 ? `Code sent to ${form.phone}. Resend available in ${otpTimer}s.` : `A verification code was sent to ${form.phone}.`) : 'Request a security code to confirm ownership of this number.'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type='button'
                                            onClick={requestPhoneOtp}
                                            disabled={sendingOtp || (otpSent && otpTimer > 0)}
                                            className='shrink-0 rounded-lg border border-[#C25E2B] px-3.5 py-1.5 text-xs font-bold text-[#C25E2B] transition hover:bg-[#C25E2B]/10 disabled:opacity-60'
                                        >
                                            {sendingOtp ? 'Sending...' : otpSent ? (otpTimer > 0 ? `Resend (${otpTimer}s)` : 'Resend OTP') : 'Send Code'}
                                        </button>
                                    </div>

                                    {otpSent && (
                                        <div className='mt-4'>
                                            <Field
                                                label='Six-Digit Verification Code'
                                                inputMode='numeric'
                                                autoComplete='one-time-code'
                                                value={phoneOtp}
                                                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                minLength={6}
                                                maxLength={6}
                                                placeholder='000000'
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className='rounded-xl border border-slate-200 bg-white'>
                        <div className='flex items-center gap-2 border-b border-slate-200 px-6 py-4'>
                            <MapPin size={18} className='text-[#C25E2B]' />
                            <h3 className='font-serif text-lg font-bold text-slate-900'>Home Address</h3>
                        </div>

                        <div className='space-y-4 p-6'>
                            <Field label='Street / House Number' name='street' value={form.address.street} onChange={updateAddress} placeholder='e.g. 123 Grooming Street' />
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <Field label='Barangay' name='barangay' value={form.address.barangay} onChange={updateAddress} />
                                <Field label='City' name='city' value={form.address.city} onChange={updateAddress} />
                            </div>
                            <Field label='Province' name='province' value={form.address.province} onChange={updateAddress} />
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className='flex justify-end'>
                        <button
                            disabled={submitting || (phoneChanged && (!otpSent || phoneOtp.length !== 6))}
                            className='h-10 w-full rounded-lg bg-[#C25E2B] px-8 font-bold text-white transition hover:bg-[#A84E20] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto text-sm'
                        >
                            {submitting ? 'Saving Profile...' : 'Save Profile Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function ReadOnlyField({ label, value }) {
    return (
        <label className='block'>
            <FieldLabel>{label}</FieldLabel>
            <input value={value} readOnly className='h-10 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3.5 text-sm text-slate-500' />
        </label>
    )
}

function FieldLabel({ children }) {
    return <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700'>{children}</span>
}

function Field({ label, required = true, className, ...props }) {
    return (
        <label className='block'>
            <FieldLabel>{label}</FieldLabel>
            <input
                required={required}
                className={className || 'h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#C25E2B] focus:ring-2 focus:ring-[#C25E2B]/20 placeholder:text-slate-400'}
                {...props}
            />
        </label>
    )
}
