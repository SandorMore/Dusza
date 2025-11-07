import { useState } from 'react'
import './App.css'
import MainGame from './components/MainGame';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MainGame/>
    </>
  )
}

export default App
