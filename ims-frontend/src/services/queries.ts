import useSWR, { SWRConfiguration } from "swr";
import fetcher from "./fetcher";
import { Dealer } from "@/types/dealers";
import { MediaCenter } from "@/types/media-center";
import { Category } from "@/types/categories";

export function useDealers(config?: SWRConfiguration) {
  return useSWR<Dealer[]>("/api/dealers", fetcher, config);
}

export function useDealer(slug: string | undefined, config?: SWRConfiguration) {
  return useSWR<Dealer>(slug ? `/api/dealers/${slug}` : null, fetcher, config);
}

export function useMedias(config?: SWRConfiguration) {
  return useSWR<MediaCenter[]>(
    "/api/media-center",
    async (key) => {
      const data = await fetcher(key);
      return data.map((item: any) => ({
        ...item,
        id: item._id || item.id,
      }));
    },
    config
  );
}

export function useMedia(id: string, config?: SWRConfiguration) {
  return useSWR<MediaCenter[]>(
    `/api/media-center/${id}`,
    async (key) => {
      const data = await fetcher(key);
      return data.map((item: any) => ({
        ...item,
        id: item._id || item.id,
      }));
    },
    config
  );
}

export function useCategories(config?: SWRConfiguration) {
  return useSWR<Category[]>("/api/categories", fetcher, config);
}

export function useCategory(slug: string, config?: SWRConfiguration) {
  return useSWR<Category[]>(`/api/categories/${slug}`, fetcher, config);
}
