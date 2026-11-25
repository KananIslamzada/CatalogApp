import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { haptics } from '@/lib/haptics';

import { addFavourite, readFavourites, removeFavourite } from '../data/favourites-repository';
import { type Product } from '../types';
import { favouriteKeys } from './query-keys';

type ToggleVariables = { product: Product; favourite: boolean };

export function useFavourites() {
  return useQuery({
    queryKey: favouriteKeys.all,
    queryFn: readFavourites,
    networkMode: 'always',
    staleTime: Infinity,
  });
}

export function useIsFavourite(id: number): boolean {
  const select = useCallback(
    (products: Product[]) => products.some((product) => product.id === id),
    [id],
  );
  const { data } = useQuery({
    queryKey: favouriteKeys.all,
    queryFn: readFavourites,
    networkMode: 'always',
    staleTime: Infinity,
    select,
  });
  return data ?? false;
}

export function useToggleFavourite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: favouriteKeys.all,
    scope: { id: 'favourites' },
    networkMode: 'always',
    meta: { errorKey: 'favourites.saveFailed' },
    mutationFn: ({ product, favourite }: ToggleVariables) =>
      favourite ? addFavourite(product) : removeFavourite(product.id),
    onMutate: async ({ product, favourite }) => {
      await queryClient.cancelQueries({ queryKey: favouriteKeys.all });
      const previous = queryClient.getQueryData<Product[]>(favouriteKeys.all);
      queryClient.setQueryData<Product[]>(favouriteKeys.all, (current = []) => {
        const others = current.filter((item) => item.id !== product.id);
        return favourite ? [product, ...others] : others;
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(favouriteKeys.all, context?.previous);
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: favouriteKeys.all }) === 1) {
        return queryClient.invalidateQueries({ queryKey: favouriteKeys.all });
      }
      return undefined;
    },
  });
}

export function useFavouriteToggle(product: Product) {
  const isFavourite = useIsFavourite(product.id);
  const { mutate } = useToggleFavourite();

  const toggle = useCallback(() => {
    haptics.selection();
    mutate({ product, favourite: !isFavourite });
  }, [mutate, product, isFavourite]);

  return { isFavourite, toggle };
}
