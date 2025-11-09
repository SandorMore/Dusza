import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='w-full flex justify-between h-16 bg-white-800 text-black shadow-2xl items-center px-4'>
        <div>
            <h1 className='text-2xl font-bold hover:'>Damareen</h1>
        </div>
        <ul className='flex space-x-4'>
            <Link to="/login"><li className='p-2 bg-white shadow-black-500/50'>Bejelentkezés</li></Link>
            <Link to="/register"><li className='p-2 bg-white shadow-black-500/50'>Regisztráció</li></Link>
        </ul>
    </div>
  )
}

export default Navbar