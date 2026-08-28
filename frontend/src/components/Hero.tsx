import React, { useState } from "react";

const Hero= () => {
  
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const [pagesOpen, setPagesOpen] = React.useState(false)
    const pageLinks = ["Page 1", "Page 2", "Page 3"]
    
    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap');
                    *{font-family: "Geist", sans-serif; }
                    h1{font-family: "Urbanist", sans-serif; }
                `}
            </style>

            <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto border border-slate-200 pb-24 md:pb-28">
                <nav className="flex flex-col items-center w-full" >
                    <div className="flex items-center justify-between p-4 px-6 md:py-4 w-full relative border-b border-slate-200">
                        <a href="/" className="flex items-center gap-2">
                            <span className="text-xl font-bold text-zinc-900 tracking-tight">FleetPulse</span>
                        </a>
                        <div id="menu" className={`${mobileOpen ? 'max-md:w-full' : 'max-md:w-0'} max-md:fixed max-md:top-0 max-md:z-50 max-md:left-0 max-md:transition-all max-md:duration-300 max-md:overflow-hidden max-md:h-screen max-md:bg-white/25 max-md:backdrop-blur max-md:flex-col max-md:justify-center flex items-center gap-8 text-sm`}>
                            <div className="group relative max-md:flex max-md:flex-col max-md:items-center">
                                <button type="button" onClick={() => setPagesOpen((prev) => !prev)} className="flex items-center gap-1 text-zinc-800 hover:text-zinc-600" >
                                    Pages
                                    <svg className={`transition-transform duration-200 md:group-hover:rotate-180 ${pagesOpen ? 'rotate-180' : ''}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m5 7.5 5 5 5-5" stroke="#1e2939" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                                <div className={`${pagesOpen ? 'mt-3 flex' : 'hidden'} flex-col gap-1 md:absolute md:left-1/2 md:top-full md:mt-2 md:flex md:min-w-32 md:-translate-x-1/2 md:rounded-2xl md:border md:border-zinc-200 md:bg-white md:p-1.5 md:shadow-[0_18px_50px_rgba(0,0,0,0.08)] md:opacity-0 md:invisible md:-translate-y-2 md:transition-all md:duration-200 md:group-hover:visible md:group-hover:translate-y-0 md:group-hover:opacity-100`}>
                                    {pageLinks.map((page) => (
                                        <a key={page} href="#" onClick={() => { setPagesOpen(false); setMobileOpen(false) }} className="rounded-lg px-3 py-2 text-center text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900">
                                            {page}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <a href="#" onClick={() => setMobileOpen(false)} className="text-zinc-800 hover:text-zinc-500">Company</a>
                            <a href="#" onClick={() => setMobileOpen(false)} className="text-zinc-800 hover:text-zinc-500">Pricing</a>
                            <a href="#" onClick={() => setMobileOpen(false)} className="text-zinc-800 hover:text-zinc-500">Blogs</a>
                            <a href="#" onClick={() => setMobileOpen(false)} className="text-zinc-800 hover:text-zinc-500">Contact</a>

                            <button id="close-menu" onClick={() => { setMobileOpen(false); setPagesOpen(false) }} className="md:hidden bg-zinc-900 hover:bg-zinc-800 text-white p-2 rounded-md aspect-square font-medium transition">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>
                        <button className="hidden md:block bg-black hover:bg-zinc-800 text-white px-10 py-3 rounded-lg text-sm transition cursor-pointer group">
                            Get Started
                        </button>
                        <button id="open-menu" onClick={() => setMobileOpen(true)} className="md:hidden bg-zinc-900 hover:bg-zinc-800 text-white p-2 rounded-md aspect-square font-medium transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 12h16" /><path d="M4 18h16" /><path d="M4 6h16" />
                            </svg>
                        </button>
                    </div>
                </nav>

                <div className="flex flex-wrap items-center justify-center gap-2 pl-2.5 pr-4 py-1.5 mt-28 rounded-lg bg-slate-50 border border-slate-200">
                    <p className='px-2 py-1 rounded-sm border bg-zinc-950 text-xs text-white'>NEW</p>
                    <p className="text-sm text-zinc-800">Real-time Telemetry Engine</p>
                </div>

                <h1 className="text-5xl md:text-6xl/18 text-center font-medium text-zinc-900 bg-clip-text leading-tight max-w-[700px] mt-4 px-4">
                    Monitor and Manage Your Fleet in Real Time
                </h1>
                <p className="text-sm md:text-base text-center max-w-[500px] mt-2.5 text-zinc-700 px-4">
                    Everything you need to track logistics, monitor battery health, and dispatch your vehicles — all in one place.
                </p>

                <div className='flex gap-3.5 mt-6'>
                    <button className="bg-black hover:bg-zinc-800 text-white px-10 py-3.5 rounded-lg text-sm font-medium transition cursor-pointer">
                        Start Free Trial
                    </button>
                    <a href="/dashboard" className="border border-slate-300 hover:bg-slate-50 text-slate-800 px-10 py-3.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-2">
                        Go to Console →
                    </a>
                </div>
            </div>
        </>
    )
}

export default Hero;