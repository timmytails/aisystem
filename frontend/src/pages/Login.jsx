import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Ban, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage, warmupBackendServer } from '../utils/api'
import { consumeReturnTo, peekReturnTo, rememberReturnTo, resolvePostLoginRoute } from '../utils/authRouting'
import GoogleSignInButton from '../features/auth/components/GoogleSignInButton'
import loginImage from '../assets/images/login-groomer.png'

export default function Login() {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const location = useLocation()
    const navigate = useNavigate()
    const { login, googleLogin } = useAuth()

    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
    const urlReason = searchParams.get('reason')
    const urlMsg = searchParams.get('msg')

    const initialBanMsg = useMemo(() => {
        if (urlReason === 'banned' || urlReason === 'blocked' || urlReason === 'suspended') {
            return urlMsg || 'Your customer account has been suspended by salon administration.'
        }
        return ''
    }, [urlReason, urlMsg])

    const [banErrorMsg, setBanErrorMsg] = useState(initialBanMsg)

    useEffect(() => {
        if (initialBanMsg) setBanErrorMsg(initialBanMsg)
    }, [initialBanMsg])

    useEffect(() => {
        // Pre-warm backend container as soon as user opens Login page
        warmupBackendServer()
    }, [])

    const requestedReturnTo = useMemo(() => {
        const statePath = location.state?.returnTo || location.state?.from
        if (statePath) rememberReturnTo(statePath)
        return statePath || peekReturnTo()
    }, [location.state])

    const finishLogin = useCallback((user) => {
        const returnTo = consumeReturnTo() || requestedReturnTo
        if (!user?.profileCompleted && returnTo) rememberReturnTo(returnTo)
        navigate(resolvePostLoginRoute({ user, returnTo }), { replace: true })
    }, [navigate, requestedReturnTo])

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (submitting) return
        setSubmitting(true)
        setBanErrorMsg('')
        try {
            const data = await login(identifier.trim(), password)
            toast.success('Signed in successfully')
            finishLogin(data.user)
        } catch (error) {
            const msg = getErrorMessage(error)
            if (error?.response?.status === 403 || msg.toLowerCase().includes('suspended') || msg.toLowerCase().includes('banned') || msg.toLowerCase().includes('blocked')) {
                setBanErrorMsg(msg || 'Your customer account has been suspended by salon administration.')
            }
            toast.error(msg)
        } finally {
            setSubmitting(false)
        }
    }

    const handleGoogle = useCallback(async (credential) => {
        setSubmitting(true)
        setBanErrorMsg('')
        try {
            const data = await googleLogin(credential)
            toast.success(data.user.profileCompleted ? 'Signed in successfully' : 'Complete your profile to continue')
            finishLogin(data.user)
        } catch (error) {
            const msg = getErrorMessage(error)
            if (error?.response?.status === 403 || msg.toLowerCase().includes('suspended') || msg.toLowerCase().includes('banned') || msg.toLowerCase().includes('blocked')) {
                setBanErrorMsg(msg || 'Your customer account has been suspended by salon administration.')
            }
            toast.error(msg)
        } finally {
            setSubmitting(false)
        }
    }, [finishLogin, googleLogin])

    return (
        <div className='min-h-screen w-full bg-[#F8F7F4] text-slate-900 lg:grid lg:h-screen lg:grid-cols-12 lg:overflow-hidden'>

            {/* Left Image Side */}
            <div className='relative hidden h-full overflow-hidden bg-[#0F172A] lg:col-span-5 lg:block xl:col-span-6'>
                <img
                    src={loginImage}
                    alt='Professional groomer pampering a pet'
                    className='h-full w-full object-cover opacity-60'
                />
                <div className='absolute inset-0 bg-slate-950/40' />

                {/* Brand title */}
                <div className='absolute left-8 top-8'>
                    <span className='font-serif text-2xl font-bold tracking-tight text-white'>
                        TimmyTails
                    </span>
                </div>

                {/* Bottom quote */}
                <div className='absolute bottom-10 left-10 right-10 border-l-2 border-[#C25E2B] pl-4 text-white'>
                    <p className='font-serif text-xl leading-relaxed text-slate-200'>
                        &ldquo;Gentle, professional pet care with visual haircut style previews.&rdquo;
                    </p>
                    <p className='mt-2 text-xs font-bold uppercase tracking-widest text-slate-400'>
                        TimmyTails Pet Grooming
                    </p>
                </div>
            </div>

            {/* Right Form Side */}
            <div className='flex h-full min-h-screen items-center justify-center p-6 lg:col-span-7 lg:min-h-0 lg:overflow-y-auto xl:col-span-6'>
                <div className='my-auto w-full max-w-md py-4'>

                    {/* Back link */}
                    <Link
                        to='/'
                        className='group mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 transition hover:text-slate-900'
                    >
                        <ArrowLeft size={14} className='transition-transform duration-200 group-hover:-translate-x-1' />
                        <span>Back to Home</span>
                    </Link>

                    {/* Brand title */}
                    <div className='mb-2'>
                        <span className='font-serif text-xl font-bold tracking-tight text-slate-900'>
                            TimmyTails
                        </span>
                    </div>

                    <h1 className='font-serif text-3xl font-bold tracking-tight text-slate-900'>
                        Welcome Back
                    </h1>
                    <p className='mt-1 text-sm text-slate-600'>
                        Sign in to view appointments, manage pet profiles, and book grooming slots.
                    </p>

                    {/* Booking alert */}
                    {location.state?.reason === 'booking-required' && (
                        <div className='mt-4 rounded-lg border border-[#C25E2B]/30 bg-[#C25E2B]/10 px-4 py-3 text-xs font-semibold text-[#C25E2B]'>
                            Please sign in to complete your appointment booking.
                        </div>
                    )}

                    {/* Account Ban Notice Alert */}
                    {banErrorMsg && (
                        <div className='mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-left shadow-xs'>
                            <div className='flex items-start gap-3'>
                                <div className='grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-100 text-red-600 border border-red-200'>
                                    <Ban size={18} />
                                </div>
                                <div>
                                    <h4 className='text-xs font-bold uppercase tracking-wider text-red-900'>
                                        Account Access Suspended
                                    </h4>
                                    <p className='mt-1 text-xs font-medium leading-relaxed text-red-800'>
                                        {banErrorMsg}
                                    </p>
                                    <p className='mt-2 border-t border-red-200/80 pt-2 text-[11px] font-normal text-red-700'>
                                        Notice: Account access or booking privileges have been restricted due to salon policy or multiple cancellations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form id='login-form' onSubmit={handleSubmit} className='mt-6 space-y-4'>
                        <div>
                            <label htmlFor='login-identifier' className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700'>
                                Phone Number or Email
                            </label>
                            <input
                                id='login-identifier'
                                type='text'
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                autoComplete='username'
                                placeholder='0917 123 4567 or email@example.com'
                                className='h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#C25E2B] focus:ring-2 focus:ring-[#C25E2B]/20 placeholder:text-slate-400'
                            />
                        </div>

                        <div>
                            <label htmlFor='login-password' className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700'>
                                Password
                            </label>
                            <div className='relative'>
                                <input
                                    id='login-password'
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete='current-password'
                                    placeholder='Enter your password'
                                    className='h-10 w-full rounded-lg border border-slate-300 bg-white pl-3.5 pr-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#C25E2B] focus:ring-2 focus:ring-[#C25E2B]/20 placeholder:text-slate-400'
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword((p) => !p)}
                                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700'
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <div className='mt-1.5 flex justify-end'>
                                <Link to='/forgot-password' className='text-xs font-bold text-[#C25E2B] transition hover:underline'>
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={submitting}
                            className='flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#C25E2B] px-4 text-sm font-bold text-white transition hover:bg-[#A84E20] disabled:opacity-60'
                        >
                            {submitting ? (
                                <><Loader2 size={16} className='animate-spin' /><span>Signing in...</span></>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className='my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-400'>
                        <span className='h-px flex-1 bg-slate-200' />
                        <span>or</span>
                        <span className='h-px flex-1 bg-slate-200' />
                    </div>

                    <div className='mx-auto flex w-full max-w-[400px] justify-center'>
                        <GoogleSignInButton onCredential={handleGoogle} disabled={submitting} text='continue_with' />
                    </div>

                    <p className='mt-6 text-center text-xs text-slate-600 sm:text-sm'>
                        Don&apos;t have an account?{' '}
                        <Link to='/signup' state={{ returnTo: requestedReturnTo }} className='font-bold text-[#C25E2B] transition hover:underline'>
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}