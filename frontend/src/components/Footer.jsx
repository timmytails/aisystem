import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, PawPrint, Phone } from 'lucide-react'

export default function Footer() {
    return (
        <footer className='bg-[#14100c] text-[#f8f1e8]'>
            {/* Top accent bar */}
            <div className='h-1 bg-[#bf5a31]' />

            <div className='mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.3fr_1fr_1fr]'>
                {/* Brand */}
                <div>
                    <div className='mb-5 flex items-center gap-3'>
                        <span className='grid h-9 w-9 place-items-center rounded-xl bg-[#bf5a31] text-white'>
                            <PawPrint size={18} />
                        </span>
                        <span className='font-serif text-xl font-bold tracking-tight text-white'>
                            TimmyTails
                        </span>
                    </div>
                    <p className='max-w-xs text-sm leading-6 text-[#c5b5a8]'>
                        Professional grooming care committed to keeping your pets clean, happy, and healthy. Preview species-appropriate hairstyles with our AI visual generator before your appointment.
                    </p>
                </div>

                {/* Contact */}
                <div>
                    <h3 className='mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#bf5a31]'>Visit &amp; Contact</h3>
                    <div className='space-y-3.5 text-sm text-[#c5b5a8]'>
                        <p className='flex items-start gap-3'>
                            <MapPin size={15} className='mt-0.5 shrink-0 text-[#bf5a31]' />
                            Baliuag City, Bulacan, Philippines
                        </p>
                        <p className='flex items-center gap-3'>
                            <Phone size={15} className='shrink-0 text-[#bf5a31]' />
                            +63 955 591 3304
                        </p>
                        <p className='flex items-center gap-3'>
                            <Mail size={15} className='shrink-0 text-[#bf5a31]' />
                            contact@timmytails.com
                        </p>
                        <p className='flex items-center gap-3'>
                            <Clock size={15} className='shrink-0 text-[#bf5a31]' />
                            Mon – Sat &nbsp;·&nbsp; 8:00 AM – 6:00 PM
                        </p>
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h3 className='mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#bf5a31]'>Quick Links</h3>
                    <div className='flex flex-col gap-3 text-sm text-[#c5b5a8]'>
                        <Link to='/services' className='transition-colors hover:text-white'>Services &amp; Pricing</Link>
                        <Link to='/contact' className='transition-colors hover:text-white'>Get in Touch</Link>
                        <Link to='/privacy-policy' className='transition-colors hover:text-white'>Privacy Policy</Link>
                        <Link to='/terms-of-service' className='transition-colors hover:text-white'>Terms of Service</Link>
                    </div>
                </div>
            </div>

            <div className='border-t border-white/[0.07] px-6 py-4 text-center text-[11px] text-[#8e7e72]'>
                © {new Date().getFullYear()} TimmyTails Pet Grooming. All rights reserved.
            </div>
        </footer>
    )
}
