import { Link } from 'react-router-dom'

const sections = [
    {
        title: '1. Acceptance of Terms',
        content: (
            <p>
                By creating an account, booking an appointment, or accessing the TimmyTails platform, you agree to comply with these Terms of Service and our Privacy Policy.
            </p>
        )
    },
    {
        title: '2. Salon Grooming Services',
        content: (
            <p>
                TimmyTails provides online booking for professional pet grooming treatments. Service inclusions, pricing, and duration may vary based on your pet’s size, coat condition, behavior, and specialized handling requirements.
            </p>
        )
    },
    {
        title: '3. Booking & Schedule Rules',
        content: (
            <ul className='mt-2 space-y-2 list-disc pl-5 text-[#68594E]'>
                <li>Appointments are finalized upon confirmation from TimmyTails.</li>
                <li>Please arrive promptly at your scheduled 2-hour appointment window.</li>
                <li>Modifications or cancellations should be submitted as early as possible via the Customer Dashboard.</li>
                <li>TimmyTails reserves the right to reschedule or decline appointments for health or safety reasons.</li>
            </ul>
        )
    },
    {
        title: '4. Pet Health & Safety',
        content: (
            <p>
                Pet owners must declare any existing medical conditions, skin allergies, injuries, or behavioral issues prior to grooming. Groomers may stop a session if a pet shows extreme distress or aggression to ensure pet and staff safety.
            </p>
        )
    },
    {
        title: '5. Contact & Support',
        content: (
            <p>
                For questions regarding our service policies, reach out through our{' '}
                <Link to='/contact' className='font-bold text-[#C25E2B] hover:underline'>
                    Contact Page
                </Link>{' '}
                or call +63 975 669 2647.
            </p>
        )
    }
]

export default function TermsOfService() {
    return (
        <div className='min-h-screen bg-[#F8F7F4] px-4 py-12 text-slate-900 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-4xl'>
                <div className='mb-8 border-b border-slate-200 pb-6 text-center sm:text-left'>
                    <span className='inline-block rounded-md bg-[#C25E2B]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>
                        Terms &amp; Policies
                    </span>
                    <h1 className='mt-2 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                        Terms of Service
                    </h1>
                    <p className='mt-1 text-sm text-slate-500'>
                        Effective date: August 2026
                    </p>
                </div>

                <div className='rounded-xl border border-slate-200 bg-white p-6 sm:p-10 space-y-8'>
                    <p className='text-sm leading-relaxed text-slate-600 border-b border-slate-100 pb-6'>
                        These terms govern the use of TimmyTails grooming appointment services and website features.
                    </p>

                    <div className='space-y-8'>
                        {sections.map(({ title, content }) => (
                            <section key={title} className='border-b border-slate-100 pb-6 last:border-0 last:pb-0'>
                                <h2 className='font-serif text-xl font-bold text-slate-900 mb-3'>{title}</h2>
                                <div className='text-sm leading-relaxed text-slate-600'>{content}</div>
                            </section>
                        ))}
                    </div>

                    <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600'>
                        TimmyTails reserves the right to update these Terms of Service. Changes will take effect upon posting to this page.
                    </div>
                </div>
            </div>
        </div>
    )
}
