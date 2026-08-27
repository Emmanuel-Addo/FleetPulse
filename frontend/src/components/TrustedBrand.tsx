const TrustedBrand = () => {
   
    const companyLogos = ["slack", "framer", "netflix", "google", "linkedin", "instagram", "facebook"];
    return (
        <>
            <style>{`
                .marquee-inner {
                    animation: marqueeScroll 15s linear infinite;
                }

                .marquee-inner-testimonials {
                    animation: marqueeScroll 35s linear infinite;
                }

                @keyframes marqueeScroll {
                    0% {
                        transform: translateX(0%);
                    }

                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}
            </style>
            <h3 className="text-base text-center text-zinc-500 pb-14 font-medium">
                Trusting by leading brands, including —
            </h3>
            <div className="overflow-hidden w-full relative max-w-5xl mx-auto select-none">
                <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />

                <div className="flex marquee-inner will-change-transform max-w-5xl mx-auto">
                    {[...companyLogos, ...companyLogos].map((company, index) => (
                        <img key={index} src={`https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/companyLogo/${company}.svg`}
                            alt={company} className="w-full h-full object-cover mx-6 brightness-0 opacity-40" draggable={false} />
                    ))}
                </div>

                <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
            </div>
        </>
    );
}

export default TrustedBrand;