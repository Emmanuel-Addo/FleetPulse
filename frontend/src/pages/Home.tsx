import React from 'react'
import Hero from '../components/Hero'
import TrustedBrand from '../components/TrustedBrand'
import Footer from '../components/Footer'
import Testimonails from '../components/Testimonails'

const Home = () => {
  return (
    <div>
        <Hero/>
        <TrustedBrand/>
        <Testimonails />
        <Footer/>
    </div>
  )
}

export default Home