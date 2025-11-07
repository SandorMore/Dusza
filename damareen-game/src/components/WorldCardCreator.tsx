// src/components/WorldCardCreator.tsx
import React, { useState } from 'react'
import { apiService } from '../services/api'
import type { WorldCardData } from '../types/game'

interface Props {
  onCardCreated: () => void
}

const WorldCardCreator: React.FC<Props> = ({ onCardCreated }) => {
  const [formData, setFormData] = useState<WorldCardData>({
    name: '',
    damage: 10,
    health: 15,
    type: 'föld'
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await apiService.createWorldCard(formData)
      setMessage('Card created successfully!')
      setFormData({ name: '', damage: 10, health: 15, type: 'föld' })
      onCardCreated()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage('Error creating card')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'damage' || name === 'health' ? parseInt(value) || 0 : value
    }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      type: e.target.value as WorldCardData['type']
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Create World Card</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Card Name</label>
          <input
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            placeholder="Enter card name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Damage</label>
            <input
              name="damage"
              type="number"
              min="2"
              max="100"
              required
              value={formData.damage}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Health</label>
            <input
              name="health"
              type="number"
              min="1"
              max="100"
              required
              value={formData.health}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={formData.type}
            onChange={handleSelectChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="föld">Earth (föld)</option>
            <option value="levegő">Air (levegő)</option>
            <option value="víz">Water (víz)</option>
            <option value="tűz">Fire (tűz)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-500 text-white py-2 px-4 rounded-md hover:bg-violet-600 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Card'}
        </button>

        {message && (
          <div className={`p-3 rounded ${
            message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

export default WorldCardCreator