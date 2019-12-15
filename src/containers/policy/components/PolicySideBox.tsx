import React, { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { Collapse, Input } from "reactstrap";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import { usePolicyTreeQuery } from "../../../generated/graphql";
import classnames from "classnames";

const PolicySideBox = ({ location }: RouteComponentProps) => {
  const activeId = readCurrentParams(location.pathname);
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 700);
  return (
    <aside>
      <div className="side-box">
        <div className="side-box__searchbar mb-3">
          <Input
            value={search}
            placeholder="Search Policies..."
            onChange={e => setSearch(e.target.value)}
            className="dark"
          />
        </div>
        <div>
          <PolicyTree search={searchQuery} activeId={activeId} />
        </div>
      </div>
    </aside>
  );
};

export default PolicySideBox;

const PolicyTree = ({ activeId, search }: any) => {
  const { data } = usePolicyTreeQuery({
    variables: {
      filter: { ancestry_null: true, title_cont: search }
    }
  });
  const policies = oc(data).policies.collection([]);

  return (
    <div>
      {policies.map(policy => (
        <PolicyBranch
          key={policy.id}
          id={policy.id}
          activeId={activeId}
          title={policy.title}
          children={policy.children}
          level={0}
        />
      ))}
    </div>
  );
};

const PolicyBranch = ({
  id,
  activeId,
  title,
  children = [],
  level
}: PolicyBranchProps) => {
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
          to={`/policy/${id}`}
          style={{ marginLeft: Number(level) * 10 }}
        >
          {title}
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
            children.map((child: PolicyBranchProps) => (
              <PolicyBranch
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

const readCurrentParams = (pathname: string) => {
  const hasParam = pathname.includes("policy/");
  if (hasParam) return pathname.split("policy/")[1];
  return "";
};

interface PolicyBranchProps {
  id: string | number;
  activeId?: string | number | undefined;
  title?: string | null | undefined;
  children?: Array<PolicyBranchProps> | null | undefined;
  level?: number;
}
