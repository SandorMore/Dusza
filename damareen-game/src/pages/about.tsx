import React from 'react'

interface AboutTabProps {
  version?: string
}

const AboutTab: React.FC<AboutTabProps> = ({ version = "1.0.0" }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border-4 border-black text-amber-100 font-serif">

      <h2 className="text-3xl font-bold text-center mb-6 tracking-wide">
         Útmutató
      </h2>

      <p className="mb-4 text-lg leading-relaxed">
        Üdvözöllek, utazó! Ez a birodalom a csaták, mágia és harcosok helye. 
        Építs harci formációkat, hódítsd meg a kazamatákat, és gyűjts legendás harcosokat, hogy a királyság legfélelmetesebb bajnokává válj!
      </p>

      <div className="mt-6">
        <h3 className="text-2xl font-bold mb-3">Játék Célja</h3>
        <p className="leading-relaxed">
          A feladatod, hogy paklikat hozz létre, legyőzd a veszélyes kazamatákat, és fejleszd a kártyáidat, hogy verhetetlen hadsereget alkoss.
          Minden győzelem nyereményeket adhat, amelyek fejlesztik a harcosaidat.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-2xl font-bold mb-3">Alapvető Játékmenet</h3>
        <ul className="list-disc list-inside space-y-2 text-amber-200">
          <li>Harci formációk létrehozása (1, 4 vagy 6 harcos paklik)</li>
          <li>Csata növekvő nehézségű kazamaták ellen</li>
          <li>Harcosok gyűjtése és hatalmas fejlesztések feloldása</li>
          <li>Stratégia készítése a Tűz, Víz, Föld és Levegő tulajdonságok alapján</li>
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-2xl font-bold mb-3">Jövőbeli Funkciók</h3>
        <ul className="list-disc list-inside space-y-2 text-amber-200">
          <li>Online PvP aréna</li>
          <li>Céhek és szövetségek</li>
          <li>Szezonális események</li>
          <li>Készítés és varázslás rendszer</li>
        </ul>
      </div>

      <div className="mt-10 text-center text-amber-300 italic">
        Verzió {version} — "Legyen éles a pengéd!"
      </div>
    </div>
  )
}

export default AboutTab
