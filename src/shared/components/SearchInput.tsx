import React from "react";
import styled from "styled-components";
import LoadingSpinner from "./LoadingSpinner";
import { Input } from "reactstrap";
import { FaTimes } from "react-icons/fa";

interface SearchInputProps {
  search: string;
  setSearch: Function;
  loading?: boolean;
  placeholder?: string;
}

export default function SearchInput({
  search,
  setSearch,
  loading,
  placeholder
}: SearchInputProps) {
  return (
    <SearchInputWrapper>
      <Input
        value={search}
        placeholder={placeholder || "Search..."}
        onChange={e => setSearch(e.target.value)}
        className="orange"
      />
      <SearchInputLoadingIndicator>
        {loading && <LoadingSpinner />}
        {search && (
          <FaTimes
            className="clickable text-red"
            onClick={() => setSearch("")}
          />
        )}
      </SearchInputLoadingIndicator>
    </SearchInputWrapper>
  );
}

const SearchInputWrapper = styled.div`
  position: relative;
`;

const SearchInputLoadingIndicator = styled.div`
  position: absolute;
  color: black;
  right: 1.5rem;
  top: 8px;
`;
