import React, { useState } from "react";
import { FaChevronDown, FaChevronRight, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Collapse, Input } from "reactstrap";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce";
import {
  PoliciesDocument,
  useDestroyPolicyMutation,
  usePoliciesQuery,
  usePolicyTreeQuery
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import Table from "../../shared/components/Table";

const PolicyTree = () => {
  const { error, loading, data } = usePolicyTreeQuery();
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
  const [isOpen, setIsOpen] = useState(false);
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

const Policies = () => {
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 700);
  const { loading, data } = usePoliciesQuery({
    variables: { filter: { title_cont: searchQuery } }
  });

  const [destroy] = useDestroyPolicyMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: [
      {
        query: PoliciesDocument,
        variables: { filter: { title_cont: searchQuery } }
      }
    ]
  });

  function handleDelete(id: string) {
    destroy({ variables: { id } });
  }

  return (
    <div className="d-flex">
      <aside>
        <div className="policy-side-box">
          <Input
            placeholder="Search Policies..."
            onChange={e => setSearch(e.target.value)}
            className="dark mb-3"
          />
          <div>
            <PolicyTree />
          </div>
        </div>
      </aside>
      <div className="ml-3 w-100">
        <div className="d-flex justify-content-between align-items-center">
          <h1>Policies</h1>
          <Link to="/policy/create">
            <Button className="pwc">+ Add Policy</Button>
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
              <th></th>
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
                    <td>{oc(policy).policyCategory.name("")}</td>
                    <td>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: policy.description ? policy.description : ""
                        }}
                      ></div>
                    </td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                      <FaTrash
                        onClick={() => handleDelete(policy.id)}
                        className="clickable"
                      />
                    </td>
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
