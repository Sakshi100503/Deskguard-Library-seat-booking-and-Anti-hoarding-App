import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import useAuthStore from '../store/authStore'

export function useDesks() {
  return useQuery({
    queryKey: ['desks'],
    queryFn: () => api.get('/desks/').then((r) => r.data),
    refetchInterval: 10_000,
    staleTime: 5_000,
  })
}

export function useMyBooking() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: ['my-booking'],
    queryFn: () => api.get('/desks/my-booking').then((r) => r.data),
    refetchInterval: 5_000,
    enabled: !!token,
  })
}

export function useAdminDesks() {
  return useQuery({
    queryKey: ['admin-desks'],
    queryFn: () => api.get('/desks/admin').then((r) => r.data),
    refetchInterval: 10_000,
  })
}

function deskMutation(url, qc) {
  return useMutation({
    mutationFn: (body) => api.post(url, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['desks'] })
      qc.invalidateQueries({ queryKey: ['my-booking'] })
    },
  })
}

export function useCheckIn() {
  const qc = useQueryClient()
  return deskMutation('/desks/checkin', qc)
}

export function useGoAway() {
  const qc = useQueryClient()
  return deskMutation('/desks/away', qc)
}

export function useReturn() {
  const qc = useQueryClient()
  return deskMutation('/desks/return', qc)
}

export function useRelease() {
  const qc = useQueryClient()
  return deskMutation('/desks/release', qc)
}

export function useLibrarianReset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (desk_code) => api.post(`/desks/${desk_code}/reset`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['desks'] })
      qc.invalidateQueries({ queryKey: ['admin-desks'] })
    },
  })
}
