import React from 'react'
import axios from "axios";
import {useState, useEffect} from "react"
import type { DungeonType } from '../types/types';

const MainGame = () => {
  const [dungeons, setDungeons] = useState<DungeonType[]>([])

  useEffect(()=>{
    axios.get(import.meta.env.VITE_BASE_URL + "/dungeons.json") // TODO: Update URL!!!!!!!!
    .then(response => setDungeons(response.data))
  }, [])

  return (
    <div>
      <h1>Dungeons</h1>

      {dungeons.map(dungeon => <div> {dungeon.name} </div>)}
    </div>
  )
}

export default MainGame