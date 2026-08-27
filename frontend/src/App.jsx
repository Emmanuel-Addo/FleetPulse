import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import { FleetProvider } from './context/FleetContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'

const App = () => {
  return (
    <FleetProvider>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/dashboard' element={
          <Layout>
            <Dashboard />
          </Layout>
        }/>
      </Routes>
    </FleetProvider>
  )
}

export default App