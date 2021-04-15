import classnames from "classnames";
import React, { Fragment, useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { Collapse } from "reactstrap";
import { useDebounce } from "use-debounce/lib";
import PickIcon from "../../../assets/Icons/PickIcon";
import { useSideboxPolicyQuery } from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
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
            status_in: ["release", "ready_for_edit", "waiting_for_approval"],
          }
        : isAdminPreparer
        ? {
            ...(!searchQuery && {
              ancestry_null: true,
            }),
            title_cont: searchQuery,
            status_in: [
              "waiting_for_review",
              "ready_for_edit",
              "waiting_for_approval",
              "release",
            ],
          }
        : {
            ...(!searchQuery && {
              ancestry_null: true,
              // status_not_eq: "draft",
            }),
            title_cont: searchQuery,
          },
      limit,
      isTree: !searchQuery,
    },
    fetchPolicy: "no-cache"
  });

  const policies = data?.sidebarPolicies?.collection || [];
  // const policiesReal =
  //   isUser || isAdminReviewer
  //     ? policies
  //         .map((a) => {
  //           if (a.status !== "draft") {
  //             return a;
  //           } else {
  //             return undefined;
  //           }
  //         })
  //         .filter((b) => b !== undefined)
  //     : policies;

  const policiesReal = isAdminReviewer
    ? policies.filter((a) => a.status !== "draft")
    : isUser
    ? policies.filter(
        (a) =>
          a.status === "ready_for_edit" ||
          a.status === "waiting_for_approval" ||
          a.status === "release"
      )
    : policies;

  useEffect(() => {
    policies.length === limit ? setCondition(true) : setCondition(false);
  }, [policies, scrollPointer, limit]);

  const hideRefreshButton = policies.length < limit;

  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          Policy Administrative
          {/* {isAdmin || isAdminReviewer || isAdminPreparer
            ? ""
            : "Policies"} */}
        </div>
      </SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        loading={loading}
        placeholder="Search policies..."
      />
      <div>
        {policiesReal.length ? (
          policiesReal.map((policy, index) => (
            <Fragment key={index}>
              <PolicyBranch
                originalData={policy}
                key={policy?.id}
                parentId={policy?.parentId}
                id={policy?.id || ""}
                activeId={activeId}
                activeMode={activeMode}
                title={policy?.title}
                children={policy?.children}
                level={0}
                status={policy?.status}
                isAdmin={isAdmin}
              />
            </Fragment>
          ))
        ) : (
          <div className="text-center p-2 text-grey">Policy not found</div>
        )}
        {!hideRefreshButton && (
          <div className="text-center mt-2">
            <Tooltip description="refresh">
              <Button
                className="soft red "
                color=""
                onClick={() => setLimit(limit + 25)}
              >
                <PickIcon name="reloadOrange" />
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
  myBroHasChild?: boolean;
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
  myBroHasChild,
  isAdmin,
}: PolicyBranchProps) => {
  const [getWidth, setGetWidth] = useState(0);

  const modifiedChildren =
    children &&
    children.sort((a, b) =>
      b.title && a.title
        ? a.title.toLowerCase() > b.title.toLowerCase()
          ? 1
          : b.title.toLowerCase() > a.title.toLowerCase()
          ? -1
          : 0
        : 0
    );

  const filterModifiedChildren = modifiedChildren?.filter((childPolicy) => {
    if (
      childPolicy.status === "release" ||
      childPolicy.status === "waiting_for_approval"
    ) {
      return childPolicy;
    }
  });

  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const isActive = id === activeId;
  const hasChild = Array.isArray(children) && !!children.length;
  const [isAdminReviewer, isAdminPreparer, isUser] = useAccessRights([
    "admin_reviewer",
    "admin_preparer",
    "user",
  ]);
  const childrenHasChildWhenUser = originalData?.children
    ?.map((a: any) => a.status)
    .includes("release" || "ready_for_edit" || "waiting_for_approval");
  const reviewerHasChild =
    originalData?.children?.filter((a: any) => a.status !== "draft") || [];
  const grandpa = children?.map((a) => a.children).flat().length || 0;

  return (
    <div>
      <Fragment>
        {/* when the current user is just a user */}
        {isUser ? (
          <Fragment>
            <SideBoxBranch
              className={classnames("d-flex align-items-center", {
                active: isActive,
              })}
              padLeft={level ? level * 12 : 0}
              ref={(ref) => setGetWidth(ref?.clientWidth || 0)}
            >
              {childrenHasChildWhenUser ? (
                <div style={{ width: 20 }} />
              ) : (
                <div style={{ width: 20 }} />
              )}
              <SideBoxBranchTitle
                style={{ width: getWidth }}
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
              {childrenHasChildWhenUser ? (
                <SideBoxBranchIconContainer onClick={toggle}>
                  <SideBoxBranchIcon
                    open={isOpen}
                    className={isActive ? "text-white" : "text-orange"}
                    size={14}
                  />
                </SideBoxBranchIconContainer>
              ) : null}
            </SideBoxBranch>
            {hasChild && (
              <Collapse isOpen={isOpen}>
                {filterModifiedChildren?.map((child: PolicyBranchProps) => (
                  <PolicyBranch
                    key={child.id}
                    parentId={child.parentId}
                    originalData={child}
                    myBroHasChild={grandpa ? true : false}
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
        {/* when the current user is an admin */}
        {isAdmin || isAdminPreparer ? (
          <Fragment>
            <SideBoxBranch
              className={classnames("d-flex align-items-center", {
                active: isActive,
              })}
              padLeft={level ? level * 12 : 0}
              isLastChild={!hasChild && parentId && !myBroHasChild}
              ref={(ref) => setGetWidth(ref?.clientWidth || 0)}
            >
              {hasChild ? (
                <div style={{ width: 20 }} />
              ) : (
                <div style={{ width: 20 }} />
              )}
              <SideBoxBranchTitle
                style={{ width: getWidth }}
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
              {hasChild ? (
                <SideBoxBranchIconContainer onClick={toggle}>
                  <SideBoxBranchIcon
                    open={isOpen}
                    className={isActive ? "text-white" : "text-orange"}
                    size={14}
                  />
                </SideBoxBranchIconContainer>
              ) : null}
            </SideBoxBranch>
            {hasChild && (
              <Collapse isOpen={isOpen}>
                {children?.map((child: PolicyBranchProps) => (
                  <PolicyBranch
                    key={child.id}
                    parentId={child.parentId}
                    originalData={child}
                    myBroHasChild={grandpa ? true : false}
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
        ) : isAdminReviewer ? (
          <Fragment>
            <SideBoxBranch
              className={classnames("d-flex align-items-center", {
                active: isActive,
              })}
              padLeft={level ? level * 12 : 0}
              isLastChild={!hasChild && parentId && !myBroHasChild}
              ref={(ref) => setGetWidth(ref?.clientWidth || 0)}
            >
              {reviewerHasChild.length ? (
                <div style={{ width: 20 }} />
              ) : (
                <div style={{ width: 20 }} />
              )}
              <SideBoxBranchTitle
                style={{ width: getWidth }}
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

              {reviewerHasChild.length ? (
                <SideBoxBranchIconContainer onClick={toggle}>
                  <SideBoxBranchIcon
                    open={isOpen}
                    className={isActive ? "text-white" : "text-orange"}
                    size={14}
                  />
                </SideBoxBranchIconContainer>
              ) : null}
            </SideBoxBranch>
            {hasChild && (
              <Collapse isOpen={isOpen}>
                {children
                  ?.filter((a) => a.status !== "draft")
                  .map((child: PolicyBranchProps) => (
                    <PolicyBranch
                      key={child.id}
                      parentId={child.parentId}
                      {...child}
                      activeId={activeId}
                      myBroHasChild={grandpa ? true : false}
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
