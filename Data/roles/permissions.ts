import { globalAdminTableId, publicTableId, systemAdminOnlyTableId, systemAdminOrgId } from "../constants";
import { ISession, ISessionRole, OperationName } from "@/types/Types";
import { INavBarItem } from "@/types/NavBar.types";
import { IRole } from "@/lib/models/role.model";
import { Types } from "mongoose";
import { queryClient } from "@/lib/queryClient";


export const normalizeRoles = (
  roles?: ISessionRole[]
): ISessionRole[] => {
  if (!Array.isArray(roles)) return [];
  return roles;
};





export const isSystemAdmin = (user?: ISession | null | undefined): boolean => {
  if (!user) return false;
  return String(user.org) === systemAdminOrgId;
};

export const isDbGlobalAdmin = (roles?: IRole[] | string[] | Types.ObjectId[]): boolean => {
  if (!roles?.length) return false;

  // If roles are populated objects
  if (typeof roles[0] === 'object' && 'permissions' in roles[0]) {
    return (roles as IRole[]).some(
      role => role.permissions?.tableid === globalAdminTableId
    );
  }

  // If roles are just IDs (string/ObjectId) → cannot tell, assume false
  return false;
};


export const isGlobalAdmin = (roles?: ISessionRole[]): boolean => {
  if (!roles?.length) return false;

  return roles.some(
    role => role.tableid === globalAdminTableId
  );
};


export const hasTablePermission = (
  roles: ISessionRole[],
  tableId: string,
  operation: OperationName
): boolean => {
  return roles.some(role =>
    role.tableid === tableId &&
    role.operations.some(op => op.name === operation)
  );
};




export const canUser = (
  user: ISession | null | undefined,
  tableId: string,
  operation: OperationName
): boolean => {
  if (!user) return false;

  if (isSystemAdmin(user)) return true;

  const roles = normalizeRoles(
    queryClient.getQueryData<ISessionRole[]>(['permissions', user._id])
  );

  if (isGlobalAdmin(roles)) return true;

  return hasTablePermission(roles, tableId, operation);
};






export const canSeeNavItem = (
  user: ISession | null | undefined,
  roles: ISessionRole[] | undefined,
  tableids: string[]
): boolean => {
  if (!user) return false;
  if (tableids.includes(publicTableId)) return true;
  if (tableids.includes(systemAdminOnlyTableId)) return isSystemAdmin(user);
  if (isSystemAdmin(user)) return true;
  if (isGlobalAdmin(roles)) return true;

  return tableids.some(tableId =>
    hasTablePermission(normalizeRoles(roles), tableId, 'READ')
  );
};

export const filterNavLinks = (
  user: ISession | null | undefined,
  roles: ISessionRole[] | undefined,
  links: INavBarItem[]
): INavBarItem[] => {
  return links.reduce<INavBarItem[]>((acc, link) => {
    const filteredSubMenu = link.subMenu
      ? filterNavLinks(user, roles, link.subMenu)   // roles passed down here
      : undefined;

    const canSeeParent = canSeeNavItem(user, roles, link.tableids);
    const hasVisibleChildren = Boolean(filteredSubMenu?.length);

    if (!canSeeParent && !hasVisibleChildren) {
      return acc;
    }

    acc.push({
      ...link,
      subMenu: filteredSubMenu,
    });

    return acc;
  }, []);
};




