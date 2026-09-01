import React from "react";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

const Footer = () => {
  return (
    <footer className="flex flex-col justify-end bg-black pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden w-full">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between gap-y-12 lg:gap-x-8">
          {/* Brand & Description */}
          <div className="w-full md:w-[45%] lg:w-[35%] flex flex-col items-start text-left">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-white text-black p-1.5 rounded-lg">
                <Activity size={24} strokeWidth={2.5} />
              </div>
              <span className="text-white text-2xl font-bold tracking-tight">
                FleetPulse
              </span>
            </Link>
            <div className="w-full max-w-52 h-0.5 mt-8 bg-gradient-to-r from-gray-800 to-transparent"></div>
            <p className="text-sm text-white/60 mt-6 max-w-[350px] leading-relaxed">
              FleetPulse is a next-generation fleet management telemetry console
              built for real-time monitoring, logistics efficiency, and seamless
              asset tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
            <h3 className="text-sm text-white font-medium">Platform</h3>
            <div className="flex flex-col gap-2 mt-6">
              <Link
                to="/dashboard"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/tracking"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Live Tracking
              </Link>
              <Link
                to="/vehicles"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Vehicles
              </Link>
              <Link
                to="/drivers"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Drivers
              </Link>
              <Link
                to="/issues"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Issues
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
            <h3 className="text-sm text-white font-medium">Connect</h3>
            <div className="flex flex-col gap-2 mt-6">
              <a
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="w-full md:w-[45%] lg:w-[25%] flex flex-col items-start text-left mt-4 md:mt-0">
            <h3 className="text-sm text-white font-medium">Stay Updated</h3>
            <div className="flex items-center border gap-2 border-white/20 h-12 max-w-80 w-full rounded-full overflow-hidden mt-4 bg-white/5">
              <input
                type="email"
                placeholder="Enter your email.."
                className="w-full h-full pl-6 outline-none text-sm bg-transparent text-white placeholder-white/60"
                required
              />
              <button
                type="submit"
                className="bg-white hover:bg-gray-200 text-black font-semibold transition w-32 h-10 rounded-full text-sm cursor-pointer mr-1 focus:outline-none"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="w-full h-px mt-16 mb-4 bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>

        {/* Copyright Line */}
        <div className="flex flex-wrap sm:flex-row items-center justify-between gap-y-4 gap-x-2 relative z-10">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} FleetPulse by Emmanuel Addo
          </p>
          <div className="flex items-center gap-6 text-right">
            <a
              href="#"
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Terms & Conditions
            </a>
            <div className="w-px h-4 bg-white/20"></div>
            <a
              href="#"
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>

        {/* Big Background Text */}
        <div className="w-full flex justify-center mt-6 md:mt-12 md:mb-[-0.5%]">
          <h1 className="text-center font-extrabold tracking-tighter leading-[0.70] text-zinc-900 text-[clamp(4.5rem,19.5vw,25rem)] pointer-events-none select-none uppercase">
            FleetPulse
          </h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
