import { useCombobox } from "downshift";
import React, { useCallback, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useHistory, Link } from "react-router-dom";
import styled from "styled-components";
import { useDebouncedCallback } from "use-debounce/lib";
import { usePoliciesLazyQuery } from "../../generated/graphql";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import useKeyDetection from "../../shared/hooks/useKeyDetection";
import { Input } from "../auth/Login";
import PolicySearchItem from "../policy/policySearch/PolicySearchItem";
import useAccessRights from "../../shared/hooks/useAccessRights";
import Button from "../../shared/components/Button";

interface HomepageSearchProps {
  placeholder?: string | null;
  maxMenuWidth?: number;
  navBar?: boolean;
}

export default function HomepageSearch({
  placeholder = "Search policies by title, content, related resource, and attributes (Risk, Control, Reference)...",
  maxMenuWidth,
  navBar,
}: HomepageSearchProps) {
  const history = useHistory();

  const [queryPolicies, queryPoliciesResult] = usePoliciesLazyQuery();
  const [debouncedQueryPolicies] = useDebouncedCallback(queryPolicies, 700, {
    leading: true,
    maxWait: 3000,
  });
  const items = queryPoliciesResult.data?.policies?.collection || [];
  const loading = queryPoliciesResult.loading;
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);
  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    inputValue,
    openMenu,
    closeMenu,
  } = useCombobox({
    items,
    onInputValueChange: ({ inputValue }) => {
      debouncedQueryPolicies({
        variables: {
          filter: isUser
            ? {
                references_name_or_risks_name_or_business_processes_name_or_controls_description_or_resources_name_or_title_or_description_cont: inputValue,
                status_eq: "release",
              }
            : {
                references_name_or_risks_name_or_business_processes_name_or_controls_description_or_resources_name_or_title_or_description_cont: inputValue,
              },
          withDetail: true,
        },
      });
    },
  });

  useKeyDetection(
    "Enter",
    () => {
      inputValue && history.push(`/search-policy?title_cont=${inputValue}`);
      closeMenu();
    },
    [inputValue, closeMenu]
  );

  const inputRef = useRef<HTMLDivElement>(null);
  const handleInputClick = useCallback(() => {
    window.scrollTo({
      top: (inputRef.current?.offsetTop || 0) - 90,
      behavior: "smooth",
    });
    openMenu();
  }, [openMenu]);

  return (
    <div>
      <div {...getComboboxProps()}>
        <InputWrapper isNavBar={navBar} ref={inputRef} className="d-flex">
          <Input
            {...getInputProps()}
            placeholder={placeholder}
            onClick={handleInputClick}
          />
          {navBar ? null : (
            <ToggleButton
              {...getToggleButtonProps()}
              ref={undefined}
              aria-label={"toggle menu"}
              size={20}
            />
          )}
          {navBar ? (
            <Link
              to={`${
                isUser ? "/search-policy?status_eq=release" : "/search-policy"
              }`}
            >
              <StyledButton>
                <FaSearch
                  style={{
                    position: "relative",
                    marginRight: "5px",
                    bottom: "3px",
                  }}
                />
                Full Search
              </StyledButton>
            </Link>
          ) : null}
        </InputWrapper>
      </div>
      {isOpen ? (
        <MenuWrapper>
          <StyledUl width={maxMenuWidth} {...getMenuProps()}>
            {items.length ? (
              <div>
                <StyledSpan>Showing {items.length} result(s)</StyledSpan>
                {items.map((item) => (
                  <li key={item.id}>
                    <PolicySearchItem
                      homepageSearch={inputValue || ""}
                      policy={item}
                      filter={{}}
                    />
                  </li>
                ))}
              </div>
            ) : loading ? (
              <LoadingSpinner centered size={30} color="white" />
            ) : (
              <StyledSpan>
                {inputValue
                  ? `No Items for "${inputValue}"`
                  : "Type to start searching"}
              </StyledSpan>
            )}
          </StyledUl>
        </MenuWrapper>
      ) : null}
    </div>
  );
}

// =============================================
// Styled Components
// =============================================
const InputWrapper = styled.div<{ isNavBar?: boolean }>`
  position: relative;
  display: inline-block;
  margin-right: ${(p) => (p.isNavBar ? "90px" : "0px")};
  margin-left: ${(p) => (p.isNavBar ? "-35px" : "0px")};

  @media screen and (max-width: 1325px) {
    margin-left: 0px;
  }
`;

const MenuWrapper = styled.div`
  position: relative;
  &::before {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid var(--darker-grey);
    position: absolute;
    top: -8px;
    left: 40px;
  }
`;

const StyledSpan = styled.span`
  text-align: right;
  color: white;
`;

const StyledUl = styled.ul<{ width?: number }>`
  position: absolute;
  background-color: var(--darker-grey);
  padding: 20px;
  color: black;
  list-style-type: none;
  border-radius: 10px;
  z-index: 100;
  overflow-y: scroll;
  width: ${(p) => (p.width ? p.width + "px" : "100%")};
  right: ${(p) => (p.width ? "-100px" : "unset")};
  max-height: calc(100vh - 150px);
`;

const ToggleButton = styled(FaSearch)`
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 10px;
  color: var(--darker-grey);
  background: white;
`;
const StyledButton = styled(Button)`
  cursor: pointer;
  font-size: 14px;
  padding-top: 8px;
  padding-bottom: 7px;
  position: absolute;
  /* width: 115px; */
  right: -105px;
  top: 0px;
  color: white;
  background: var(--darker-grey);
`;
