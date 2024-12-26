import { Checklist } from '@/models/ebird'
import { SingleSpecies } from './SingleSpecies'

type ChecklistProps = {
  checklist: Checklist
}

export function ChecklistBox(props: ChecklistProps) {
  return (
    <div className='relative text-foreground w-full rounded-xl p-1 shadow-lg'>
      <div className='flex flex-col p-4 items-center'>
        <span className='text-2xl'>{props.checklist.location_name}</span>
      </div>
      <div className='p-4'>
        <span className='text-green-400'>Comments: </span>
        <span>{props.checklist.comments}</span>
      </div>

      {props.checklist.species.map((species) => (
        <SingleSpecies key={species.id} species={species} />
      ))}
    </div>
  )
}
