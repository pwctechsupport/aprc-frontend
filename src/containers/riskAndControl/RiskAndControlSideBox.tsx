import classnames from "classnames";
import React, { useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { Collapse } from "reactstrap";
import styled, { css } from "styled-components";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import { useBusinessProcessTreeQuery } from "../../generated/graphql";
import { SideBoxSearch } from "../../shared/components/SideBox";

const RiskAndControlSideBox = ({ location }: RouteComponentProps) => {
  const id = oc(location)
    .pathname("")
    .split("risk-and-control/")[1];
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 700);

  const { data, loading } = useBusinessProcessTreeQuery({
    variables: {
      filter: { ...(!search && { ancestry_null: true }), name_cont: search },
      isTree: !search
    }
  });

  const businessProcesses = oc(data).businessProcesses.collection([]);

  // if (businessProcesses.length === 0) {
  //   return <div className="text-center p-2">Business Process not found</div>;
  // }
  return (
    <div className="side-box">
      <div className="d-flex justify-content-between mx-3 mt-4 mb-3">
        <h4 className="text-orange">{"Risk & Control"}</h4>
      </div>

      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        loading={loading}
        placeholder="Search Risk & Control..."
      />

      <div className="pb-3">
        <div>
          {businessProcesses.map(businessProcess => {
            return (
              <BusinessProcessBranch
                key={businessProcess.id}
                id={businessProcess.id}
                activeId={id}
                name={businessProcess.name}
                children={businessProcess.children}
                level={0}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RiskAndControlSideBox;

const BusinessProcessBranch = ({
  id,
  activeId,
  name,
  children = [],
  level
}: BusinessBranchProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  // const Icon = isOpen ? FaChevronDown : FaChevronRight;
  const isActive = id === activeId;
  const hasChild = Array.isArray(children) && !!children.length;

  return (
    <div>
      <div
        className={classnames("d-flex align-items-center side-box__item", {
          active: isActive
        })}
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
          to={`/risk-and-control/${id}`}
          style={{ marginLeft: Number(level) * 10 }}
        >
          {name}
        </Link>
      </div>
      {hasChild && (
        <Collapse isOpen={isOpen}>
          {Array.isArray(children) &&
            children.map((child: BusinessBranchProps) => (
              <BusinessProcessBranch
                key={child.id}
                {...child}
                activeId={activeId}
                level={Number(level) + 1}
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

interface BusinessBranchProps {
  id: string | number;
  activeId?: string | number | undefined;
  name?: string | null | undefined;
  children?: Array<BusinessBranchProps> | null | undefined;
  level?: number;
}
