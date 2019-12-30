import classnames from "classnames";
import React, { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { Collapse, Input } from "reactstrap";
import styled, { css } from "styled-components";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import { usePolicyTreeQuery } from "../../../generated/graphql";
import Button from "../../../shared/components/Button";

const PolicySideBox = ({ location }: RouteComponentProps) => {
  const activeId = readCurrentParams(location.pathname);
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 700);
  return (
    <aside>
      <div className="side-box">
        <div className="side-box__searchbar mb-2">
          <div className="mx-3 mb-3 mt-2">
            {location.pathname.includes("/policy/dashboard") ? (
              <Link to="/policy">
                <Button className="pwc" block>
                  View All Policies
                </Button>
              </Link>
            ) : (
              <Link to="/policy/dashboard">
                <Button className="pwc" block>
                  View Dashboard Policies
                </Button>
              </Link>
            )}
          </div>
          <Input
            value={search}
            placeholder="Search Policies..."
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
          <PolicyTree search={searchQuery} activeId={activeId} />
        </div>
      </div>
    </aside>
  );
};

export default PolicySideBox;

const PolicyTree = ({ activeId, search }: PolicyTreeProps) => {
  // This query is unique, if isTree = true, it captures only the root policy and it's sub, to be rendered as tree.
  // When isTree = false, it just query all the policies, to be rendered as search result.
  const { data } = usePolicyTreeQuery({
    variables: {
      filter: { ...(!search && { ancestry_null: true }), title_cont: search },
      isTree: !search
    }
  });
  const policies = oc(data).policies.collection([]);

  if (policies.length === 0) {
    return <div className="text-center p-2">Policy not found</div>;
  }

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
            <Icon open={isOpen} />
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

const Icon = styled(FaChevronRight)<{ open: boolean }>`
  transition: 0.15s ease-in-out;
  ${(p: { open: boolean }) =>
    p.open &&
    css`
      transform: rotate(90deg);
    `};
`;

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

interface PolicyTreeProps {
  activeId: string | number | undefined;
  search: string | null | undefined;
}
