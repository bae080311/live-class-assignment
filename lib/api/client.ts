import ky from 'ky'

export const apiClient = ky.create({
  retry: 2,
  timeout: 10000,
})
