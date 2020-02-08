import * as api from "./api";
import { Taxon } from "./taxon";

function basePath(orgId: string | number) {
  return `/v1/orgs/${orgId}/accessions`;
}

export interface Accession {
  id: number;
  code: string;
  taxonId: number;

  taxon?: Taxon;
}

interface AccessionSearchResult {
  results: Accession[];
}

async function get(
  orgId: number,
  id: number,
  options?: { expand?: string[]; include?: string[] }
): Promise<Accession> {
  const params = new URLSearchParams();
  if (options && !!options.expand) {
    params.append("expand", options.expand.join(","));
  }
  if (options && !!options.include) {
    params.append("include", options.include.join(","));
  }
  const queryParams = "?".concat(params.toString());
  const path = [basePath(orgId), id, queryParams].join("/");
  return api.get(path);
}

async function create(
  orgId: number,
  data: Partial<Accession>
): Promise<Accession> {
  const path = basePath(orgId).concat("/");
  return api.post(path, data);
}

async function update(
  orgId: number,
  id: number,
  data: Partial<Accession>
): Promise<Accession> {
  const path = [basePath(orgId), id].join("/").concat("/");
  return api.patch(path, data);
}

async function meta(orgId: number) {
  const path = [basePath(orgId), "meta"].join("/").concat("/");
  return api.get(path);
}

async function search(
  orgId: string | number,
  query: string
  // options?: { expand?: string[]; include?: string[] }
): Promise<Accession[]> {
  const params = new URLSearchParams({ search: query });
  const queryParams = "?".concat(params.toString());
  const path = [basePath(orgId), queryParams].join("/");
  return api
    .get<AccessionSearchResult>(path)
    .then((resp: AccessionSearchResult) => resp.results);
}

export { get, create, update, meta, search };
