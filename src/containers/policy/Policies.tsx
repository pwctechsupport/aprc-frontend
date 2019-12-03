import React, { useState } from "react";
import { Link } from "react-router-dom";
import { oc } from "ts-optchain";
import { usePoliciesQuery } from "../../generated/graphql";
import Table from "../../shared/components/Table";
import Button from "../../shared/components/Button";
import { useDebounce } from "use-debounce";
import { Input, Collapse } from "reactstrap";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";

const dummy = {
  title: "Policy 1",
  children: [
    {
      title: "Policy 1.1",
      children: [
        {
          title: "Policy 1.1.1",
          children: []
        }
      ]
    },
    {
      title: "Policy 1.2",
      children: []
    },
    {
      title: "Policy 1.3",
      children: []
    }
  ]
};

const PoliciyTree = ({ title, children }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const Icon = isOpen ? FaChevronDown : FaChevronRight;

  if (children && children.length) {
    return (
      <div>
        <div
          onClick={toggle}
          className="d-flex justify-content-between align-items-center"
        >
          {title}
          <Icon />
        </div>
        <Collapse isOpen={isOpen}>
          <div className="ml-3">
            {children.map((child: any) => (
              <PoliciyTree key={child.title} {...child} />
            ))}
          </div>
        </Collapse>
      </div>
    );
  }
  return <div>{title}</div>;
};

const Policies = () => {
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 300);
  const { loading, data } = usePoliciesQuery({
    variables: { filter: { title_cont: searchQuery } }
  });

  return (
    <div className="d-flex">
      <aside className="mr-3">
        <div className="policy-side-box">
          <Input
            placeholder="Search..."
            onChange={e => setSearch(e.target.value)}
          />
          <div>
            <PoliciyTree {...dummy} />
          </div>
        </div>
      </aside>
      <div>
        <div className="d-flex justify-content-between align-items-center">
          <h1>Policies</h1>
          <Link to="/policy/create">
            <Button>+ Add Policy</Button>
          </Link>
        </div>
        <Table reloading={loading}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Description</th>
              <th>Version</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {oc(data)
              .policies.collection([])
              .map(policy => {
                return (
                  <tr key={policy.id}>
                    <td>
                      <Link to={`/policy/${policy.id}`}>{policy.title}</Link>
                    </td>
                    <td>{policy.policyCategoryId}</td>
                    <td>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: policy.description ? policy.description : ""
                        }}
                      ></div>
                    </td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Policies;
