'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi, NewUserInput, UpdateUserInput } from './users.api';

export const userKeys = { all: ['admin-users'] as const };

export function useUsers() {
  return useQuery({ queryKey: userKeys.all, queryFn: usersApi.list });
}

export function useUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: userKeys.all });

  const create = useMutation({
    mutationFn: (data: NewUserInput) => usersApi.create(data),
    onSuccess: (u) => {
      invalidate();
      toast(`Created user ${u.email}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; patch: UpdateUserInput }) => usersApi.update(vars.id, vars.patch),
    onSuccess: () => {
      invalidate();
      toast('User updated');
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast('User deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, update, remove };
}
