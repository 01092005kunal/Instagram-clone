import { Route, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage/Homepage'
import Authpage from './pages/Authpage/Authpage'
import PageLayouts from './Layouts/PageLayouts/PageLayouts'

function App() {
  return (
    <>
      <PageLayouts>
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/auth' element={<Authpage />} />
        </Routes>
      </PageLayouts>
    </>
  )
}

export default App