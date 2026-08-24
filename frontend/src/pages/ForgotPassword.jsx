import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/api'
import loginImage from '../assets/images/login-groomer.png'

export default function ForgotPassword() {
    const { sendPasswordOtp, resetPasswordWithOtp } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState('request')
    const [form, setForm] = useState({ identifier: '', otp: '', newPassword: '', confirmPassword: '' })
    const [otpTimer, setOtpTimer] = useState(0)
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (otpTimer <= 0) return
        const interval = setInterval(() => {
            setOtpTimer((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [otpTimer])

    const canReset = useMemo(() =>
        /^\d{6}$/.test(form.otp) && form.newPassword.length >= 8 && form.newPassword === form.confirmPassword,
        [form.otp, form.newPassword, form.confirmPassword]
    )

    const update = (e) => {
        const { name, value } = e.target
        setForm((c) => ({ ...c, [name]: name === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value }))
    }

    const requestOtp = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const data = await sendPasswordOtp(form.identifier)
            toast.success(data.message)
            setStep('verify')
            setOtpTimer(60)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const resendPasswordOtp = async () => {
        if (otpTimer > 0 || submitting) return
        setSubmitting(true)
        try {
            const data = await sendPasswordOtp(form.identifier)
            setOtpTimer(60)
            toast.success(data.message || 'New verification code sent')
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const resetPassword = async (e) => {
        e.preventDefault()
        if (form.newPassword !== form.confirmPassword) { toast.error('Passwords do not match'); return }
        setSubmitting(true)
        try {
            await resetPasswordWithOtp({ identifier: form.identifier, otp: form.otp, newPassword: form.newPassword })
            setStep('success')
            toast.success('Password updated successfully')
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='min-h-screen w-full bg-[#FAF7F2] text-[#261C14] lg:grid lg:h-screen lg:grid-cols-12 lg:overflow-hidden'>

            {/* Left Image Side */}
            <div className='relative hidden h-full overflow-hidden bg-[#261C14] lg:col-span-5 lg:block xl:col-span-6'>
                <img
                    src={loginImage}
                    alt='A groomer caring for a pet'
                    className='h-full w-full object-cover opacity-70'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-[#261C14] via-transparent to-transparent' />

                <div className='absolute left-8 top-8'>
                    <span className='font-serif text-2xl font-bold tracking-tight text-white'>
                        TimmyTails
                    </span>
                </div>

                <div className='absolute bottom-10 left-10 right-10 border-l-2 border-[#C25E2B] pl-4 text-white'>
                    <p className='font-serif text-xl leading-relaxed text-white/90'>
                        &ldquo;Recover your account securely using the mobile number connected to your profile.&rdquo;
                    </p>
                    <p className='mt-2 text-xs font-bold uppercase tracking-widest text-white/70'>
                        TimmyTails Pet Grooming
                    </p>
                </div>
            </div>

            {/* Right Panel */}
            <div className='flex h-full min-h-screen items-center justify-center p-6 lg:col-span-7 lg:min-h-0 lg:overflow-y-auto xl:col-span-6'>
                <div className='my-auto w-full max-w-md py-4'>

                    {/* Back link */}
                    <Link
                        to='/login'
                        className='group mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#68594E] transition hover:text-[#C25E2B]'
                    >
                        <ArrowLeft size={14} className='transition-transform duration-200 group-hover:-translate-x-1' />
                        <span>Back to Sign In</span>
                    </Link>

                    {/* Brand title */}
                    <div className='mb-2'>
                        <span className='font-serif text-xl font-bold tracking-tight text-[#261C14]'>
                            TimmyTails
                        </span>
                    </div>

                    {/* Card Container */}
                    <div className='rounded-xl border border-[#E2D9C8] bg-white p-6 shadow-xs sm:p-8'>

                        {/* Step: Request */}
                        {step === 'request' && (
                            <>
                                <div className='mb-4 inline-grid h-10 w-10 place-items-center rounded-lg bg-[#FAF7F2] text-[#C25E2B]'>
                                    <KeyRound size={20} />
                                </div>

                                <h1 className='font-serif text-2xl font-bold tracking-tight text-[#261C14]'>
                                    Forgot Password?
                                </h1>
                                <p className='mt-1 text-sm text-[#68594E]'>
                                    Enter your email or mobile number to receive a 6-digit recovery OTP code.
                                </p>

                                <form onSubmit={requestOtp} className='mt-6 space-y-4'>
                                    <Field
                                        label='Email Address or Mobile Number'
                                        name='identifier'
                                        value={form.identifier}
                                        onChange={update}
                                        placeholder='you@example.com or 0917 123 4567'
                                        autoComplete='username'
                                    />
                                    <button
                                        disabled={submitting}
                                        className='h-11 w-full rounded-lg bg-[#C25E2B] font-bold text-white shadow-xs transition hover:bg-[#A84E20] disabled:opacity-60'
                                    >
                                        {submitting ? 'Sending code...' : 'Send Recovery Code'}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* Step: Verify & Reset */}
                        {step === 'verify' && (
                            <>
                                <div className='mb-4 inline-grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700'>
                                    <ShieldCheck size={20} />
                                </div>

                                <h1 className='font-serif text-2xl font-bold tracking-tight text-[#261C14]'>
                                    Create New Password
                                </h1>
                                <p className='mt-1 text-sm text-[#68594E]'>
                                    Enter the verification code sent to your phone, then choose a new password.
                                </p>

                                <form onSubmit={resetPassword} className='mt-6 space-y-4'>
                                    <Field
                                        label='Six-Digit Verification Code'
                                        name='otp'
                                        value={form.otp}
                                        onChange={update}
                                        inputMode='numeric'
                                        placeholder='000000'
                                        minLength={6}
                                        maxLength={6}
                                    />
                                    <PasswordField
                                        label='New Password'
                                        name='newPassword'
                                        value={form.newPassword}
                                        onChange={update}
                                        visible={showPassword}
                                        toggle={() => setShowPassword((c) => !c)}
                                    />
                                    <PasswordField
                                        label='Confirm New Password'
                                        name='confirmPassword'
                                        value={form.confirmPassword}
                                        onChange={update}
                                        visible={showPassword}
                                        toggle={() => setShowPassword((c) => !c)}
                                    />

                                    <button
                                        disabled={submitting || !canReset}
                                        className='h-11 w-full rounded-lg bg-[#C25E2B] font-bold text-white shadow-xs transition hover:bg-[#A84E20] disabled:opacity-60'
                                    >
                                        {submitting ? 'Updating password...' : 'Update Password'}
                                    </button>

                                    <div className='flex items-center justify-between rounded-lg bg-[#FAF7F2] p-3 text-xs text-[#68594E] border border-[#E2D9C8]'>
                                        <span>{otpTimer > 0 ? `Resend code available in ${otpTimer}s` : "Didn't receive the code?"}</span>
                                        <button
                                            type='button'
                                            onClick={resendPasswordOtp}
                                            disabled={submitting || otpTimer > 0}
                                            className='font-bold text-[#C25E2B] transition hover:underline disabled:opacity-50 disabled:no-underline'
                                        >
                                            {otpTimer > 0 ? `Resend (${otpTimer}s)` : 'Resend OTP'}
                                        </button>
                                    </div>

                                    <button
                                        type='button'
                                        onClick={() => setStep('request')}
                                        className='w-full text-xs font-bold text-[#C25E2B] hover:underline'
                                    >
                                        &larr; Use Different Email or Number
                                    </button>
                                </form>
                            </>
                        )}

                        {/* Step: Success */}
                        {step === 'success' && (
                            <div className='py-4 text-center'>
                                <span className='mx-auto grid h-14 w-14 place-items-center rounded-xl bg-emerald-50 text-emerald-700'>
                                    <CheckCircle2 size={28} />
                                </span>
                                <h1 className='mt-4 font-serif text-2xl font-bold text-[#261C14]'>Password Updated!</h1>
                                <p className='mt-1 text-sm text-[#68594E]'>
                                    Your account password was changed successfully.
                                </p>
                                <button
                                    onClick={() => navigate('/login', { replace: true })}
                                    className='mt-6 h-11 w-full rounded-lg bg-[#C25E2B] font-bold text-white shadow-xs transition hover:bg-[#A84E20]'
                                >
                                    Return to Sign In
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Field({ label, ...props }) {
    return (
        <label className='block'>
            <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#68594E]'>{label}</span>
            <input
                required
                className='h-11 w-full rounded-lg border border-[#E2D9C8] bg-[#FFFFFF] px-3.5 text-sm outline-none transition focus:border-[#C25E2B] placeholder:text-[#A8988A]'
                {...props}
            />
        </label>
    )
}

function PasswordField({ label, visible, toggle, ...props }) {
    return (
        <label className='block'>
            <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#68594E]'>{label}</span>
            <span className='relative block'>
                <input
                    required
                    type={visible ? 'text' : 'password'}
                    minLength={8}
                    className='h-11 w-full rounded-lg border border-[#E2D9C8] bg-[#FFFFFF] pl-3.5 pr-10 text-sm outline-none transition focus:border-[#C25E2B] placeholder:text-[#A8988A]'
                    {...props}
                />
                <button
                    type='button'
                    onClick={toggle}
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7A6D] hover:text-[#261C14]'
                    aria-label={visible ? 'Hide password' : 'Show password'}
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </span>
        </label>
    )
}
