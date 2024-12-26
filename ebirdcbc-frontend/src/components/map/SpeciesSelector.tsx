'use client'

import { Species } from '@/models/ebird'
import { useState, useEffect, useRef } from 'react'

type SpeciesSelectorProps = {
  species: Species[]
  setSelectedSpecies: (species: string) => void
  selectedSpecies: string
}

export function SpeciesSelector(props: SpeciesSelectorProps) {
  const [searchText, setSearchText] = useState('')
  const [filteredSpecies, setFilteredSpecies] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const uniqueSpecies = Array.from(
    new Set(props.species.map((species) => species.species_code))
  )

  useEffect(() => {
    setFilteredSpecies(
      uniqueSpecies.filter((species_code) =>
        species_code.toLowerCase().includes(searchText.toLowerCase())
      )
    )
  }, [searchText])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className='w-72 relative' ref={dropdownRef}>
      <input
        type='text'
        className='input input-bordered w-full'
        placeholder='Search for species'
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onFocus={() => setIsDropdownOpen(true)}
      />
      {isDropdownOpen && (
        <ul className='absolute z-10 w-full bg-background border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto'>
          {filteredSpecies.map((species, i) => (
            <li
              key={i}
              className='p-2 cursor-pointer hover:bg-gray-800'
              onClick={() => {
                props.setSelectedSpecies(species)
                setIsDropdownOpen(false)
                setSearchText(species)
              }}
            >
              {species}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
