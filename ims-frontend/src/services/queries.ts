import useSWR, { SWRConfiguration } from "swr";
import fetcher from "./fetcher";
import { Dealer } from "@/types/dealers";
import { MediaCenter } from "@/types/media-center";
import { Category } from "@/types/categories";
import { Inventory } from "@/types/inventory";

export function useDealers(config?: SWRConfiguration) {
  return useSWR<Dealer[]>(
    "/api/dealers",
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
  return useSWR<Category[]>(
    "/api/categories",
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

export function useCategory(slug: string, config?: SWRConfiguration) {
  return useSWR<Category[]>(`/api/categories/${slug}`, fetcher, config);
}

export function useInventories(config?: SWRConfiguration) {
  return useSWR<Inventory[]>("/api/products", fetcher, config);
}

export function useInventory(slug: string, config?: SWRConfiguration) {
  return useSWR<Inventory[]>(`/api/products/${slug}`, fetcher, config);
}
