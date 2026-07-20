import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Curriculum from '@/pages/Curriculum'
import Whitepaper from '@/pages/Whitepaper'
import Reflection from '@/pages/Reflection'
import Governance from '@/pages/Governance'
import GoldenThread from '@/pages/GoldenThread'
import OuroborosWard from '@/pages/OuroborosWard'
import JustUsSchool from '@/pages/JustUsSchool'
import Tribes from '@/pages/Tribes'
import Calendar from '@/pages/Calendar'
import CommunityProjects from '@/pages/CommunityProjects'
import BaseExplorer from '@/pages/BaseExplorer'
import SovereignCircuit from '@/pages/SovereignCircuit'
import HumanNetwork from '@/pages/HumanNetwork'
import SevenDay from '@/pages/SevenDay'

const SpineGame = lazy(() => import('@/pages/SpineGame'))

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="governance" element={<Governance />} />
        <Route path="tribes" element={<Tribes />} />
        <Route path="curriculum" element={<Curriculum />} />
        <Route path="whitepaper" element={<Whitepaper />} />
        <Route path="golden-thread" element={<GoldenThread />} />
        <Route path="ouroboros" element={<OuroborosWard />} />
        <Route path="reflection" element={<Reflection />} />
        <Route path="school" element={<JustUsSchool />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="community" element={<CommunityProjects />} />
        <Route path="base" element={<BaseExplorer />} />
        <Route path="circuit" element={<SovereignCircuit />} />
        <Route path="human-network" element={<HumanNetwork />} />
        <Route path="rhythm" element={<SevenDay />} />
        <Route
          path="wheel"
          element={
            <Suspense
              fallback={
                <div style={{ padding: '3rem', textAlign: 'center', color: '#C9A84C' }}>
                  Summoning the Wheel…
                </div>
              }
            >
              <SpineGame />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
