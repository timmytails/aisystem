import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Loader2, PawPrint } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/api'
import { consumeReturnTo, peekReturnTo, rememberReturnTo, resolvePostLoginRoute } from '../utils/authRouting'
import GoogleSignInButton from '../features/auth/components/GoogleSignInButton'
import loginImage from '../assets/images/login-groomer.png'

export default function Login() {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const { login, googleLogin } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

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
        try {
            const data = await login(identifier.trim(), password)
            toast.success('Signed in successfully')
            finishLogin(data.user)
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
            toast.success(data.user.profileCompleted ? 'Signed in successfully' : 'Complete your profile to continue')
            finishLogin(data.user)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }, [finishLogin, googleLogin])

    return (
        <div className='min-h-[100dvh] w-full bg-[#fbf7f1] text-[#201711] lg:grid lg:h-[100dvh] lg:grid-cols-12 lg:overflow-hidden'>

            {/* Left Photo Panel */}
            <div className='relative hidden h-full overflow-hidden bg-[#1c140e] lg:col-span-5 lg:block xl:col-span-6'>
                <img
                    src={loginImage}
                    alt='Professional groomer pampering a pet'
                    className='h-full w-full object-cover object-center opacity-80'
                />
                <div className='absolute inset-0 bg-black/55' />

                {/* Brand tag */}
                <div className='absolute left-8 top-8 flex items-center gap-2 text-white/90'>
                    <span className='grid h-8 w-8 place-items-center rounded-lg bg-[#bf5a31]'>
                        <PawPrint size={16} />
                    </span>
                    <span className='font-serif text-sm font-bold tracking-wide'>TimmyTails</span>
                </div>

                {/* Bottom quote */}
                <div className='absolute bottom-10 left-10 right-10 max-w-lg border-l-2 border-[#bf5a31] pl-5 text-white'>
                    <p className='font-serif text-xl leading-relaxed text-white/90 xl:text-2xl'>
                        &ldquo;Tailored grooming and pet-fidelity previews, crafted with care for your companion.&rdquo;
                    </p>
                    <p className='mt-3 text-xs font-semibold uppercase tracking-widest text-white/60'>
                        TimmyTails Pet Grooming
                    </p>
                </div>
            </div>

            {/* Right Sign-In Panel */}
            <div className='flex h-full min-h-[100dvh] items-center justify-center p-5 sm:p-8 lg:col-span-7 lg:min-h-0 lg:overflow-y-auto xl:col-span-6'>
                <div className='my-auto w-full max-w-md py-4'>

                    {/* Back */}
                    <Link
                        to='/'
                        className='group mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#806654] transition hover:text-[#bf5a31]'
                    >
                        <ArrowLeft size={14} className='transition-transform duration-200 group-hover:-translate-x-1' />
                        Back to Home
                    </Link>

                    {/* Brand */}
                    <div className='mb-3 flex items-center gap-2.5'>
                        <span className='grid h-8 w-8 place-items-center rounded-xl bg-[#bf5a31] text-white shadow-sm'>
                            <PawPrint size={16} />
                        </span>
                        <span className='font-serif text-base font-bold text-[#201711]'>TimmyTails</span>
                    </div>

                    <h1 className='font-serif text-2xl font-bold tracking-tight text-[#201711] sm:text-3xl'>
                        Welcome back
                    </h1>
                    <p className='mt-1.5 text-sm leading-relaxed text-[#786150]'>
                        Sign in to access your pet profiles, appointments, and AI style previews.
                    </p>

                    {/* Booking alert */}
                    {location.state?.reason === 'booking-required' && (
                        <div className='mt-4 rounded-xl border border-[#e7c6b5] bg-[#fff4ed] px-4 py-3 text-xs font-medium text-[#8c3d20]'>
                            Please sign in to complete your booking. You will be returned automatically.
                        </div>
                    )}

                    {/* Form */}
                    <form id='login-form' onSubmit={handleSubmit} className='mt-6 space-y-4'>
                        <div>
                            <label htmlFor='login-identifier' className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6e5645]'>
                                Phone number or email
                            </label>
                            <input
                                id='login-identifier'
                                type='text'
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                autoComplete='username'
                                placeholder='0917 123 4567 or email@example.com'
                                className='h-11 w-full rounded-xl border border-[#e0d3c3] bg-white px-4 text-sm font-medium text-[#201711] outline-none transition placeholder:text-[#b5a090] focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10'
                            />
                        </div>

                        <div>
                            <label htmlFor='login-password' className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6e5645]'>
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
                                    className='h-11 w-full rounded-xl border border-[#e0d3c3] bg-white pl-4 pr-10 text-sm font-medium text-[#201711] outline-none transition placeholder:text-[#b5a090] focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10'
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword((p) => !p)}
                                    className='absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-[#9c7b68] transition hover:bg-[#f3e9dd] hover:text-[#bf5a31]'
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            <div className='mt-1.5 flex justify-end'>
                                <Link to='/forgot-password' className='text-xs font-semibold text-[#bf5a31] transition hover:underline'>
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={submitting}
                            className='flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#bf5a31] px-5 text-sm font-bold text-white shadow-xs transition hover:bg-[#a94723] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            {submitting ? (
                                <><Loader2 size={16} className='animate-spin' /><span>Signing in...</span></>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className='my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#b5a090]'>
                        <span className='h-px flex-1 bg-[#e8ddd0]' />
                        <span>or</span>
                        <span className='h-px flex-1 bg-[#e8ddd0]' />
                    </div>

                    <div className='mx-auto flex w-full max-w-[400px] justify-center'>
                        <GoogleSignInButton onCredential={handleGoogle} disabled={submitting} text='continue_with' />
                    </div>

                    <p className='mt-6 text-center text-xs text-[#806654] sm:text-sm'>
                        Don&apos;t have an account?{' '}
                        <Link to='/signup' state={{ returnTo: requestedReturnTo }} className='font-bold text-[#bf5a31] transition hover:underline'>
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}