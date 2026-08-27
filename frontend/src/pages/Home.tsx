import React from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import TrustedBrand from '../components/TrustedBrand'
import Footer from '../components/Footer'
import Testimonails from '../components/Testimonails'
import NewsLetter from '../components/NewsLetter'

const Home = () => {
  return (
    <div>
        <Hero/>
        <TrustedBrand/>
        <About />
        <Testimonails />
        <NewsLetter />
     
        <Footer/>
    </div>
  )
}

export default Home