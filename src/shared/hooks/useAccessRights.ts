import { oc } from "ts-optchain";
import { useSelector } from "./useSelector";

const useAccessRights = (allowedRoles: string[]): boolean[] => {
  const user = useSelector(state => state.auth.user);
  const roleNames = oc(user)
    .roles([])
    .map(role => role.name);
  let permissions: boolean[] = [];

  for (const role of allowedRoles) {
    permissions.push(role ? roleNames.includes(role) : false);
  }

  return permissions;
};

export default useAccessRights;
