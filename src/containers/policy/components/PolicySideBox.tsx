import classnames from "classnames";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { Collapse } from "reactstrap";
import { useDebounce } from "use-debounce/lib";
import { usePolicyTreeQuery } from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import {
  SideBox,
  SideBoxBranch,
  SideBoxBranchIcon,
  SideBoxBranchIconContainer,
  SideBoxBranchTitle,
  SideBoxSearch,
  SideBoxTitle,
} from "../../../shared/components/SideBox";
import Tooltip from "../../../shared/components/Tooltip";
import { getPathnameParams } from "../../../shared/formatter";
import useAccessRights from "../../../shared/hooks/useAccessRights";

export default function PolicySideBox({ location }: RouteComponentProps) {
  const [activeId, activeMode] = getPathnameParams(location.pathname, "policy");
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 700);
  // const isAdmin = location.pathname.split("/")[1] === "policy-admin";

  // This query is unique, if isTree = true, it captures only the root policy and it's sub, to be rendered as tree.
  // When isTree = false, it just query all the policies, to be rendered as search result.
  const { data, loading } = usePolicyTreeQuery({
    variables: {
      filter: {
        ...(!searchQuery && {
          ancestry_null: true,
        }),
        title_cont: searchQuery,
      },
      isTree: !searchQuery,
    },
  });
  const policies = data?.policies?.collection || [];
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  return (
    <SideBox>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {isAdmin || isAdminReviewer || isAdminPreparer
            ? "Policies Admin"
            : "Policies"}
          {(isAdmin || isAdminReviewer || isAdminPreparer) && (
            <Tooltip description="Create Policy">
              <Button
                tag={Link}
                to={isAdmin ? "/policy-admin/create" : "/policy/create"}
                className="soft red"
                color=""
              >
                <FaPlus />
              </Button>
            </Tooltip>
          )}
        </div>
      </SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        loading={loading}
        placeholder="Search Policies..."
      />
      <div>
        {policies.length ? (
          policies.map((policy) => (
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
    </SideBox>
  );
}

// ================================================
// PolicyBranch Component
// ================================================
interface PolicyBranchProps {
  id: string | number;
  activeId?: string | number | undefined;
  activeMode?: string;
  title?: string | null | undefined;
  children?: Array<PolicyBranchProps> | null | undefined;
  level?: number;
  isAdmin?: boolean;
}

const PolicyBranch = ({
  id,
  activeId,
  activeMode,
  title,
  children = [],
  level,
  isAdmin,
}: PolicyBranchProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const isActive = id === activeId;
  const hasChild = Array.isArray(children) && !!children.length;

  return (
    <div>
      <SideBoxBranch
        className={classnames("d-flex align-items-center", {
          active: isActive,
        })}
        padLeft={level ? level * 10 : 0}
        isLastChild={!hasChild}
      >
        {hasChild ? (
          <SideBoxBranchIconContainer onClick={toggle}>
            <SideBoxBranchIcon
              open={isOpen}
              className={isActive ? "text-white" : "text-orange"}
              size={14}
            />
          </SideBoxBranchIconContainer>
        ) : (
          <div style={{ width: 34 }} />
        )}
        <SideBoxBranchTitle
          as={Link}
          className={classnames({ active: isActive })}
          to={
            isAdmin
              ? `/policy-admin/${id}/details`
              : activeMode
              ? `/policy/${id}/${activeMode}`
              : `/policy/${id}/details`
          }
        >
          {title
            ? title?.length > 80
              ? title?.substring(0, 80) + "..."
              : title
            : null}
        </SideBoxBranchTitle>
      </SideBoxBranch>
      {hasChild && (
        <Collapse isOpen={isOpen}>
          {children?.map((child: PolicyBranchProps) => (
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
