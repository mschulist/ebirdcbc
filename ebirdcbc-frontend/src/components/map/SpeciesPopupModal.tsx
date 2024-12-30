import { Checklist, Species } from '@/models/ebird'
import { SingleSpecies } from './SingleSpecies'
import { GroupSelector } from './GroupSelector'

type SpeciesPopupModalProps = {
  selectedChecklist: Checklist | null
  setSelectedChecklist: (building: Checklist | null) => void
  selectedSpecies: string | undefined
  handleUpdateGroup: (species: Species, newGroup: number) => void
}

const NUM_GROUPS = 10

export function SpeciesPopupModal(props: SpeciesPopupModalProps) {
  const singleSpecies =
    props.selectedChecklist?.species.filter(
      (species) => species.species_name === props.selectedSpecies
    ) || []

  const checklistWithSingleSpecies = {
    ...props.selectedChecklist,
    species: singleSpecies,
  }

  return (
    <dialog
      id='modal'
      className='modal'
      onClose={() => props.setSelectedChecklist(null)}
    >
      <div className='modal-box md:max-w-[75vw] max-w-[90vw] p-1 md:p-6 z-100'>
        {checklistWithSingleSpecies && (
          <div className='flex flex-col gap-3 items-center'>
            <span className='text-2xl'>
              {checklistWithSingleSpecies.location_name}
            </span>
            {checklistWithSingleSpecies.datetime && (
              <span className='text-lg'>
                {new Date(checklistWithSingleSpecies.datetime).toLocaleString()}
              </span>
            )}
            {checklistWithSingleSpecies.distance_km && (
              <span className='text-lg'>
                {checklistWithSingleSpecies.distance_km} km
              </span>
            )}
            {checklistWithSingleSpecies.duration_hr && (
              <span className='text-lg'>
                {checklistWithSingleSpecies.duration_hr &&
                  Math.floor(checklistWithSingleSpecies.duration_hr) > 0 && (
                    <>
                      {Math.floor(checklistWithSingleSpecies.duration_hr)} hours{' '}
                    </>
                  )}
                {checklistWithSingleSpecies.duration_hr &&
                  Math.round(
                    (checklistWithSingleSpecies.duration_hr % 1) * 60
                  ) > 0 && (
                    <>
                      {Math.round(
                        (checklistWithSingleSpecies.duration_hr % 1) * 60
                      )}{' '}
                      minutes
                    </>
                  )}
              </span>
            )}
            {checklistWithSingleSpecies.num_observers && (
              <span className='text-lg'>
                {checklistWithSingleSpecies.num_observers} observer(s)
              </span>
            )}

            <div>
              <span className='text-green-400'>Comments: </span>
              <span>{checklistWithSingleSpecies.comments}</span>
            </div>
            {checklistWithSingleSpecies.species[0] &&
              props.selectedChecklist &&
              (console.log(checklistWithSingleSpecies.species[0].group_number),
              (
                <>
                  <GroupSelector
                    maxGroups={NUM_GROUPS}
                    checklist={props.selectedChecklist}
                    selectedSpecies={props.selectedSpecies}
                    handleUpdateGroup={props.handleUpdateGroup}
                  />
                  <SingleSpecies
                    species={checklistWithSingleSpecies.species[0]}
                  />
                </>
              ))}
          </div>
        )}
      </div>
      <form method='dialog' className='modal-backdrop'>
        <button />
      </form>
    </dialog>
  )
}
