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
        {props.checklist.datetime && (
          <span className='text-lg'>
            {new Date(props.checklist.datetime).toLocaleString()}
          </span>
        )}
        {props.checklist.distance_km && (
          <span className='text-lg'>{props.checklist.distance_km} km</span>
        )}
        {props.checklist.duration_hr && (
          <span className='text-lg'>
            {props.checklist.duration_hr &&
              Math.floor(props.checklist.duration_hr) > 0 && (
                <>{Math.floor(props.checklist.duration_hr)} hours </>
              )}
            {props.checklist.duration_hr &&
              Math.round((props.checklist.duration_hr % 1) * 60) > 0 && (
                <>
                  {Math.round((props.checklist.duration_hr % 1) * 60)} minutes
                </>
              )}
          </span>
        )}
        {props.checklist.num_observers && (
          <span className='text-lg'>
            {props.checklist.num_observers} observer(s)
          </span>
        )}
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
