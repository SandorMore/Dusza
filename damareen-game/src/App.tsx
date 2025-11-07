import './App.css'
import MainGame from './pages/MainGame'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/game" element={<MainGame />}/>
          <Route path="/register" element={<Register />}/>
        </Routes>
      </Router>
    </>
  )
}


export default App