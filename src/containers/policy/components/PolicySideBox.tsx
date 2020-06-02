import classnames from "classnames";
import React, { useState, Fragment, useEffect } from "react";
import { FaUndo } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { Collapse } from "reactstrap";
import { useDebounce } from "use-debounce/lib";
import { useSideboxPolicyQuery } from "../../../generated/graphql";
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
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

export default function PolicySideBox({ location }: RouteComponentProps) {
  const [activeId, activeMode] = getPathnameParams(location.pathname, "policy");
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 700);
  const [limit, setLimit] = useState(25);
  const [condition, setCondition] = useState(false);
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminPreparer || isAdminReviewer);

  const [scrollPointer, setScrollPointer] = useState(1000);

  const onScroll = (e: any) => {
    const scroll =
      e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight;
    setScrollPointer(scroll);
    if ((scroll === 0 || scroll < 0) && condition) {
      setLimit(limit + 25);
    }
  };
  // This query is unique, if isTree = true, it captures only the root policy and it's sub, to be rendered as tree.
  // When isTree = false, it just query all the policies, to be rendered as search result.

  const { data, loading } = useSideboxPolicyQuery({
    variables: {
      filter: isUser
        ? {
            ...(!searchQuery && {
              ancestry_null: true,
            }),
            title_cont: searchQuery,
            status_eq: "release",
          }
        : {
            ...(!searchQuery && {
              ancestry_null: true,
            }),
            title_cont: searchQuery,
          },
      limit,
      isTree: !searchQuery,
    },
  });

  const policies = data?.sidebarPolicies?.collection || [];
  useEffect(() => {
    policies.length === limit ? setCondition(true) : setCondition(false);
  }, [policies, scrollPointer, limit]);

  const hideRefreshButton = policies.length < limit;

  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {isAdmin || isAdminReviewer || isAdminPreparer
            ? "Policies Admin"
            : "Policies"}
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
          policies.map((policy, index) => (
            <Fragment key={index}>
              <PolicyBranch
                originalData={policy}
                key={policy.id}
                parentId={policy.parentId}
                id={policy.id}
                activeId={activeId}
                activeMode={activeMode}
                title={policy.title}
                children={policy.children}
                level={0}
                status={policy.status}
                isAdmin={isAdmin}
              />
            </Fragment>
          ))
        ) : (
          <div className="text-center p-2 text-orange">Policy not found</div>
        )}
        {!hideRefreshButton && (
          <div className="text-center mt-2">
            <Tooltip description="refresh">
              <Button
                className="soft red "
                color=""
                onClick={() => setLimit(limit + 25)}
              >
                <FaUndo />
              </Button>
            </Tooltip>
          </div>
        )}
        {loading && (
          <div>
            <LoadingSpinner className="mt-2 mb-2" centered biggerSize />
          </div>
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
  loading?: boolean;
  activeId?: string | number | undefined;
  activeMode?: string;
  title?: string | null | undefined;
  children?: Array<PolicyBranchProps> | null | undefined;
  level?: number;
  isAdmin?: boolean;
  parentId?: any;
  status?: any;
  originalData?: any;
}

const PolicyBranch = ({
  id,
  activeId,
  parentId,
  activeMode,
  title,
  children = [],
  level,
  originalData,
  status,
  isAdmin,
}: PolicyBranchProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const isActive = id === activeId;
  const hasChild = Array.isArray(children) && !!children.length;
  const [isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin_reviewer",
    "admin_preparer",
  ]);
  const childrenHasChild = originalData?.children
    ?.map((a: any) => a.status)
    .includes("release");
  return (
    <div>
      <Fragment>
        {/* when the current user is just a user */}
        {!(isAdminReviewer || isAdminPreparer) && status === "release" ? (
          <Fragment>
            <SideBoxBranch
              className={classnames("d-flex align-items-center", {
                active: isActive,
              })}
              padLeft={level ? level * 10 : 0}
              isLastChild={(!hasChild || !childrenHasChild) && parentId}
            >
              {hasChild && childrenHasChild ? (
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
                {title}
              </SideBoxBranchTitle>
            </SideBoxBranch>
            {hasChild && (
              <Collapse isOpen={isOpen}>
                {children?.map((child: PolicyBranchProps) => (
                  <PolicyBranch
                    key={child.id}
                    parentId={child.parentId}
                    {...child}
                    activeId={activeId}
                    originalData={child}
                    status={child.status}
                    activeMode={activeMode}
                    level={Number(level) + 1}
                    isAdmin={isAdmin}
                  />
                ))}
              </Collapse>
            )}
          </Fragment>
        ) : null}
        {/* when the current user is an admin */}
        {isAdmin || isAdminReviewer || isAdminPreparer ? (
          <Fragment>
            <SideBoxBranch
              className={classnames("d-flex align-items-center", {
                active: isActive,
              })}
              padLeft={level ? level * 10 : 0}
              isLastChild={!hasChild && parentId}
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
                {title}
              </SideBoxBranchTitle>
            </SideBoxBranch>
            {hasChild && (
              <Collapse isOpen={isOpen}>
                {children?.map((child: PolicyBranchProps) => (
                  <PolicyBranch
                    key={child.id}
                    parentId={child.parentId}
                    {...child}
                    activeId={activeId}
                    activeMode={activeMode}
                    status={child.status}
                    level={Number(level) + 1}
                    isAdmin={isAdmin}
                  />
                ))}
              </Collapse>
            )}
          </Fragment>
        ) : null}
      </Fragment>
    </div>
  );
};
