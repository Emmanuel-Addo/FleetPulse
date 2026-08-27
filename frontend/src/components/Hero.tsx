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

            <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto border border-slate-200">
                <nav className="flex flex-col items-center w-full" >
                    <div className="flex items-center justify-between p-4 px-6 md:py-4 w-full relative border-b border-slate-200">
                        <a href="https://prebuiltui.com">
                            <svg width="157" height="40" viewBox="0 0 157 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.904 28.284q-1.54 0-2.744-.644a5.1 5.1 0 0 1-1.904-1.82q-.672-1.149-.672-2.604v-3.864q0-1.456.7-2.604a4.9 4.9 0 0 1 1.904-1.792q1.204-.672 2.716-.672 1.82 0 3.276.952a6.44 6.44 0 0 1 2.324 2.52q.868 1.566.868 3.556 0 1.96-.868 3.556a6.5 6.5 0 0 1-2.324 2.492q-1.456.924-3.276.924m-7.196 5.32v-19.04h3.08v3.612l-.532 3.276.532 3.248v8.904zm6.692-8.232q1.12 0 1.96-.504a3.6 3.6 0 0 0 1.344-1.456q.504-.925.504-2.128t-.504-2.128a3.43 3.43 0 0 0-1.344-1.428q-.84-.532-1.96-.532t-1.988.532a3.43 3.43 0 0 0-1.344 1.428q-.476.924-.476 2.128 0 1.203.476 2.128a3.6 3.6 0 0 0 1.344 1.456q.868.504 1.988.504m9.55 2.632v-13.44h3.08v13.44zm3.08-7.476-1.064-.532q0-2.548 1.12-4.116 1.147-1.596 3.444-1.596 1.008 0 1.82.364.811.364 1.512 1.176l-2.016 2.072a2.1 2.1 0 0 0-.812-.56 3 3 0 0 0-1.036-.168q-1.287 0-2.128.812-.84.81-.84 2.548m14.156 7.756q-2.016 0-3.64-.896a7 7 0 0 1-2.548-2.52q-.924-1.596-.924-3.584t.924-3.556a6.87 6.87 0 0 1 2.492-2.52q1.596-.924 3.528-.924 1.876 0 3.304.868a6.05 6.05 0 0 1 2.268 2.38q.84 1.512.84 3.444 0 .336-.056.7-.034.381-.112.756H69.23v-2.52h9.436l-1.148 1.008q-.056-1.232-.476-2.072a3 3 0 0 0-1.204-1.288q-.757-.448-1.876-.448-1.176 0-2.044.504a3.43 3.43 0 0 0-1.344 1.428q-.476.896-.476 2.156t.504 2.212 1.428 1.484q.924.504 2.128.504a4.9 4.9 0 0 0 1.904-.364 4 4 0 0 0 1.512-1.064l1.96 1.988a6.3 6.3 0 0 1-2.38 1.736 7.6 7.6 0 0 1-2.968.588m15.91 0q-1.54 0-2.745-.644a5.1 5.1 0 0 1-1.904-1.82q-.672-1.149-.672-2.604v-3.864q0-1.456.7-2.604a4.9 4.9 0 0 1 1.904-1.792q1.204-.672 2.716-.672 1.821 0 3.276.952a6.44 6.44 0 0 1 2.324 2.52q.87 1.566.868 3.556 0 1.96-.868 3.556a6.5 6.5 0 0 1-2.324 2.492q-1.454.924-3.275.924m-7.198-.28V7.844h3.08v10.024l-.532 3.248.532 3.276v3.612zm6.692-2.632q1.12 0 1.96-.504a3.6 3.6 0 0 0 1.344-1.456q.504-.925.504-2.128t-.504-2.128a3.43 3.43 0 0 0-1.344-1.428q-.84-.532-1.96-.532t-1.988.532a3.43 3.43 0 0 0-1.344 1.428q-.476.924-.476 2.128.001 1.203.476 2.128a3.6 3.6 0 0 0 1.344 1.456q.87.504 1.988.504m15.067 2.912q-1.708 0-3.052-.756a5.5 5.5 0 0 1-2.072-2.072q-.728-1.344-.728-3.08v-7.812h3.08v7.672q0 .98.308 1.68.336.672.952 1.036.644.363 1.512.364 1.344 0 2.044-.784.728-.813.728-2.296v-7.672h3.08v7.812q0 1.764-.756 3.108a5.3 5.3 0 0 1-2.044 2.072q-1.317.728-3.052.728m8.976-.28v-13.44h3.08v13.44zm1.54-15.904q-.783 0-1.316-.532-.504-.533-.504-1.316 0-.785.504-1.316a1.8 1.8 0 0 1 1.316-.532q.813 0 1.316.532.502.531.504 1.316 0 .783-.504 1.316-.504.531-1.316.532m4.996 15.904V7.844h3.08v20.16zm8.552 0V8.964h3.08v19.04zm-3.22-10.64v-2.8h9.52v2.8zm17.274 10.92q-1.708 0-3.052-.756a5.5 5.5 0 0 1-2.072-2.072q-.728-1.344-.728-3.08v-7.812h3.08v7.672q0 .98.308 1.68.336.672.952 1.036.643.363 1.512.364 1.344 0 2.044-.784.728-.813.728-2.296v-7.672h3.08v7.812q0 1.764-.756 3.108a5.3 5.3 0 0 1-2.044 2.072q-1.317.728-3.052.728m8.977-.28v-13.44h3.08v13.44zm1.54-15.904q-.785 0-1.316-.532-.504-.533-.504-1.316 0-.785.504-1.316a1.8 1.8 0 0 1 1.316-.532q.812 0 1.316.532.504.531.504 1.316 0 .783-.504 1.316-.504.531-1.316.532" fill="#000"/><path d="m8.75 11.3 6.75 3.884 6.75-3.885M8.75 34.58v-7.755L2 22.94m27 0-6.75 3.885v7.754M2.405 15.408 15.5 22.954l13.095-7.546M15.5 38V22.94M29 28.914V16.962a2.98 2.98 0 0 0-1.5-2.585L17 8.4a3.01 3.01 0 0 0-3 0L3.5 14.377A3 3 0 0 0 2 16.962v11.953A2.98 2.98 0 0 0 3.5 31.5L14 37.477a3.01 3.01 0 0 0 3 0L27.5 31.5a3 3 0 0 0 1.5-2.585" stroke="#f54900" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
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
                        <button className="hidden md:block bg-orange-600 hover:bg-orange-500 text-white px-10 py-3 rounded-lg text-sm transition cursor-pointer group">
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
                    <p className="text-sm text-zinc-800">AI-Powered Growth Suite</p>
                </div>

                <h1 className="text-5xl md:text-6xl/18 text-center font-medium text-zinc-900 bg-clip-text leading-tight max-w-[700px] mt-4 px-4">
                    Turn Your Ideas Into Scalable Products Faster
                </h1>
                <p className="text-sm md:text-base text-center max-w-[500px] mt-2.5 text-zinc-700 px-4">
                    Everything you need to design, develop and launch high-quality products — all in one place.
                </p>

                <div className='flex gap-3.5 mt-6'>
                    <button className="bg-orange-600 hover:bg-orange-500 text-white px-10 py-3.5 rounded-lg text-sm font-medium transition cursor-pointer">
                        Start Free Trial
                    </button>
                    <a href="/dashboard" className="border border-slate-300 hover:bg-slate-50 text-slate-800 px-10 py-3.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-2">
                        Go to Console →
                    </a>
                </div>

                <div className="w-full mt-8 border-t border-slate-200"></div>
                <div className="w-full px-8 md:px-12 mt-8 md:mt-11">
                    <img className="max-h-64 md:max-h-96 object-cover object-top w-full max-w-6xl mx-auto border border-zinc-200 rounded-xl" src="https://assets.prebuiltui.com/components/hero-section/hero-modern-dashboard.png" alt="dashboard" />
                </div>
            </div>
        </>
    )
}

export default Hero;