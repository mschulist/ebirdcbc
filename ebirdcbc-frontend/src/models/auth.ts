export type User = {
  email: string
  name: string
}

export type CreateUserRequest = {
  name: string
  username: string
  password: string
}

export type CreateProjectRequest = {
  name: string
  ebird_username: string
  ebird_password: string
}
