import classnames from "classnames";
import React, { useState } from "react";
import { FaCaretRight, FaPlus } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { Collapse } from "reactstrap";
import styled, { css } from "styled-components";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import { usePolicyTreeQuery } from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import { SideBoxSearch } from "../../../shared/components/SideBox";
import Tooltip from "../../../shared/components/Tooltip";
import { getPathnameParams } from "../../../shared/formatter";

const PolicySideBox = ({ location }: RouteComponentProps) => {
  const [activeId, activeMode] = getPathnameParams(location.pathname, "policy");
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 700);
  const isAdmin = location.pathname.split("/")[1] === "policy-admin";

  // This query is unique, if isTree = true, it captures only the root policy and it's sub, to be rendered as tree.
  // When isTree = false, it just query all the policies, to be rendered as search result.
  const { data, loading } = usePolicyTreeQuery({
    variables: {
      filter: {
        ...(!searchQuery && {
          ancestry_null: true
        }),
        title_cont: searchQuery
      },
      isTree: !searchQuery
    }
  });
  const policies = oc(data).policies.collection([]);

  return (
    <div className="side-box">
      <div className="d-flex justify-content-between mx-3 mt-4 mb-3">
        <h4 className="text-orange">
          {isAdmin ? "Policies Admin" : "Policies"}
        </h4>
        <Tooltip description="Create Policy">
          <Button
            tag={Link}
            to={isAdmin ? "/policy-admin/create" : "/policy/create"}
            color=""
            className="soft red"
          >
            <FaPlus />
          </Button>
        </Tooltip>
      </div>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        loading={loading}
        placeholder="Search Policies..."
      />

      <div className="side-box__list">
        {policies.length ? (
          policies.map(policy => (
            <PolicyBranch
              key={policy.id}
              id={policy.id}
              activeId={activeId}
              activeMode={activeMode}
              title={policy.title}
              children={policy.children}
              level={0}
              isAdmin={isAdmin}
            />
          ))
        ) : (
          <div className="text-center p-2 text-orange">Policy not found</div>
        )}
      </div>
    </div>
  );
};

export default PolicySideBox;

const PolicyBranch = ({
  id,
  activeId,
  activeMode,
  title,
  children = [],
  level,
  isAdmin
}: PolicyBranchProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const isActive = id === activeId;
  const hasChild = Array.isArray(children) && !!children.length;

  return (
    <div>
      <div
        className={classnames("d-flex align-items-center side-box__item", {
          active: isActive
        })}
        style={{ paddingLeft: Number(level) * 10 }}
      >
        {hasChild ? (
          <div className="side-box__item__icon clickable" onClick={toggle}>
            <Icon
              open={isOpen}
              className={isActive ? "text-white" : "text-orange"}
              size={14}
            />
          </div>
        ) : (
          <div style={{ width: 34 }} />
        )}
        <Link
          className={classnames("side-box__item__title", { active: isActive })}
          to={
            isAdmin
              ? `/policy-admin/${id}/details`
              : activeMode
              ? `/policy/${id}/${activeMode}`
              : `/policy/${id}`
          }
        >
          {title}
        </Link>
      </div>
      {hasChild && (
        <Collapse isOpen={isOpen}>
          {Array.isArray(children) &&
            children.map((child: PolicyBranchProps) => (
              <PolicyBranch
                key={child.id}
                {...child}
                activeId={activeId}
                activeMode={activeMode}
                level={Number(level) + 1}
                isAdmin={isAdmin}
              />
            ))}
        </Collapse>
      )}
    </div>
  );
};

const Icon = styled(FaCaretRight)<{ open: boolean }>`
  transition: 0.15s ease-in-out;
  ${(p: { open: boolean }) =>
    p.open &&
    css`
      transform: rotate(90deg);
    `};
`;

interface PolicyBranchProps {
  id: string | number;
  activeId?: string | number | undefined;
  activeMode?: string;
  title?: string | null | undefined;
  children?: Array<PolicyBranchProps> | null | undefined;
  level?: number;
  isAdmin?: boolean;
}
