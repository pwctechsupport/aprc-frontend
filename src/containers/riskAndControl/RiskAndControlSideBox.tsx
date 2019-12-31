import React, { useState } from "react";
import { useBusinessProcessesQuery, useBusinessProcessTreeQuery } from "../../generated/graphql";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import classnames from "classnames";
import { Link, RouteComponentProps } from "react-router-dom";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Collapse, Input } from "reactstrap";

const RiskAndControlSideBox = ({location}: RouteComponentProps) => {
  const id = oc(location).pathname('').split('risk-and-control/')[1]
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 700);

  return (
    <aside>
      <div className="side-box">
        <h4 className="pt-2 px-2">Business Processes</h4>
        <div className="side-box__searchbar mb-2">
          <Input
            value={search}
            placeholder="Search Business Process..."
            onChange={e => setSearch(e.target.value)}
            className="dark"
          />
        </div>
        {searchQuery && (
          <div
            className="clickable mx-3 text-right text-small text-italic"
            onClick={() => setSearch("")}
          >
            Clear Search
          </div>
        )}
        <div className="pb-3">
          <BusinessProcessTree activeId={id} search={searchQuery} />
        </div>
      </div>
    </aside>
  );
};

export default RiskAndControlSideBox;

const BusinessProcessTree = ({activeId, search}: BusinessProcessTreeProps) => {
  const { data } = useBusinessProcessTreeQuery({
    variables: {
      filter: { ...(!search && { ancestry_null: true }), name_cont: search },
      isTree: !search
    }
  })

  const businessProcesses = oc(data).businessProcesses.collection([])

  if (businessProcesses.length === 0) {
    return <div className="text-center p-2">Business Process not found</div>
  }

  return (
    <div>
      {businessProcesses.map(businessProcess => {
        return (
          <BusinessProcessBranch
            key={businessProcess.id}
            id={businessProcess.id}
            activeId={activeId}
            name={businessProcess.name}
            children={businessProcess.children}
            level={0}
          />
        )
      })}
    </div>
  )
}

const BusinessProcessBranch = ({
  id,
  activeId,
  name,
  children = [],
  level
}: BusinessBranchProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const Icon = isOpen ? FaChevronDown : FaChevronRight;
  const isActive = id === activeId;
  const hasChild = Array.isArray(children) && !!children.length;

  return (
    <div>
      <div
        className={classnames(
          "d-flex justify-content-between align-items-center side-box__item",
          { active: isActive }
        )}
      >
        <Link
          className={classnames("side-box__item__title")}
          to={`/risk-and-control/${id}`}
          style={{ marginLeft: Number(level) * 10 }}
        >
          {name}
        </Link>
        {hasChild && (
          <div className="side-box__item__icon clickable" onClick={toggle}>
            <Icon />
          </div>
        )}
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

interface BusinessProcessTreeProps  {
  activeId: string | number | undefined;
  search: string | null | undefined;
}

interface BusinessBranchProps {
  id: string | number;
  activeId?: string | number | undefined;
  name?: string | null | undefined;
  children?: Array<BusinessBranchProps> | null | undefined;
  level?: number;
}