import * as api from "./api";

function basePath(orgId: string | number) {
  return `/v1/orgs/${orgId}/taxa`;
}

export interface Taxon {
  id: number;
  name: string;
  rank: string;
}

interface TaxonSearchResult {
  results: Taxon[];
}

async function get(
  orgId: string | number,
  id: string | number,
  options?: { expand?: string[]; include?: string[] }
): Promise<Taxon> {
  const params = new URLSearchParams();
  if (options && !!options.expand) {
    params.append("expand", options.expand.join(","));
  }
  const queryParams = "?".concat(params.toString());
  const path = [basePath(orgId), id, queryParams].join("/");
  return api.get(path);
}

async function search(
  orgId: string | number,
  query: string
  // options?: { expand?: string[]; include?: string[] }
): Promise<Taxon[]> {
  const params = new URLSearchParams({ search: query });
  const queryParams = "?".concat(params.toString());
  const path = [basePath(orgId), queryParams].join("/");
  return api
    .get<TaxonSearchResult>(path)
    .then((resp: TaxonSearchResult) => resp.results);
}

export { get, search };
