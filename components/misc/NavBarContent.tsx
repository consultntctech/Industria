"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavLinks } from "@/Data/NavLinks";
import { INavBarItem } from "@/types/NavBar.types";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { flattenNav } from "@/functions/helpers";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { filterNavLinks } from "@/Data/roles/permissions";
import { skipToken, useQuery } from "@tanstack/react-query";
import { ISessionRole } from "@/types/Types";
import NavSubGroup from "./NavSubGroup";

type NavBarContentProps = {
  isNavOpen: boolean;
};

const NavBarContent = ({ isNavOpen }: NavBarContentProps) => {
  const { user } = useAuth();
  const { data: roles } = useQuery<ISessionRole[]>({
    queryKey: ["permissions", user?._id],
    queryFn: skipToken,
    enabled: Boolean(user),
  });

  const links = useMemo(
    () => filterNavLinks(user, roles, NavLinks()),
    [user, roles]
  );
  const pathname = usePathname();
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [currentItem, setCurrentItem] = useState<INavBarItem | null>(links?.[0] ?? null);
  const [openSubMenuId, setOpenSubMenuId] = useState<string | null>(null);
  // Inline (accordion) group used below the lg breakpoint
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  // Ids of every ancestor of the active item, used to highlight groups
  const [activeTrail, setActiveTrail] = useState<string[]>([]);

  // 🧭 Update active item based on current route
  useEffect(() => {
    const flat = flattenNav(links);

    const match = flat
      .filter(({ item }) =>
        item.link === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(item.link!)
      )
      .sort((a, b) => (b.item.link?.length ?? 0) - (a.item.link?.length ?? 0))[0];

    if (match) {
      setCurrentItem(match.item);
      setActiveTrail(match.ancestorIds);
      setOpenSubMenuId(match.ancestorIds[0] ?? null);
      setOpenGroupId(match.ancestorIds[1] ?? null);
    }
  }, [pathname, links]);

  const handleTopLevelClick = (item: INavBarItem) => {
    setCurrentItem(item);
    if (item?.link) {
      router.push(item.link);
    } else if (item.subMenu && item.subMenu.length > 0) {
      setOpenSubMenuId((prev) => (prev === item.id ? null : item.id));
    } else {
      setOpenSubMenuId(null);
    }
  };

  const handleSubItemClick = (parentId: string, subItem: INavBarItem) => {
    setCurrentItem(subItem);
    setOpenSubMenuId(parentId);
    if (subItem?.link) {
      router.push(subItem.link);
    }
  };

  const handleNestedItemClick = (leaf: INavBarItem) => {
    setCurrentItem(leaf);
    if (leaf.link) {
      router.push(leaf.link);
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setOpenGroupId((prev) => (prev === groupId ? null : groupId));
  };

  const isActiveTopLevel = (item: INavBarItem) => currentItem?.id === item.id;
  const isActiveSubItem = (subItem: INavBarItem) => currentItem?.id === subItem.id;

  const renderIcon = (iconElem: React.ReactNode, active: boolean): React.ReactNode => {
    if (!React.isValidElement<{ className?: string }>(iconElem)) return iconElem;
    const existingClass = iconElem.props.className ?? "";
    const computed = active ? "text-black" : "text-gray-500";
    const mergedClass = `${existingClass} ${computed}`.trim();
    return React.cloneElement(iconElem, { className: mergedClass });
  };

  return (
    <div className={`mt-8 ${isNavOpen ? "flex" : "hidden"} lg:flex flex-col gap-3 transition-all duration-300 ease-in-out w-full`}>
      {links.map((item) => {
        const activeTop = isActiveTopLevel(item);
        const subOpen = openSubMenuId === item.id;
        const hasSubMenu = Boolean(item.subMenu && item.subMenu.length > 0);

        return (
          <div key={item.id}>
            <div
              className={`flex gap-4 items-center justify-between p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 ${
                activeTop ? "bg-gray-200" : ""
              }`}
              onClick={() => handleTopLevelClick(item)}
            >
              <div className="flex items-center gap-3">
                {renderIcon(item.icon, activeTop)}
                <span className={activeTop ? "text-black" : "text-gray-500"}>
                  {item.title}
                </span>
              </div>

              {hasSubMenu && (
                <div className="text-gray-500">
                  {subOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </div>
              )}
            </div>

            {hasSubMenu && subOpen && (
              <div className="ml-6 mt-1 flex flex-col gap-2">
                {item.subMenu?.map((subItem) => {
                  if (subItem.subMenu && subItem.subMenu.length > 0) {
                    return (
                      <NavSubGroup
                        key={subItem.id}
                        group={subItem}
                        isDesktop={isDesktop}
                        isGroupActive={activeTrail.includes(subItem.id)}
                        isInlineOpen={openGroupId === subItem.id}
                        currentItemId={currentItem?.id}
                        onToggleInline={handleGroupToggle}
                        onLeafClick={handleNestedItemClick}
                        renderIcon={renderIcon}
                      />
                    );
                  }

                  const activeSub = isActiveSubItem(subItem);
                  return (
                    <div
                      key={subItem.id}
                      onClick={() => handleSubItemClick(item.id, subItem)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                        activeSub ? "bg-gray-200" : ""
                      }`}
                    >
                      {renderIcon(subItem.icon, activeSub)}
                      <span className={activeSub ? "text-black" : "text-gray-500"}>
                        {subItem.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NavBarContent;