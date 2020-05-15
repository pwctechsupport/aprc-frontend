import classnames from "classnames";
import React, { useState, Fragment, useEffect } from "react";
import { FaPlus, FaUndo } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { Collapse } from "reactstrap";
import { useDebounce } from "use-debounce/lib";
import {
  useSideboxPolicyQuery,
  // useReviewerPoliciesQuery,
  // usePreparerPoliciesQuery,
  // useUserPoliciesQuery,
} from "../../../generated/graphql";
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
  // const [preparer, setPreparer] = useState(false);
  // const [reviewer, setReviewer] = useState(false);
  // const [anythingUser, setAnythingUser] = useState(false);

  const { data, loading } = useSideboxPolicyQuery({
    variables: {
      filter: {
        ...(!searchQuery && {
          ancestry_null: true,
        }),
        title_cont: searchQuery,
      },
      limit,
      isTree: !searchQuery,
    },
  });
  // const {
  //   data: dataPreparer,
  //   loading: loadingPreparer,
  // } = usePreparerPoliciesQuery({
  //   skip: preparer,
  //   variables: {
  //     filter: {
  //       ...(!searchQuery && {
  //         ancestry_null: true,
  //       }),
  //       title_cont: searchQuery,
  //     },
  //     limit,
  //     isTree: !searchQuery,
  //   },
  // });
  // const {
  //   data: dataReviewer,
  //   loading: loadingReviewer,
  // } = useReviewerPoliciesQuery({
  //   skip: reviewer,
  //   variables: {
  //     filter: {
  //       ...(!searchQuery && {
  //         ancestry_null: true,
  //       }),
  //       title_cont: searchQuery,
  //     },
  //     limit,
  //     isTree: !searchQuery,
  //   },
  // });
  const policies = data?.sidebarPolicies?.collection || [];
  // const preparerPolicies = dataPreparer?.preparerPolicies?.collection || [];
  // const reviewerPolicies = dataReviewer?.reviewerPolicies?.collection || [];
  useEffect(() => {
    policies.length === limit ? setCondition(true) : setCondition(false);
  }, [policies, scrollPointer, limit]);

  // useEffect(() => {
  //   if (isAdminPreparer) {
  //     setPreparer(false);
  //     setReviewer(true);
  //     setAnythingUser(true);
  //   } else if (isAdminReviewer) {
  //     setPreparer(true);
  //     setReviewer(false);
  //     setAnythingUser(true);
  //   } else {
  //     setPreparer(true);
  //     setReviewer(true);
  //     setAnythingUser(false);
  //   }
  // }, [isAdminPreparer, isAdminReviewer]);

  // const hideRefreshReviewer = reviewerPolicies.length < limit;
  // const hideRefreshPreparer = preparerPolicies.length < limit;
  const hideRefreshButton = policies.length < limit;
  // const preparerCondition = !loadingPreparer && !preparer;
  // const reviewerCondition = !loadingReviewer && !reviewer;
  // const anythingUserCondition = !loading && !anythingUser;
  return (
    <SideBox onScroll={onScroll}>
      <SideBoxTitle>
        <div className="d-flex justify-content-between">
          {isAdmin || isAdminReviewer || isAdminPreparer
            ? "Policies Admin"
            : "Policies"}
          {(isAdmin || isAdminPreparer) && (
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
        loading={
          loading
          // || loadingPreparer || loadingReviewer
        }
        placeholder="Search Policies..."
      />
      <div>
        {/* {isAdminPreparer ? (
          preparerPolicies.length ? (
            preparerPolicies.map((policy, index) => (
              <Fragment key={index}>
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
              </Fragment>
            ))
          ) : (
            <div className="text-center p-2 text-orange">Policy not found</div>
          )
        ) : isAdminReviewer ? (
          reviewerPolicies.length ? (
            reviewerPolicies.map((policy, index) => (
              <Fragment key={index}>
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
              </Fragment>
            ))
          ) : (
            <div className="text-center p-2 text-orange">Policy not found</div>
          ) */}
        {policies.length ? (
          policies.map((policy, index) => (
            <Fragment key={index}>
              <PolicyBranch
                key={policy.id}
                parentId={policy.parentId}
                id={policy.id}
                activeId={activeId}
                activeMode={activeMode}
                title={policy.title}
                children={policy.children}
                level={0}
                isAdmin={isAdmin}
              />
            </Fragment>
          ))
        ) : (
          <div className="text-center p-2 text-orange">Policy not found</div>
        )}
        {/* refresh button */}
        {/* {( */}
        {/* !hideRefreshReviewer || !hideRefreshPreparer || */}
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
}

const PolicyBranch = ({
  id,
  activeId,
  parentId,
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
              level={Number(level) + 1}
              isAdmin={isAdmin}
            />
          ))}
        </Collapse>
      )}
    </div>
  );
};
