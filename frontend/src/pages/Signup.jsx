import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, PawPrint } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/api'
import { normalizePhilippinePhone } from '../utils/phone'
import PhoneField from '../components/PhoneField'
import { consumeReturnTo, peekReturnTo, rememberReturnTo, resolvePostLoginRoute } from '../utils/authRouting'
import GoogleSignInButton from '../features/auth/components/GoogleSignInButton'
import loginImage from '../assets/images/login-groomer.png'

const initialForm = {
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
    address: { street: '', barangay: '', city: '', province: '' }
}

export default function Signup() {
    const [form, setForm] = useState(initialForm)
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState('details')
    const [submitting, setSubmitting] = useState(false)

    const { sendRegisterOtp, register, googleLogin } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const requestedReturnTo = useMemo(() => {
        const statePath = location.state?.returnTo
        if (statePath) rememberReturnTo(statePath)
        return statePath || peekReturnTo()
    }, [location.state])

    const routeAfterAuth = useCallback((user) => {
        const returnTo = consumeReturnTo() || requestedReturnTo
        if (!user?.profileCompleted && returnTo) rememberReturnTo(returnTo)
        navigate(resolvePostLoginRoute({ user, returnTo }), { replace: true })
    }, [navigate, requestedReturnTo])

    const update = (e) => setForm((c) => ({ ...c, [e.target.name]: e.target.value }))
    const updateAddress = (e) => setForm((c) => ({ ...c, address: { ...c.address, [e.target.name]: e.target.value } }))

    const requestOtp = async (e) => {
        e.preventDefault()
        if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return }
        const normalizedPhone = normalizePhilippinePhone(form.phone)
        if (!normalizedPhone) { toast.error('Enter a valid mobile number using +63 or 09 format'); return }
        setSubmitting(true)
        try {
            await sendRegisterOtp({ firstName: form.firstName, lastName: form.lastName, email: form.email.trim() || undefined, phone: normalizedPhone, address: form.address, password: form.password })
            setForm((c) => ({ ...c, phone: normalizedPhone }))
            setStep('otp')
            toast.success('Verification code sent')
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const verifyOtp = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const data = await register(normalizePhilippinePhone(form.phone), otp)
            toast.success('Account created')
            routeAfterAuth(data.user)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const handleGoogle = useCallback(async (credential) => {
        setSubmitting(true)
        try {
            const data = await googleLogin(credential)
            routeAfterAuth(data.user)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }, [googleLogin, routeAfterAuth])

    return (
        <div className='min-h-screen bg-[#fbf7f1] text-[#201711] lg:grid lg:min-h-screen lg:grid-cols-12'>

            {/* Left Photo Panel (Desktop) */}
            <div className='relative hidden h-full overflow-hidden bg-[#1c140e] lg:col-span-5 lg:block xl:col-span-4'>
                <img
                    src={loginImage}
                    alt='Professional groomer at TimmyTails'
                    className='h-full w-full object-cover object-center opacity-80'
                />
                <div className='absolute inset-0 bg-black/55' />

                <div className='absolute left-8 top-8 flex items-center gap-2 text-white/90'>
                    <span className='grid h-8 w-8 place-items-center rounded-lg bg-[#bf5a31]'>
                        <PawPrint size={16} />
                    </span>
                    <span className='font-serif text-sm font-bold tracking-wide'>TimmyTails</span>
                </div>

                <div className='absolute bottom-10 left-10 right-10 border-l-2 border-[#bf5a31] pl-5 text-white'>
                    <p className='font-serif text-xl leading-relaxed text-white/90'>
                        &ldquo;Join thousands of pet owners who trust TimmyTails for professional grooming care.&rdquo;
                    </p>
                    <p className='mt-3 text-xs font-semibold uppercase tracking-widest text-white/60'>
                        TimmyTails Pet Grooming
                    </p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className='flex min-h-screen items-start justify-center px-4 py-10 sm:px-6 sm:py-14 lg:col-span-7 lg:overflow-y-auto xl:col-span-8'>
                <div className='w-full max-w-2xl'>

                    {/* Back */}
                    <Link
                        to='/'
                        className='group mb-7 inline-flex items-center gap-2 text-xs font-semibold text-[#806654] transition hover:text-[#bf5a31]'
                    >
                        <ArrowLeft size={14} className='transition-transform duration-200 group-hover:-translate-x-1' />
                        Back to Home
                    </Link>

                    {/* Card */}
                    <div className='rounded-2xl border border-[#e0d3c3] bg-white p-7 shadow-sm sm:p-10'>

                        {/* Brand */}
                        <div className='mb-3 flex items-center gap-2.5'>
                            <span className='grid h-8 w-8 place-items-center rounded-xl bg-[#bf5a31] text-white shadow-sm'>
                                <PawPrint size={16} />
                            </span>
                            <span className='font-serif text-base font-bold text-[#201711]'>TimmyTails</span>
                        </div>
                        <h1 className='font-serif text-2xl font-bold tracking-tight text-[#201711] sm:text-3xl'>
                            Create an account
                        </h1>
                        <p className='mt-1.5 text-sm leading-relaxed text-[#786150]'>
                            Register using Google or create a password account verified through your mobile number.
                        </p>

                        {step === 'details' ? (
                            <>
                                {/* Google */}
                                <div className='mx-auto mt-7 flex w-full max-w-sm justify-center'>
                                    <GoogleSignInButton onCredential={handleGoogle} disabled={submitting} text='signup_with' />
                                </div>

                                {/* Divider */}
                                <div className='my-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#b5a090]'>
                                    <span className='h-px flex-1 bg-[#e8ddd0]' />
                                    <span>or register manually</span>
                                    <span className='h-px flex-1 bg-[#e8ddd0]' />
                                </div>

                                {/* Form */}
                                <form onSubmit={requestOtp} className='space-y-4'>
                                    <div className='grid gap-4 sm:grid-cols-2'>
                                        <Field label='First name' name='firstName' value={form.firstName} onChange={update} />
                                        <Field label='Last name' name='lastName' value={form.lastName} onChange={update} />
                                    </div>
                                    <div className='grid gap-4 sm:grid-cols-2'>
                                        <Field
                                            label='Email address'
                                            name='email'
                                            type='email'
                                            required={false}
                                            value={form.email}
                                            onChange={update}
                                            placeholder='example@gmail.com'
                                            help='Optional — also enables email sign-in.'
                                        />
                                        <PhoneField label='Phone number' name='phone' value={form.phone} onChange={update} placeholder='917 123 4567' />
                                    </div>

                                    {/* Address */}
                                    <div className='rounded-xl border border-[#e8ddd0] bg-[#faf7f3] px-5 py-4'>
                                        <h2 className='font-serif text-base font-bold text-[#201711]'>Home Address</h2>
                                        <p className='mt-0.5 text-xs text-[#9c7b68]'>Required for appointment scheduling.</p>
                                        <div className='mt-4 space-y-4'>
                                            <Field label='Street / House number' name='street' value={form.address.street} onChange={updateAddress} placeholder='123 Pawsome Street' />
                                            <div className='grid gap-4 sm:grid-cols-2'>
                                                <Field label='Barangay' name='barangay' value={form.address.barangay} onChange={updateAddress} />
                                                <Field label='City' name='city' value={form.address.city} onChange={updateAddress} />
                                            </div>
                                            <Field label='Province' name='province' value={form.address.province} onChange={updateAddress} />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className='grid gap-4 sm:grid-cols-2'>
                                        <Field label='Password' name='password' type='password' value={form.password} onChange={update} minLength={8} />
                                        <Field label='Confirm password' name='confirmPassword' type='password' value={form.confirmPassword} onChange={update} minLength={8} />
                                    </div>

                                    <button
                                        type='submit'
                                        disabled={submitting}
                                        className='flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#bf5a31] px-5 font-bold text-white shadow-xs transition hover:bg-[#a94723] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'
                                    >
                                        {submitting ? (
                                            <><Loader2 size={18} className='animate-spin' /><span>Sending code...</span></>
                                        ) : (
                                            <span>Send Verification Code</span>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <form onSubmit={verifyOtp} className='mt-7 space-y-4'>
                                <div className='rounded-xl border border-[#e7c6b5] bg-[#fff4ed] p-4 text-sm font-medium text-[#725746]'>
                                    Enter the 6-digit code sent to{' '}
                                    <strong className='text-[#8c3d20]'>{form.phone}</strong>.
                                </div>

                                <Field
                                    label='Verification code'
                                    name='otp'
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    inputMode='numeric'
                                    minLength={6}
                                    maxLength={6}
                                    placeholder='000000'
                                />

                                <button
                                    type='submit'
                                    disabled={submitting || otp.length !== 6}
                                    className='flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#bf5a31] px-5 font-bold text-white shadow-xs transition hover:bg-[#a94723] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'
                                >
                                    {submitting ? (
                                        <><Loader2 size={18} className='animate-spin' /><span>Creating account...</span></>
                                    ) : (
                                        <span>Verify &amp; Create Account</span>
                                    )}
                                </button>

                                <button
                                    type='button'
                                    onClick={() => setStep('details')}
                                    className='w-full text-xs font-semibold text-[#8c4a2e] transition hover:underline'
                                >
                                    ← Edit account details
                                </button>
                            </form>
                        )}

                        <p className='mt-8 text-center text-xs text-[#806654] sm:text-sm'>
                            Already registered?{' '}
                            <Link to='/login' state={{ returnTo: requestedReturnTo }} className='font-bold text-[#bf5a31] transition hover:underline'>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Field({ label, help, required = true, ...props }) {
    return (
        <label className='block'>
            <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6e5645]'>{label}</span>
            <input
                required={required}
                className='h-11 w-full rounded-xl border border-[#e0d3c3] bg-white px-4 text-sm font-medium text-[#201711] outline-none transition placeholder:text-[#b5a090] focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10'
                {...props}
            />
            {help && <span className='mt-1.5 block text-[11px] text-[#9c7b68]'>{help}</span>}
        </label>
    )
}
