import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
    return (
        <footer className='border-t border-[#E2D9C8] bg-[#261C14] text-[#FAF7F2]'>
            <div className='mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]'>
                {/* Brand */}
                <div>
                    <div className='mb-4 flex items-center gap-2'>
                        <span className='font-serif text-2xl font-bold tracking-tight text-white'>
                            TimmyTails
                        </span>
                    </div>
                    <p className='max-w-sm text-sm leading-relaxed text-[#D5C9B7]'>
                        Professional grooming committed to keeping your pets healthy, comfortable, and happy. Schedule tailored haircut styles and care sessions with ease.
                    </p>
                </div>

                {/* Contact Information */}
                <div>
                    <h3 className='mb-4 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>Contact &amp; Location</h3>
                    <div className='space-y-3 text-sm text-[#D5C9B7]'>
                        <p className='flex items-start gap-2.5'>
                            <MapPin size={16} className='mt-0.5 shrink-0 text-[#C25E2B]' />
                            <span>Baliuag City, Bulacan, Philippines</span>
                        </p>
                        <p className='flex items-center gap-2.5'>
                            <Phone size={16} className='shrink-0 text-[#C25E2B]' />
                            <span>+63 975 669 2647</span>
                        </p>
                        <p className='flex items-center gap-2.5'>
                            <Mail size={16} className='shrink-0 text-[#C25E2B]' />
                            <span>contact@timmytails.com</span>
                        </p>
                        <p className='flex items-center gap-2.5'>
                            <Clock size={16} className='shrink-0 text-[#C25E2B]' />
                            <span>Mon – Sat &nbsp;·&nbsp; 8:00 AM – 6:00 PM</span>
                        </p>
                    </div>
                </div>

                {/* Navigation Links */}
                <div>
                    <h3 className='mb-4 text-xs font-bold uppercase tracking-wider text-[#C25E2B]'>Quick Links</h3>
                    <div className='flex flex-col gap-2.5 text-sm text-[#D5C9B7]'>
                        <Link to='/services' className='transition-colors hover:text-white'>Services &amp; Pricing</Link>
                        <Link to='/about' className='transition-colors hover:text-white'>About Our Salon</Link>
                        <Link to='/contact' className='transition-colors hover:text-white'>Get in Touch</Link>
                        <Link to='/privacy-policy' className='transition-colors hover:text-white'>Privacy Policy</Link>
                        <Link to='/terms-of-service' className='transition-colors hover:text-white'>Terms of Service</Link>
                    </div>
                </div>
            </div>

            <div className='border-t border-white/10 px-6 py-5 text-center text-xs text-[#A8988A]'>
                &copy; {new Date().getFullYear()} TimmyTails Pet Grooming. All rights reserved.
            </div>
        </footer>
    )
}
