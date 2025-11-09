import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '../types/auth'

const PlayerDashboard: React.FC = () => {
  const navigate = useNavigate()
  const userStr = localStorage.getItem('user')
  const user: User | null = userStr ? JSON.parse(userStr) : null

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex flex-col bg-[url('/assets/paper-1074131_1280.png')] bg-cover bg-center">
      {/* Medieval Header with Banner */}
      <header className="bg-gradient-to-r from-amber-700 via-orange-800 to-amber-700 shadow-lg">
        <div className="max-w-1xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-amber-100 font-serif tracking-wider">🏰 Királyi Parancsnoki Poszt</h1>
              <p className="text-amber-100 text-sm italic">Üdvözöllek, {user?.username}! A királyság várja a bátorságodat!</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-700 hover:bg-red-800 text-amber-100 px-6 py-3 rounded-lg transition-colors border-2 border-red-600 font-bold shadow-lg hover:shadow-red-800/50"
            >
              <img className='size-8' src="public/assets/back-arrow.png" alt="" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Medieval Banner */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl shadow-2xl p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-amber-100 font-serif tracking-wide">
            🛡️ Válaszd ki a Küldetésedet, Bátor Harcos! 🛡️
          </h2>
          <p className="text-amber-200 mt-2 text-lg">
            Kovácsold meg a sorsodat a csata és dicsőség csarnokaiban!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-b from-red-700 to-red-800 rounded-2xl shadow-xl shadow-red-900/40 p-6 hover:shadow-red-900/50 transition-all duration-300 border border-red-900/40 hover:scale-105 transform flex flex-col justify-between">
            <div className="text-center">
              <div className="text-6xl mb-6 filter drop-shadow-lg">⚔️</div>
              <h2 className="text-2xl font-bold text-amber-100 font-serif mb-4 tracking-wide">Nagy Aréna</h2>
              <p className="text-amber-200 mb-6 leading-relaxed">
                Próbáld ki magad a félelmetes kazamata őrzőkkel szemben! Kovácsold meg a paklidat és szerezz győzelmet epikus csatákban!
              </p>

            </div>
              <button
                onClick={() => navigate('/player/fight?tab=battle')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-amber-100 px-8 py-4 rounded-xl transition-all duration-300 border-2 border-red-500 font-bold text-lg w-full shadow-lg hover:shadow-red-700/50"
              >
                🏹 Aréna Belépés
              </button>
          </div>

          <div className="bg-gradient-to-b from-blue-700 to-blue-800 rounded-2xl shadow-xl shadow-blue-900/40 p-6 hover:shadow-blue-900/50 transition-all duration-300 border border-blue-900/40 hover:scale-105 transform flex flex-col justify-between">
            <div className="text-center">
              <div className="text-6xl mb-6 filter drop-shadow-lg">📜</div>
              <h2 className="text-2xl font-bold text-amber-100 font-serif mb-4 tracking-wide">Királyi Archívum</h2>
              <p className="text-amber-200 mb-6 leading-relaxed">
                Böngészd a legendás kártyák gyűjteményét. Tanulmányozd a harcosaidat és tervezd meg a stratégiáidat!
              </p>
            </div>
            <button
              onClick={() => navigate('/player/fight?tab=collection')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-amber-100 px-8 py-4 rounded-xl transition-all duration-300 border-2 border-blue-500 font-bold text-lg w-full shadow-lg hover:shadow-blue-700/50"
            >
              🏛️ Archívum Megtekintése
            </button>
          </div>

          <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-2xl shadow-xl shadow-green-900/40 p-6 hover:shadow-green-900/50 transition-all duration-300 border border-green-900/40 hover:scale-105 transform flex flex-col justify-between">
            <div className="text-center">
              <div className="text-6xl mb-6 filter drop-shadow-lg">🛡️</div>
              <h2 className="text-2xl font-bold text-amber-100 font-serif mb-4 tracking-wide">Háború Szobája</h2>
              <p className="text-amber-200 mb-6 leading-relaxed">
                Kovácsold meg a harci formációidat! Hozz létre és irányíts paklikat hatalmas harcosokból és ravasz mágusokból!
              </p>
            </div>
            <button
              onClick={() => navigate('/player/fight?tab=decks')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-amber-100 px-8 py-4 rounded-xl transition-all duration-300 border-2 border-green-500 font-bold text-lg w-full shadow-lg hover:shadow-green-700/50"
            >
              ⚒️ Paklik Kovácsolása
            </button>
          </div>

        </div>

        {/* Medieval Footer Section */}
        {/* <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-xl p-6 border-4 border-amber-600 shadow-lg">
            <h3 className="text-xl font-bold text-amber-100 font-serif mb-4 text-center">🏆 Your Legend</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-amber-200">
                <span>Battles Fought:</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between text-amber-200">
                <span>Victories:</span>
                <span className="font-bold text-green-300">8</span>
              </div>
              <div className="flex justify-between text-amber-200">
                <span>Cards Collected:</span>
                <span className="font-bold text-blue-300">24</span>
              </div>
            </div>
          </div>
        </div> */}
      </main>

      {/* Medieval Footer */}
      <footer className="mt-auto bg-gradient-to-r from-amber-900 to-amber-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-amber-200">
            <p className="font-serif">©Damareen - All rights reserved by royal decree</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PlayerDashboard