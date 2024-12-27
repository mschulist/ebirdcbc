'use client'

import { Checklist } from '@/models/ebird'
import { ChecklistBox } from './Checklist'

type ChecklistPopupModalProps = {
  selectedChecklist: Checklist | null
  setSelectedChecklist: (building: Checklist | null) => void
}

export function ChecklistPopupModal(props: ChecklistPopupModalProps) {
  return (
    <dialog
      id='modal'
      className='modal'
      onClose={() => props.setSelectedChecklist(null)}
    >
      <div className='modal-box md:max-w-[75vw] max-w-[90vw] p-1 md:p-6'>
        {props.selectedChecklist && (
          <ChecklistBox checklist={props.selectedChecklist} />
        )}
      </div>
      <form method='dialog' className='modal-backdrop'>
        <button />
      </form>
    </dialog>
  )
}
