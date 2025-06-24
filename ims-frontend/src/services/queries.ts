import useSWR, { SWRConfiguration } from "swr";
import fetcher from "./fetcher";
import { Dealer } from "@/types/dealers";

export function useDealers(config?: SWRConfiguration) {
  return useSWR<Dealer[]>("/api/dealers", fetcher, config);
}

export function useDealer(slug: string | undefined, config?: SWRConfiguration) {
  return useSWR<Dealer>(slug ? `/api/dealers/${slug}` : null, fetcher, config);
}
