import { Species } from '@/models/ebird'
import { SpeciesSelector } from './SpeciesSelector'

type SpeciesSelectorWithLabelProps = {
  selectedSpecies: string
  setSelectedSpecies: (species: string) => void
  species: Species[]
  totalForCurrentSpecies: number
}

export function SpeciesSelectorWithLabel(props: SpeciesSelectorWithLabelProps) {
  const uniqueSpecies = Array.from(
    new Set(props.species.map((species) => species.species_name))
  )

  function handleNextSpecies() {
    const currentIndex = uniqueSpecies.indexOf(props.selectedSpecies)
    const nextIndex = (currentIndex + 1) % uniqueSpecies.length
    props.setSelectedSpecies(uniqueSpecies[nextIndex])
  }

  function handlePreviousSpecies() {
    const currentIndex = uniqueSpecies.indexOf(props.selectedSpecies)
    const nextIndex = currentIndex - 1
    props.setSelectedSpecies(
      uniqueSpecies[nextIndex < 0 ? uniqueSpecies.length - 1 : nextIndex]
    )
  }

  return (
    <div className='flex flex-col space-y-2'>
      <div className='flex items-center space-x-2'>
        <SpeciesSelector
          selectedSpecies={props.selectedSpecies}
          setSelectedSpecies={props.setSelectedSpecies}
          uniqueSpecies={uniqueSpecies}
        />
        <button
          onClick={handlePreviousSpecies}
          className='btn btn-primary hover:bg-green-400'
        >
          Previous Species
        </button>
        <button
          onClick={handleNextSpecies}
          className='btn btn-primary hover:bg-green-400'
        >
          Next Species
        </button>
        <span className='text-black text-lg'>
          Selected Species: {props.selectedSpecies}
        </span>
        <span className='text-black text-lg'>
          ({props.totalForCurrentSpecies})
        </span>
      </div>
    </div>
  )
}
