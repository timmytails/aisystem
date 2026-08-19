import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, PawPrint, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/api'
import loginImage from '../assets/images/login-groomer.png'

export default function ForgotPassword() {
    const { sendPasswordOtp, resetPasswordWithOtp } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState('request')
    const [form, setForm] = useState({ identifier: '', otp: '', newPassword: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)

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
        <div className='min-h-[100dvh] w-full bg-[#fbf7f1] text-[#201711] lg:grid lg:h-[100dvh] lg:grid-cols-12 lg:overflow-hidden'>

            {/* Left Photo Panel */}
            <div className='relative hidden h-full overflow-hidden bg-[#1c140e] lg:col-span-5 lg:block xl:col-span-6'>
                <img
                    src={loginImage}
                    alt='A groomer caring for a pet'
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
                    <p className='font-serif text-xl leading-relaxed text-white/90 xl:text-2xl'>
                        &ldquo;Recover your account securely using the mobile number connected to your profile.&rdquo;
                    </p>
                    <p className='mt-3 text-xs font-semibold uppercase tracking-widest text-white/60'>
                        TimmyTails Pet Grooming
                    </p>
                </div>
            </div>

            {/* Right Panel */}
            <div className='flex min-h-[100dvh] items-center justify-center p-5 sm:p-8 lg:col-span-7 lg:min-h-0 lg:overflow-y-auto xl:col-span-6'>
                <div className='my-auto w-full max-w-md py-4'>

                    {/* Back */}
                    <Link
                        to='/login'
                        className='group mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#806654] transition hover:text-[#bf5a31]'
                    >
                        <ArrowLeft size={14} className='transition-transform duration-200 group-hover:-translate-x-1' />
                        Back to Sign In
                    </Link>

                    {/* Brand */}
                    <div className='mb-4 flex items-center gap-2.5'>
                        <span className='grid h-8 w-8 place-items-center rounded-xl bg-[#bf5a31] text-white shadow-sm'>
                            <PawPrint size={16} />
                        </span>
                        <span className='font-serif text-base font-bold text-[#201711]'>TimmyTails</span>
                    </div>

                    {/* Card */}
                    <div className='rounded-2xl border border-[#e0d3c3] bg-white p-7 shadow-sm sm:p-9'>

                        {/* ── Step: request ── */}
                        {step === 'request' && (
                            <>
                                <div className='mb-5 inline-grid h-11 w-11 place-items-center rounded-xl bg-[#f6ede2] text-[#bf5a31]'>
                                    <KeyRound size={21} />
                                </div>

                                <h1 className='font-serif text-2xl font-bold tracking-tight text-[#201711] sm:text-3xl'>
                                    Forgot your password?
                                </h1>
                                <p className='mt-2 text-sm leading-6 text-[#786150]'>
                                    Enter the email or mobile number connected to your account. We&apos;ll send a six-digit recovery code.
                                </p>

                                <form onSubmit={requestOtp} className='mt-6 space-y-4'>
                                    <Field
                                        label='Email address or phone number'
                                        name='identifier'
                                        value={form.identifier}
                                        onChange={update}
                                        placeholder='you@example.com or 0917 123 4567'
                                        autoComplete='username'
                                    />
                                    <button
                                        disabled={submitting}
                                        className='h-11 w-full rounded-xl bg-[#bf5a31] font-bold text-white shadow-xs transition hover:bg-[#a94723] disabled:cursor-not-allowed disabled:opacity-60'
                                    >
                                        {submitting ? 'Sending code...' : 'Send Recovery Code'}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* ── Step: verify ── */}
                        {step === 'verify' && (
                            <>
                                <div className='mb-5 inline-grid h-11 w-11 place-items-center rounded-xl bg-[#e6f2eb] text-[#1f4a38]'>
                                    <ShieldCheck size={21} />
                                </div>

                                <h1 className='font-serif text-2xl font-bold tracking-tight text-[#201711] sm:text-3xl'>
                                    Create a new password
                                </h1>
                                <p className='mt-2 text-sm leading-6 text-[#786150]'>
                                    Enter the OTP sent to your registered mobile number, then choose a new password.
                                </p>

                                <form onSubmit={resetPassword} className='mt-6 space-y-4'>
                                    <Field
                                        label='Six-digit OTP'
                                        name='otp'
                                        value={form.otp}
                                        onChange={update}
                                        inputMode='numeric'
                                        placeholder='000000'
                                        minLength={6}
                                        maxLength={6}
                                    />
                                    <PasswordField
                                        label='New password'
                                        name='newPassword'
                                        value={form.newPassword}
                                        onChange={update}
                                        visible={showPassword}
                                        toggle={() => setShowPassword((c) => !c)}
                                    />
                                    <PasswordField
                                        label='Confirm new password'
                                        name='confirmPassword'
                                        value={form.confirmPassword}
                                        onChange={update}
                                        visible={showPassword}
                                        toggle={() => setShowPassword((c) => !c)}
                                    />
                                    <p className='text-xs text-[#9c7b68]'>Minimum 8 characters required.</p>

                                    <button
                                        disabled={submitting || !canReset}
                                        className='h-11 w-full rounded-xl bg-[#bf5a31] font-bold text-white shadow-xs transition hover:bg-[#a94723] disabled:cursor-not-allowed disabled:opacity-60'
                                    >
                                        {submitting ? 'Updating password...' : 'Update Password'}
                                    </button>

                                    <button
                                        type='button'
                                        onClick={() => setStep('request')}
                                        className='w-full text-xs font-semibold text-[#9c7b68] transition hover:text-[#bf5a31]'
                                    >
                                        ← Use a different email or number
                                    </button>
                                </form>
                            </>
                        )}

                        {/* ── Step: success ── */}
                        {step === 'success' && (
                            <div className='py-4 text-center'>
                                <span className='mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#e6f2eb] text-[#1f4a38]'>
                                    <CheckCircle2 size={30} />
                                </span>
                                <h1 className='mt-5 font-serif text-2xl font-bold text-[#201711]'>Password changed!</h1>
                                <p className='mt-2 text-sm leading-6 text-[#786150]'>
                                    Your password was updated successfully. You can now sign in with your new credentials.
                                </p>
                                <button
                                    onClick={() => navigate('/login', { replace: true })}
                                    className='mt-6 h-11 w-full rounded-xl bg-[#bf5a31] font-bold text-white shadow-xs transition hover:bg-[#a94723]'
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
            <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6e5645]'>{label}</span>
            <input
                required
                className='h-11 w-full rounded-xl border border-[#e0d3c3] bg-white px-4 text-sm outline-none transition placeholder:text-[#b5a090] focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10'
                {...props}
            />
        </label>
    )
}

function PasswordField({ label, visible, toggle, ...props }) {
    return (
        <label className='block'>
            <span className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6e5645]'>{label}</span>
            <span className='relative block'>
                <input
                    required
                    type={visible ? 'text' : 'password'}
                    minLength={8}
                    className='h-11 w-full rounded-xl border border-[#e0d3c3] bg-white px-4 pr-11 text-sm outline-none transition placeholder:text-[#b5a090] focus:border-[#bf5a31] focus:ring-2 focus:ring-[#bf5a31]/10'
                    {...props}
                />
                <button
                    type='button'
                    onClick={toggle}
                    className='absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-[#9c7b68] transition hover:bg-[#f3e9dd] hover:text-[#bf5a31]'
                    aria-label={visible ? 'Hide password' : 'Show password'}
                >
                    {visible ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            </span>
        </label>
    )
}
