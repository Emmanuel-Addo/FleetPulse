import React from 'react';
import image1 from '../assets/image1.jpeg';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col items-center mb-12">
                <div className="text-center text-3xl text-gray-500">
                    <p>
                        ABOUT <span className="text-gray-900 font-medium">Us</span>
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
                
                {/* Left Side - Image with styling */}
                <div className="w-full lg:w-1/2 relative">
                    <div className="relative overflow-hidden h-full min-h-[400px]">
                        <img 
                            src={image1} 
                            alt="Fleet tracking map view" 
                            className="w-full h-full object-cover rounded-md"
                        />
                    </div>
                </div>

                {/* Right Side - Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6 text-[15px] text-gray-600">
                    <p className="leading-relaxed">
                        At <b>FleetPulse</b>, we're transforming the way dispatchers manage their vehicles and how companies track their logistical assets. Our mission is to make fleet management faster, smarter, and more efficient by providing a seamless telemetry platform that bridges the gap between hardware sensors and operational visibility.
                    </p>

                    <p className="leading-relaxed">
                        Built with cutting-edge technology and an intuitive user interface, FleetPulse helps companies streamline their dispatching processes, reduce vehicle downtime, and focus on what truly matters — optimizing routes, conserving fuel, and ensuring the safety of drivers.
                    </p>

                    <b className="text-gray-900 mt-2 text-base">Our Vision</b>
                    <p className="leading-relaxed">
                        Our vision is to revolutionize the logistics industry by creating a centralized platform where data meets operational efficiency seamlessly. We aim to empower fleet managers with the real-time insights they need to maximize asset utilization. At the same time, we're committed to helping businesses of all sizes discover the power of predictive maintenance to eliminate costly operational blind spots.
                    </p>
                </div>

            </div>

            {/* Why Choose Us Section */}
            <div className="max-w-7xl mx-auto mt-24">
                <div className="text-xl mb-8">
                    <p className="text-gray-500">
                        WHY <span className="text-gray-900 font-semibold">CHOOSE US</span>
                    </p>
                </div>

                <div className="flex flex-col md:flex-row mb-10 gap-6">
                    <div className="flex-1 border border-gray-200 px-8 md:px-12 py-10 flex flex-col gap-4 text-[15px] hover:bg-black hover:text-white transition-all duration-300 text-gray-600 cursor-pointer rounded-xl group">
                        <b className="text-gray-900 group-hover:text-white text-lg">Efficiency</b>
                        <p className="leading-relaxed">
                            Streamline your dispatching and maintenance workflows with smart alerts, instant notifications, and real-time telemetry matching that connects the right vehicle to the right route.
                        </p>
                    </div>

                    <div className="flex-1 border border-gray-200 px-8 md:px-12 py-10 flex flex-col gap-4 text-[15px] hover:bg-black hover:text-white transition-all duration-300 text-gray-600 cursor-pointer rounded-xl group">
                        <b className="text-gray-900 group-hover:text-white text-lg">Control</b>
                        <p className="leading-relaxed">
                            Gain complete oversight of your fleet. Browse active vehicles, lock assets with one click, and track maintenance issues all in one centralized console — anytime, from anywhere.
                        </p>
                    </div>

                    <div className="flex-1 border border-gray-200 px-8 md:px-12 py-10 flex flex-col gap-4 text-[15px] hover:bg-black hover:text-white transition-all duration-300 text-gray-600 cursor-pointer rounded-xl group">
                        <b className="text-gray-900 group-hover:text-white text-lg">Reliability</b>
                        <p className="leading-relaxed">
                            Get proactive battery warnings and scheduled service reminders based on actual vehicle usage. Receive tailored insights to keep your operations running without unexpected downtime.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
