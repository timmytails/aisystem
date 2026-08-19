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
    const [sendingOtp, setSendingOtp] = useState(false)
    const [submitting, setSubmitting] = useState(false)

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
    }

    const requestPhoneOtp = async () => {
        if (!normalizedPhone) { toast.error('Enter a valid mobile number using +63 or 09 format'); return }
        if (!phoneChanged) { toast.error('Enter a different mobile number before requesting an OTP'); return }
        setSendingOtp(true)
        try {
            const data = await sendProfilePhoneOtp(normalizedPhone)
            setForm((c) => ({ ...c, phone: data.phone || normalizedPhone }))
            setOtpSent(true)
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
        <div className='min-h-screen bg-[#fbf7f1] px-5 py-12 text-[#201711]'>
            <div className='mx-auto max-w-4xl'>

                {/* Page header */}
                <div className='mb-8'>
                    <span className='inline-block rounded-full bg-[#bf5a31]/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#bf5a31]'>
                        Account Settings
                    </span>
                    <h1 className='mt-2 font-serif text-3xl font-bold text-[#201711] sm:text-4xl'>My Profile</h1>
                    <p className='mt-1.5 text-sm text-[#806654]'>Update your contact information and home address.</p>
                </div>

                <form onSubmit={submit} className='space-y-7'>
                    {/* Profile header card */}
                    <div className='overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white shadow-xs'>
                        <div className='h-1 bg-[#1c3329]' />
                        <div className='flex flex-col gap-5 px-7 py-6 sm:flex-row sm:items-center'>
                            {/* Avatar */}
                            <span className='grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#1c3329] text-lg font-bold text-white shadow-sm'>
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt='Profile' className='h-full w-full object-cover' />
                                ) : initials ? initials : (
                                    <UserRound size={26} />
                                )}
                            </span>
                            <div>
                                <h2 className='font-serif text-2xl font-bold text-[#201711]'>
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <div className='mt-1.5 flex flex-wrap items-center gap-2'>
                                    <span className='rounded-full border border-[#e8d2c2] bg-[#f6ede2] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#bf5a31]'>
                                        Customer Account
                                    </span>
                                    {googleAccount && (
                                        <span className='rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700'>
                                            Google
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className='overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white shadow-xs'>
                        <div className='flex items-center gap-2.5 border-b border-[#e8ddd0] px-7 py-4'>
                            <span className='grid h-8 w-8 place-items-center rounded-lg bg-[#f6ede2] text-[#bf5a31]'>
                                <LockKeyhole size={16} />
                            </span>
                            <h3 className='font-serif text-lg font-bold text-[#201711]'>Personal Information</h3>
                        </div>

                        <div className='space-y-5 px-7 py-6'>
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <ReadOnlyField label='First name' value={user?.firstName || ''} />
                                <ReadOnlyField label='Last name'  value={user?.lastName  || ''} />
                            </div>
                            <p className='text-xs text-[#9c7b68]'>Your account name cannot be edited from the customer profile.</p>

                            <div>
                                <Field
                                    label='Email address'
                                    type='email'
                                    value={form.email}
                                    onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                                    readOnly={googleAccount}
                                    required={false}
                                    className={googleAccount
                                        ? 'h-11 w-full cursor-not-allowed rounded-xl border border-[#e0d3c3] bg-[#f7f2ec] px-4 text-sm text-[#8a7060]'
                                        : undefined}
                                />
                                {googleAccount && (
                                    <p className='mt-1.5 text-xs text-[#9c7b68]'>Managed by your Google account — cannot be changed here.</p>
                                )}
                            </div>

                            <div>
                                <PhoneField label='Mobile number' name='phone' value={form.phone} onChange={updatePhoneField} placeholder='917 123 4567' help='A changed number must be verified by OTP.' />
                            </div>

                            {/* OTP verification */}
                            {phoneChanged && (
                                <div className='rounded-xl border border-[#e0d3c3] bg-[#faf7f3] p-5'>
                                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                                        <div className='flex items-start gap-3'>
                                            <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${otpSent ? 'bg-emerald-100 text-emerald-700' : 'bg-[#f6ede2] text-[#bf5a31]'}`}>
                                                {otpSent ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
                                            </span>
                                            <div>
                                                <p className='font-semibold text-[#2b2019]'>Verify new mobile number</p>
                                                <p className='mt-0.5 text-xs text-[#9c7b68]'>
                                                    {otpSent ? `A code was sent to ${form.phone}.` : 'Request a code to confirm that you own this number.'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type='button'
                                            onClick={requestPhoneOtp}
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

                    {/* Address */}
                    <div className='overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white shadow-xs'>
                        <div className='flex items-center gap-2.5 border-b border-[#e8ddd0] px-7 py-4'>
                            <span className='grid h-8 w-8 place-items-center rounded-lg bg-[#f6ede2] text-[#bf5a31]'>
                                <MapPin size={16} />
                            </span>
                            <h3 className='font-serif text-lg font-bold text-[#201711]'>Home Address</h3>
                        </div>

                        <div className='space-y-4 px-7 py-6'>
                            <p className='text-xs text-[#9c7b68]'>All address fields are required.</p>
                            <Field label='Street / House number' name='street' value={form.address.street} onChange={updateAddress} placeholder='123 Pawsome Street' />
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <Field label='Barangay' name='barangay' value={form.address.barangay} onChange={updateAddress} />
                                <Field label='City'     name='city'     value={form.address.city}     onChange={updateAddress} />
                            </div>
                            <Field label='Province' name='province' value={form.address.province} onChange={updateAddress} />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className='flex justify-end'>
                        <button
                            disabled={submitting || (phoneChanged && (!otpSent || phoneOtp.length !== 6))}
                            className='h-12 w-full rounded-xl bg-[#bf5a31] px-8 font-bold text-white shadow-xs transition hover:bg-[#a94723] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
                        >
                            {submitting ? 'Saving changes...' : 'Save Changes'}
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
            <input value={value} readOnly className='h-11 w-full cursor-not-allowed rounded-xl border border-[#e0d3c3] bg-[#f7f2ec] px-4 text-sm text-[#8a7060]' />
        </label>
    )
}

function FieldLabel({ children }) {
    return <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6e5645]'>{children}</span>
}

function Field({ label, required = true, className, ...props }) {
    return (
        <label className='block'>
            <FieldLabel>{label}</FieldLabel>
            <input
                required={required}
                className={className || 'h-11 w-full rounded-xl border border-[#e0d3c3] bg-white px-4 text-sm outline-none transition placeholder:text-[#b5a090] focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10'}
                {...props}
            />
        </label>
    )
}
