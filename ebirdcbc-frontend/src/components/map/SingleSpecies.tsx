import { Species } from '@/models/ebird'

type SingleSpeciesProps = {
  species: Species
}

export function SingleSpecies(props: SingleSpeciesProps) {
  return (
    <div className='relative text-foreground w-full rounded-xl p-2 shadow-lg flex flex-col items-center'>
      <div className='flex flex-row justify-between w-full p-2'>
        <span className='text-xl font-bold'>{props.species.species_name}</span>
        <span className='text-lg'>{props.species.count}</span>
      </div>
      {props.species.comments && (
        <div className='p-2 w-full'>
          <span className='text-green-400'>Comments: </span>
          <span>{props.species.comments}</span>
        </div>
      )}
    </div>
  )
}
