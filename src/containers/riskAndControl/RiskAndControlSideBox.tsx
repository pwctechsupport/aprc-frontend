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
  SideBoxTitle
} from "../../shared/components/SideBox";
import { getPathnameParams } from "../../shared/formatter";

export default function RiskAndControlSideBox({
  location
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
        name_cont: searchQuery
      },
      isTree: !search
    }
  });

  const businessProcesses = data?.businessProcesses?.collection || [];

  return (
    <SideBox>
      <SideBoxTitle>Risk & Control</SideBoxTitle>

      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        loading={loading}
        placeholder="Search Risk & Control..."
      />

      {businessProcesses.map(businessProcess => {
        return (
          <BusinessProcessBranch
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
}

const BusinessProcessBranch = ({
  id,
  activeId,
  activeMode,
  name,
  children = [],
  level
}: BusinessBranchProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const isActive = id === activeId;
  const hasChild = Array.isArray(children) && !!children.length;

  return (
    <div>
      <SideBoxBranch
        className={classnames("d-flex align-items-center", {
          active: isActive
        })}
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
          className={classnames("side-box__item__title", { active: isActive })}
          to={
            activeMode
              ? `/risk-and-control/${id}/${activeMode}`
              : `/risk-and-control/${id}`
          }
          style={{ marginLeft: Number(level) * 10 }}
        >
          {name}
        </SideBoxBranchTitle>
      </SideBoxBranch>
      {hasChild && (
        <Collapse isOpen={isOpen}>
          {Array.isArray(children) &&
            children.map((child: BusinessBranchProps) => (
              <BusinessProcessBranch
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
