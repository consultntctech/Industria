"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavLinks } from "@/Data/NavLinks";
import { INavBarItem } from "@/types/NavBar.types";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { flattenNav } from "@/functions/helpers";
import { useAuth } from "@/hooks/useAuth";
import { filterNavLinks } from "@/Data/roles/permissions";

type NavBarContentProps = {
  isNavOpen: boolean;
};

const NavBarContent = ({ isNavOpen }: NavBarContentProps) => {
  const { user } = useAuth();
  const links = useMemo(
  () => filterNavLinks(user, NavLinks()),
  [user]
);
  const pathname = usePathname();

  const [currentItem, setCurrentItem] = useState<INavBarItem | null>(links?.[0] ?? null);
  const [openSubMenuId, setOpenSubMenuId] = useState<string | null>(null);

  const router = useRouter();

  // 🧭 Update active item based on current route
  useEffect(() => {
    const flat = flattenNav(links);

    const match = flat
      .filter(({ item }) =>
        item.link === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(item.link!)
      )
      .sort(
        (a, b) =>
          (b.item.link?.length ?? 0) - (a.item.link?.length ?? 0)
      )[0];

    if (match) {
      setCurrentItem(match.item);
      setOpenSubMenuId(match.parentId);
    }
  }, [pathname, links]);


  const handleTopLevelClick = (item: INavBarItem) => {
    setCurrentItem(item);
    if(item?.link){
      router.push(item.link);
    }
    else if (item.subMenu && item.subMenu.length > 0) {
      setOpenSubMenuId((prev) => (prev === item.id ? null : item.id));
    } else {
      setOpenSubMenuId(null);
    }
  };

  const handleSubItemClick = (parentId: string, subItem: INavBarItem) => {
    setCurrentItem(subItem);
    setOpenSubMenuId(parentId);
    if(subItem?.link){
      router.push(subItem.link);
    }
  };

  const isActiveTopLevel = (item: INavBarItem) => currentItem?.id === item.id;
  const isActiveSubItem = (subItem: INavBarItem) => currentItem?.id === subItem.id;

  const renderIcon = (iconElem: React.ReactNode, active: boolean) => {
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
        const hasSubMenu = item.subMenu && item.subMenu.length > 0;

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
                <span className={`${activeTop ? "text-black" : "text-gray-500"}`}>
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
                { item?.subMenu && item?.subMenu.map((subItem) => {
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
                      <span className={`${activeSub ? "text-black" : "text-gray-500"}`}>
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
