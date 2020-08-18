import React from "react";
import { FaTimes, FaCaretRight } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { Input } from "reactstrap";
import styled, { css } from "styled-components";
import LoadingSpinner from "./LoadingSpinner";

// SideBox is the main wrapper to use side box.
export const SideBox = styled.div.attrs({ className: "d-none d-md-block" })`
  background: var(--soft-grey);
  width: 25vw;
  position: fixed;
  height: calc(100vh - 63px);
  overflow-y: scroll;
  z-index: 100;
  transition: 0.7s cubic-bezier(0.075, 0.82, 0.165, 1);

  @media (max-width: 940px) {
    width: 20vw;
    &:hover {
      width: 50vw;
      box-shadow: 0px 0px 50px 2px rgba(0, 0, 0, 0.38);
      -webkit-box-shadow: 0px 0px 50px 2px rgba(0, 0, 0, 0.38);
    }
  }
  @media (max-width: 767px) {
    width: 0px;
  }
`;

// SideBoxTitle, the wrapper for the header. Better name should be SideBoxHeader.
export const SideBoxTitle = styled.h4.attrs(() => ({
  className: "text-grey",
}))`
  font-size: 23px;
  padding: 1.5rem 1rem 0.5rem 1rem;
  text-overflow: ellipsis;
  overflow-x: hidden;
  overflow: hidden;
  white-space: nowrap;
`;

// SideBoxSearch, handle the layout and input for search.
interface SideBoxSearchProps {
  search: string;
  setSearch: Function;
  loading?: boolean;
  placeholder?: string;
}

export const SideBoxSearch = ({
  search,
  setSearch,
  loading,
  placeholder,
}: SideBoxSearchProps) => (
  <SideBoxSearchWrapper>
    <Input
      value={search}
      placeholder={placeholder || "Search..."}
      onChange={(e) => setSearch(e.target.value)}
      // className="orange"
      style={{ border: `1px solid var(--search-border-side-box)` }}
    />
    <SideBoxSearchLoadingIndicator>
      {loading && <LoadingSpinner />}
      {search && (
        <FaTimes className="clickable text-red" onClick={() => setSearch("")} />
      )}
    </SideBoxSearchLoadingIndicator>
  </SideBoxSearchWrapper>
);

const SideBoxSearchWrapper = styled.div`
  padding: 0px 1rem 20px 1rem;
  position: relative;
`;

const SideBoxSearchLoadingIndicator = styled.div`
  position: absolute;
  color: black;
  right: 1.5rem;
  top: 8px;
`;

// SideBoxItem, the wrapper for rendering item in list, usually inside a map.
export const SideBoxItem = styled(NavLink)`
  display: flex;
  justify-content: space-between;
  padding: 10px 1rem;
  border-bottom: 1px solid var(--soft-black);
  border-top: 0px;
  border-right: 0px;
  border-left: 0px;
  font-size: 18px;
  border-style: dashed;
  text-decoration: none;
  color: var(--item-title-side-box);
  &:hover {
    background: var(--darker-grey-2);
    color: var(--hover-item-title-side-box);
    text-decoration: none;
  }
  &.active {
    background: var(--darker-grey-2);
    color: black;
  }
`;

// SideBoxItemText, the actual component to render the text.
interface SideBoxItemTextProps {
  flex?: number;
  bold?: boolean;
  right?: boolean;
}

export const SideBoxItemText = styled.div<SideBoxItemTextProps>`
  flex: ${(p) => p.flex || 1};
  /* white-space: nowrap; */
  /* line-height: 1.5em;
  height: 3em; */
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;
  font-weight: ${(p) => (p.bold ? "bold" : "normal")};
  text-align: ${(p) => (p.right ? "right" : null)};
`;

// NOTE: Components named with 'branch' are for nested side box case.
//       For non nesting, use the above components instead.

// SideBoxBranch, the wrapper for rendering nested item in a list.
interface SideBoxBranchProps {
  padLeft?: number | null;
  isLastChild?: boolean;
}
export const SideBoxBranch = styled.div<SideBoxBranchProps>`
  position: relative;
  border-bottom: 1px solid var(--soft-black);
  border-top: 0px;
  border-right: 0px;
  border-left: 0px;
  border-style: dashed;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: ${(p) => (p.padLeft ? p.padLeft : 0)}px;
  padding-right: 0px;
  font-size: 18px;
  &.active {
    background: var(--darker-grey-2);
  }
  &:hover {
    background: var(--darker-grey-2);
    &.active {
      background: var(--darker-grey-2);
    }
  }
  ${(p) =>
    p.isLastChild &&
    css`
      font-style: italic;
      font-size: 15px;
    `}
`;

// SideBoxBranchTitle, the actual component that renders the text.
export const SideBoxBranchTitle = styled.div`
  padding: 10px 10px 10px 0px;
  text-decoration: none;
  width: 75%;
  /* overflow: hidden; */
  /* white-space: nowrap; */
  /* text-overflow: ellipsis; */
  color: var(--item-title-side-box);
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  /* line-height: 1.2em; */
  max-height: 3.6em;
  /* font-size: 18px; */
  &.active {
    color: var(--item-title-side-box);
  }
  &:hover {
    text-decoration: none;
    color: var(--hover-item-title-side-box);
    &.active {
      color: var(--hover-item-title-side-box);
    }
  }
`;

// SideBoxBranchIconContainer, the container for the icon.
export const SideBoxBranchIconContainer = styled.div`
  color: white;
  padding: 10px;
  margin: 0;
  cursor: pointer;
  &:hover {
    background: var(--darker-grey-2);
  }
`;

// SideBoxBranchIcon, the actual animated icon.
export const SideBoxBranchIcon = styled(FaCaretRight)<{
  open: boolean;
}>`
  transition: 0.15s ease-in-out;
  ${(p: { open: boolean }) =>
    p.open &&
    css`
      transform: rotate(90deg);
    `};
`;
