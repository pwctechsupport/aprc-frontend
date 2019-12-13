import React from "react";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  // PoliciesDocument,
  // useDestroyPolicyMutation,
  // usePoliciesQuery
  RisksDocument,
  useDestroyRiskMutation,
  useRisksQuery,
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import Table from "../../shared/components/Table";
import Helmet from "react-helmet";

const Risks = () => {
  // const [search, setSearch] = useState("");
  // const [searchQuery] = useDebounce(search, 700);
  const { loading, data } = useRisksQuery({
    variables: { filter: {} }
  });

  const [destroy] = useDestroyRiskMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: [
      {
        query: RisksDocument,
        variables: { filter: {} }
      }
    ]
  });

  function handleDelete(id: string) {
    destroy({ variables: { id } });
  }

  return (
    <div>
      <Helmet>
        <title>Risks - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Risks</h1>
        <Link to="/policy/create">
          <Button className="pwc">+ Add Risk</Button>
        </Link>
      </div>
      <Table reloading={loading}>
        <thead>
          <tr>
            <th>Risk ID</th>
            <th>Risk</th>
            <th>Risk Level</th>
            {/* <th>Business Process</th> */}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {oc(data)
            .risks.collection([])
            .map(risk => {
              return (
                <tr key={risk.id}>
                  <td>
                    <Link to={`/risk/${risk.id}`}>{risk.id}</Link>
                  </td>
                  <td>{oc(risk).name("")}</td>
                  <td>
                    {oc(risk).level("")}
                  </td>
                  <td>
                    <FaTrash
                      onClick={() => handleDelete(risk.id)}
                      className="clickable"
                    />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    </div>
  );
};

export default Risks;
