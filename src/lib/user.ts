import * as api from "./api";
import { Organization } from "./organization";
import * as _ from "lodash";
import useLocalStorage from "../hooks/local-storage";

export interface User {
  id: number;
  firstName: string;
  username: string;
  email: string;
  defaultOrganizationId: number;

  organizations: Organization[];
}

function useCurrentUser(): [User | undefined, (user: User) => void] {
  const [value, setValue] = useLocalStorage("currentUser");
  const currentUser = value ? JSON.parse(value) : undefined;

  function setCurrentUser(user: User) {
    setValue(JSON.stringify(user));
  }

  return [currentUser, setCurrentUser];
}

function useCurrentOrganization() {
  const [value, setValue] = useLocalStorage("currentOrganization");
  const currentOrg = value ? JSON.parse(value) : undefined;

  function setCurrentOrg(org: Organization) {
    setValue(JSON.stringify(org));
  }

  return [currentOrg, setCurrentOrg];
}

async function create() {
  // TODO:
}

async function me(): Promise<User> {
  return api.get<User>("/v1/me/");
}

export { create, me, useCurrentOrganization, useCurrentUser };
