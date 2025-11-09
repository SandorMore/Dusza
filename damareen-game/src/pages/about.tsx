import React from 'react'

interface AboutTabProps {
  version?: string
}

const AboutTab: React.FC<AboutTabProps> = ({ version = "1.0.0" }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border-4 border-black text-amber-100 font-serif">

      <h2 className="text-3xl font-bold text-center mb-6 tracking-wide">
         Guide
      </h2>

      <p className="mb-4 text-lg leading-relaxed">
        Welcome, traveller! This realm is a place of epic battles, ancient magic, and heroic warriors. 
        Build mighty war formations, conquer dungeons, and collect legendary warriors to become the most feared champion of the kingdom!
      </p>

      <div className="mt-6">
        <h3 className="text-2xl font-bold mb-3"> Game Objective</h3>
        <p className="leading-relaxed">
          Your mission is to create powerful decks, defeat dangerous dungeons, and upgrade your cards to form an unbeatable army.
          Each victory may reward you with blessings that enhance your warriors.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-2xl font-bold mb-3"> Core Gameplay</h3>
        <ul className="list-disc list-inside space-y-2 text-amber-200">
          <li>Create war formations (1, 4, or 6 warrior decks)</li>
          <li>Battle against dungeons of increasing difficulty</li>
          <li>Collect warriors and unlock powerful upgrades</li>
          <li>Strategize based on traits such as Fire, Water, Earth, and Air</li>
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-2xl font-bold mb-3"> Future Features</h3>
        <ul className="list-disc list-inside space-y-2 text-amber-200">
          <li>Online PvP arena</li>
          <li>Guilds and alliances</li>
          <li>Seasonal events</li>
          <li>Crafting and enchanting system</li>
        </ul>
      </div>

      <div className="mt-10 text-center text-amber-300 italic">
        Version {version} — “May your blade strike true!”
      </div>
    </div>
  )
}

export default AboutTab
