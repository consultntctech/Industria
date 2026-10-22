"use client";

import React, { useState } from "react";
import { FaChevronDown, FaChevronRight, FaChevronUp } from "react-icons/fa";
import { INavBarItem } from "@/types/NavBar.types";

type NavSubGroupProps = {
  group: INavBarItem;
  isDesktop: boolean;
  isGroupActive: boolean;
  isInlineOpen: boolean;
  currentItemId: string | undefined;
  onToggleInline: (groupId: string) => void;
  onLeafClick: (leaf: INavBarItem) => void;
  renderIcon: (icon: React.ReactNode, active: boolean) => React.ReactNode;
};

const NavSubGroup = ({
  group,
  isDesktop,
  isGroupActive,
  isInlineOpen,
  currentItemId,
  onToggleInline,
  onLeafClick,
  renderIcon,
}: NavSubGroupProps) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const children = group.subMenu ?? [];

  const handleRowClick = () => {
    if (isDesktop) {
      setIsFlyoutOpen(true);
    } else {
      onToggleInline(group.id);
    }
  };

  const handleLeafClick = (leaf: INavBarItem) => {
    setIsFlyoutOpen(false);
    onLeafClick(leaf);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsFlyoutOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") setIsFlyoutOpen(false);
  };

  const renderLeaf = (leaf: INavBarItem) => {
    const active = currentItemId === leaf.id;
    return (
      <button
        type="button"
        key={leaf.id}
        onClick={() => handleLeafClick(leaf)}
        className={`flex w-full items-center gap-3 whitespace-nowrap rounded-lg p-2 text-left cursor-pointer hover:bg-gray-100 ${
          active ? "bg-gray-200" : ""
        }`}
      >
        {renderIcon(leaf.icon, active)}
        <span className={active ? "text-black" : "text-gray-500"}>{leaf.title}</span>
      </button>
    );
  };

  const showFlyout = isDesktop && isFlyoutOpen;
  const showInline = !isDesktop && isInlineOpen;

  return (
    <div
      className="relative"
      onMouseEnter={() => isDesktop && setIsFlyoutOpen(true)}
      onMouseLeave={() => isDesktop && setIsFlyoutOpen(false)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isDesktop ? isFlyoutOpen : isInlineOpen}
        onClick={handleRowClick}
        className={`flex w-full items-center justify-between gap-3 rounded-lg p-2 text-left cursor-pointer hover:bg-gray-100 ${
          isGroupActive || showFlyout ? "bg-gray-200" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          {renderIcon(group.icon, isGroupActive)}
          <span className={isGroupActive ? "text-black" : "text-gray-500"}>
            {group.title}
          </span>
        </div>
        <span className="text-gray-500">
          {isDesktop ? (
            <FaChevronRight size={12} />
          ) : isInlineOpen ? (
            <FaChevronUp size={12} />
          ) : (
            <FaChevronDown size={12} />
          )}
        </span>
      </button>

      {showFlyout && (
        <div className="absolute left-full top-0 z-20 pl-2">
          <div className="flex min-w-48 flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
            {children.map(renderLeaf)}
          </div>
        </div>
      )}

      {showInline && (
        <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-gray-200 pl-2">
          {children.map(renderLeaf)}
        </div>
      )}
    </div>
  );
};

export default NavSubGroup;