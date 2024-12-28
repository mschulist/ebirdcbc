import { Checklist } from '@/models/ebird'
import { SingleSpecies } from './SingleSpecies'
import { GroupSelector } from './GroupSelector'

type SpeciesPopupModalProps = {
  selectedChecklist: Checklist | null
  setSelectedChecklist: (building: Checklist | null) => void
  selectedSpecies: string | undefined
  fetchChecklists: () => void
}

const NUM_GROUPS = 10

export function SpeciesPopupModal(props: SpeciesPopupModalProps) {
  const singleSpecies =
    props.selectedChecklist?.species.filter(
      (species) => species.species_code === props.selectedSpecies
    ) || []

  const checklistWithSingleSpecies = {
    ...props.selectedChecklist,
    species: singleSpecies,
  }

  console.log(checklistWithSingleSpecies)

  return (
    <dialog
      id='modal'
      className='modal'
      onClose={() => props.setSelectedChecklist(null)}
    >
      <div className='modal-box md:max-w-[75vw] max-w-[90vw] p-1 md:p-6 z-100'>
        {checklistWithSingleSpecies && (
          <div className='flex flex-col gap-3'>
            <span className='text-2xl'>
              {checklistWithSingleSpecies.location_name}
            </span>
            <div>
              <span className='text-green-400'>Comments: </span>
              <span>{checklistWithSingleSpecies.comments}</span>
            </div>
            {checklistWithSingleSpecies.species[0] &&
              props.selectedChecklist && (
                <>
                  <GroupSelector
                    maxGroups={NUM_GROUPS}
                    checklist={props.selectedChecklist}
                    selectedSpecies={props.selectedSpecies}
                    fetchChecklists={props.fetchChecklists}
                  />
                  <SingleSpecies
                    species={checklistWithSingleSpecies.species[0]}
                  />
                </>
              )}
          </div>
        )}
      </div>
      <form method='dialog' className='modal-backdrop'>
        <button />
      </form>
    </dialog>
  )
}
