type SpeciesModeCheckboxProps = {
  speciesMode: boolean
  toggleSpeciesMode: () => void
}

export function SpeciesModeCheckbox(props: SpeciesModeCheckboxProps) {
  return (
    <div className='form-control'>
      <label className='label cursor-pointer'>
        <span className='label-text text-black'>Species Mode</span>
        <input
          type='checkbox'
          className='checkbox checkbox-primary'
          onChange={props.toggleSpeciesMode}
          checked={props.speciesMode}
        />
      </label>
    </div>
  )
}
