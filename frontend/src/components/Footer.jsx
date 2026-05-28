import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Heart } from 'lucide-react';

// Brand icons removed from lucide-react — using inline SVGs instead
const Facebook = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Instagram = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const Linkedin = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Footer = () => {
  const footerLinks = {
    shop: [
      { to: '/shop', label: 'All Products' },
      { to: '/shop?sort=newest', label: 'New Arrivals' },
      { to: '/shop?sort=featured', label: 'Featured' },
      { to: '/wishlist', label: 'Wishlist' },
    ],
    support: [
      { to: '/contact', label: 'Contact Us' },
      { to: '/shipping', label: 'Shipping Info' },
      { to: '/returns', label: 'Returns Policy' },
      { to: '/faq', label: 'FAQ' },
    ],
    company: [
      { to: '/about', label: 'About Us' },
      { to: '/careers', label: 'Careers' },
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/', label: 'Facebook' },
    { icon: Twitter, href: 'https://x.com/', label: 'X' },
    { icon: Instagram, href: 'https://www.instagram.com/', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white border-t border-gray-800 pb-[72px] md:pb-0 relative z-10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 text-center sm:text-left">
          {/* Brand Column */}
          <div className="lg:col-span-1 flex flex-col items-center sm:items-start">
            <Link to="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-600/50 transition-all">
                <span className="text-white font-heading font-bold text-lg">S</span>
              </div>
              <span className="font-heading font-bold text-xl group-hover:text-primary-400 transition-colors">ShopFlow</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-xs mx-auto sm:mx-0">
              Your premium destination for quality products at unbeatable prices. Shop with confidence.
            </p>
            <div className="space-y-4 w-full flex flex-col items-center sm:items-start">
              <a href="mailto:support@shopflow.com" className="flex items-center justify-center sm:justify-start gap-3 text-gray-400 hover:text-primary-400 transition-colors group">
                <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-all flex-shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-sm">support@shopflow.com</span>
              </a>
              <a href="tel:+919344758870" className="flex items-center justify-center sm:justify-start gap-3 text-gray-400 hover:text-primary-400 transition-colors group">
                <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-all flex-shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm">+91 9344758870</span>
              </a>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-gray-400">
                <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-sm">Bengaluru, Karnataka</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-heading font-bold text-lg text-white mb-6">Shop</h4>
            <ul className="space-y-4 w-full text-center sm:text-left">
              {footerLinks.shop.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-medium text-gray-400 hover:text-primary-400 transition-colors duration-200 inline-flex items-center justify-center sm:justify-start gap-2 group w-full"
                  >
                    <span className="hidden sm:inline-block w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-primary-400 transition-colors opacity-0 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-heading font-bold text-lg text-white mb-6">Support</h4>
            <ul className="space-y-4 w-full text-center sm:text-left">
              {footerLinks.support.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-medium text-gray-400 hover:text-primary-400 transition-colors duration-200 inline-flex items-center justify-center sm:justify-start gap-2 group w-full"
                  >
                    <span className="hidden sm:inline-block w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-primary-400 transition-colors opacity-0 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-heading font-bold text-lg text-white mb-6">Company</h4>
            <ul className="space-y-4 w-full text-center sm:text-left">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-medium text-gray-400 hover:text-primary-400 transition-colors duration-200 inline-flex items-center justify-center sm:justify-start gap-2 group w-full"
                  >
                    <span className="hidden sm:inline-block w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-primary-400 transition-colors opacity-0 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-10" />

        {/* Social Links & Bottom Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social Links */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Follow us:</span>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 transition-all duration-300 transform hover:-translate-y-1"
                  aria-label={`Visit us on ${social.label}`}
                  title={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="flex items-center gap-2 font-bold text-gray-400">
              <span className="w-2.5 h-2.5 bg-success-500 rounded-full animate-pulse-soft shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Secure Payments
            </span>
            <span className="hidden sm:flex items-center gap-2 font-bold text-gray-400">
              <span className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-pulse-soft shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              Trusted Seller
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-medium text-gray-500">
            <p className="text-center sm:text-left">
              &copy; {new Date().getFullYear()} ShopFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-danger-500 fill-current animate-pulse-soft" />
              <span>by the ShopFlow team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;