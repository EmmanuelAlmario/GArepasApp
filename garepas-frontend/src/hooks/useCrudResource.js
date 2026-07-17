import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export default function useCrudResource({ queryKey, getAll, createOne, updateOne, removeOne }) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await getAll()
      return res.data
    },
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  const createMutation = useMutation({
    mutationFn: (data) => createOne(data),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateOne(id, data),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => removeOne(id),
    onSuccess: invalidate,
  })

  return {
    data: query.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
  }
}
