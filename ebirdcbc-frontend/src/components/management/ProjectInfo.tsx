import { useEffect, useState } from 'react'
import { Project } from '../navigation/ProjectSelector'
import { AddUser } from './AddUser'

type ProjectInfoProps = {
  project: Project
  onProjectChange: (project: Project) => Promise<boolean>
}

export function ProjectInfo(props: ProjectInfoProps) {
  const [projectName, setProjectName] = useState(props.project.name)
  const [ebirdUsername, setEbirdUsername] = useState(
    props.project.ebird_username
  )
  const [ebirdPassword, setEbirdPassword] = useState(
    props.project.ebird_encrypted_password
  )
  const [success, setSuccess] = useState<boolean | null>(null)

  useEffect(() => {
    setProjectName(props.project.name)
    setEbirdUsername(props.project.ebird_username)
    setEbirdPassword(props.project.ebird_encrypted_password)
  }, [props.project])

  return (
    <div className='flex flex-col gap-4 w-1/3'>
      <div>
        <label htmlFor='projectName' className='block text-sm font-medium mb-1'>
          Project Name
        </label>
        <input
          id='projectName'
          type='text'
          placeholder='Project Name'
          className='input w-full'
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor='ebirdUsername'
          className='block text-sm font-medium mb-1'
        >
          eBird Username
        </label>
        <input
          id='ebirdUsername'
          type='text'
          placeholder='eBird Username'
          className='input w-full'
          value={ebirdUsername}
          onChange={(e) => setEbirdUsername(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor='ebirdPassword'
          className='block text-sm font-medium mb-1'
        >
          eBird Password
        </label>
        <input
          type='password'
          placeholder='eBird Password'
          className='input w-full'
          value={ebirdPassword || ''}
          onChange={(e) => setEbirdPassword(e.target.value)}
        />
      </div>
      <p className='text-sm text-gray-500 text-wrap'>
        Note: eBird password is encrypted and stored securely. We never display
        the password on the client, so it will not appear above even if you have
        already entered it.
      </p>
      <button
        onClick={() =>
          props
            .onProjectChange({
              ...props.project,
              name: projectName,
              ebird_username: ebirdUsername,
              ebird_encrypted_password: ebirdPassword,
            })
            .then((success) => setSuccess(success))
        }
        className='btn btn-primary'
      >
        Save
      </button>
      {success !== null && (
        <div
          className={`text-sm ${success ? 'text-green-500' : 'text-red-500'} self-center`}
        >
          {success ? 'Project saved successfully' : 'Failed to save project'}
        </div>
      )}
      <div className='divider divider-vertical' />
      <AddUser />
    </div>
  )
}
