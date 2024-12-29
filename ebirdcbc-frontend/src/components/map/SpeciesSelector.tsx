'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

type SpeciesSelectorProps = {
  uniqueSpecies: string[]
  setSelectedSpecies: (species: string) => void
  selectedSpecies: string
}

export function SpeciesSelector(props: SpeciesSelectorProps) {
  const [searchText, setSearchText] = useState('')
  const [filteredSpecies, setFilteredSpecies] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const memoizedUniqueSpecies = useMemo(
    () => props.uniqueSpecies,
    [props.uniqueSpecies]
  )

  useEffect(() => {
    setFilteredSpecies(
      memoizedUniqueSpecies.filter((species_name) =>
        species_name.toLowerCase().includes(searchText.toLowerCase())
      )
    )
  }, [searchText, memoizedUniqueSpecies])

  useEffect(() => {
    if (props.selectedSpecies) {
      setSearchText(props.selectedSpecies)
    }
  }, [props.selectedSpecies])

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
