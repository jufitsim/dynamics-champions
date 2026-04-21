import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Submit from '@/pages/Submit'
import Edit from '@/pages/Edit'
import Admin from '@/pages/Admin'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/join"    element={<Submit />} />
        <Route path="/edit/:token" element={<Edit />} />
        <Route path="/admin"   element={<Admin />} />
        <Route path="*"        element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
