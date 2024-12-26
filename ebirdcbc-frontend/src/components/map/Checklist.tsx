import { Checklist } from '@/models/ebird'

type ChecklistProps = {
  checklist: Checklist
}

export function ChecklistBox(props: ChecklistProps) {
  return (
    <div className='relative text-foreground w-full rounded-xl p-1 shadow-lg'>
      {props.checklist.species.map((species) => (
        <div key={species.id} className='flex justify-between'>
          <span>{species.species_code}</span>
          <span>{species.count}</span>
        </div>
      ))}
    </div>
  )
}
