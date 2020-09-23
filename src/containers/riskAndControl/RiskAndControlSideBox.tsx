import classnames from "classnames";
import React, { useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { Collapse } from "reactstrap";
import { useDebounce } from "use-debounce/lib";
import { useBusinessProcessTreeQuery } from "../../generated/graphql";
import {
  SideBox,
  SideBoxBranch,
  SideBoxBranchIcon,
  SideBoxBranchIconContainer,
  SideBoxBranchTitle,
  SideBoxSearch,
  SideBoxTitle,
} from "../../shared/components/SideBox";
import { getPathnameParams } from "../../shared/formatter";

export default function RiskAndControlSideBox({
  location,
}: RouteComponentProps) {
  const [activeId, activeMode] = getPathnameParams(
    location.pathname,
    "risk-and-control"
  );
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 700);

  const { data, loading } = useBusinessProcessTreeQuery({
    variables: {
      filter: {
        ...(!search && { ancestry_null: true }),
        name_cont: searchQuery,
      },
      limit: 1000,
      isTree: !search,
    },
  });

  const businessProcesses = data?.navigatorBusinessProcesses?.collection || [];
  return (
    <SideBox>
      <SideBoxTitle>Risk & control</SideBoxTitle>

      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        loading={loading}
        placeholder="Search business process..."
      />

      {businessProcesses.map((businessProcess) => {
        return (
          <BusinessProcessBranch
            parentId={businessProcess.parentId}
            key={businessProcess.id}
            id={businessProcess.id}
            activeId={activeId}
            activeMode={activeMode}
            name={businessProcess.name}
            children={businessProcess.children}
            level={0}
          />
        );
      })}
    </SideBox>
  );
}

// ================================================
// BusinessProcessBranch Component
// ================================================
interface BusinessBranchProps {
  id: string | number;
  activeId?: string | number | undefined;
  activeMode?: string;
  name?: string | null | undefined;
  children?: Array<BusinessBranchProps> | null | undefined;
  level?: number;
  parentId?: string | null | undefined;
  myBroHasChild?: boolean;
}

const BusinessProcessBranch = ({
  id,
  activeId,
  activeMode,
  name,
  parentId,
  myBroHasChild,
  children = [],
  level,
}: BusinessBranchProps) => {
  const [getWidth, setGetWidth] = useState(0);

  const grandpa =
    children?.map((a) => a.children?.map((b) => b.id)).flat().length || 0;
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const isActive = id === activeId;
  const hasChild = Array.isArray(children) && !!children.length;
  const lastChild = parentId !== null && !hasChild;
  return (
    <div>
      <SideBoxBranch
        className={classnames("d-flex align-items-center", {
          active: isActive,
        })}
        padLeft={level ? level * 12 : 0}
        isLastChild={lastChild && !myBroHasChild}
        ref={(ref) => setGetWidth(ref?.clientWidth || 0)}
      >
        {hasChild ? (
          // <SideBoxBranchIconContainer onClick={toggle}>
          //   <SideBoxBranchIcon
          //     open={isOpen}
          //     className={isActive ? "text-white" : "text-orange"}
          //     size={14}
          //   />
          // </SideBoxBranchIconContainer>
          <div style={{ width: 20 }} />
        ) : (
          <div style={{ width: 20 }} />
        )}
        <SideBoxBranchTitle
          style={{ width: getWidth }}
          as={Link}
          className={classnames("side-box__item__title", { active: isActive })}
          to={
            activeMode
              ? activeMode === "risk" || activeMode === "control"
                ? `/risk-and-control/${id}`
                : `/risk-and-control/${id}/${activeMode}`
              : `/risk-and-control/${id}`
          }
        >
          {name}
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
          {Array.isArray(children) &&
            children.map((child: BusinessBranchProps) => (
              <BusinessProcessBranch
                parentId={child.parentId}
                myBroHasChild={grandpa ? true : false}
                key={child.id}
                {...child}
                activeId={activeId}
                activeMode={activeMode}
                level={Number(level) + 1}
              />
            ))}
        </Collapse>
      )}
    </div>
  );
};
