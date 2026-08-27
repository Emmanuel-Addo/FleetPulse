import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import { FleetProvider } from './context/FleetContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import LiveTracking from './pages/LiveTracking'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Maintenance from './pages/Maintenance'
import Analytics from './pages/Analytics'
import Issues from './pages/Issues'
import ReportIssue from './pages/ReportIssue'

const App = () => {
  return (
    <FleetProvider>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/dashboard' element={<Layout><Dashboard /></Layout>}/>
        <Route path='/tracking' element={<Layout><LiveTracking /></Layout>}/>
        <Route path='/vehicles' element={<Layout><Vehicles /></Layout>}/>
        <Route path='/drivers' element={<Layout><Drivers /></Layout>}/>
        <Route path='/maintenance' element={<Layout><Maintenance /></Layout>}/>
        <Route path='/issues' element={<Layout><Issues /></Layout>}/>
        <Route path='/issues/new' element={<Layout><ReportIssue /></Layout>}/>
        <Route path='/analytics' element={<Layout><Analytics /></Layout>}/>
      </Routes>
    </FleetProvider>
  )
}

export default App
