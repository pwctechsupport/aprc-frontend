import React, { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Collapse, Input } from "reactstrap";
import { oc } from "ts-optchain";
import { usePolicyTreeQuery } from "../../../generated/graphql";
import { useDebounce } from "use-debounce/lib";

const PolicySideBox = () => {
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 700);
  return (
    <aside>
      <div className="policy-side-box">
        <Input
          value={search}
          placeholder="Search Policies..."
          onChange={e => setSearch(e.target.value)}
          className="dark mb-3"
        />
        <div>
          <PolicyTree search={searchQuery} />
        </div>
      </div>
    </aside>
  );
};

export default PolicySideBox;

const PolicyTree = ({ search }: any) => {
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
          title={policy.title}
          children={policy.children}
        />
      ))}
    </div>
  );
};

const PolicyBranch = ({ id, title, children }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const Icon = isOpen ? FaChevronDown : FaChevronRight;

  if (children && children.length) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center ">
          <Link className="side-box__item" to={`/policy/${id}`}>
            {title}
          </Link>
          <Icon onClick={toggle} className="clickable" />
        </div>
        <Collapse isOpen={isOpen}>
          <div className="ml-3">
            {children.map((child: any) => (
              <PolicyBranch key={child.id} {...child} />
            ))}
          </div>
        </Collapse>
      </div>
    );
  }
  return (
    <div>
      <Link className="side-box__item" to={`/policy/${id}`}>
        {title}
      </Link>
    </div>
  );
};
