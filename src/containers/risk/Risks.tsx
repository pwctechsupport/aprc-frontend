import React from "react";
import { FaTrash } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  RisksDocument,
  useDestroyRiskMutation,
  useRisksQuery
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import Table from "../../shared/components/Table";
import Helmet from "react-helmet";
import { capitalCase } from "capital-case";
import DialogButton from "../../shared/components/DialogButton";
import BreadCrumb from "../../shared/components/BreadCrumb";

const Risks = ({ history }: RouteComponentProps) => {
  const { loading, data } = useRisksQuery({ fetchPolicy: "network-only" });

  const [destroy, destroyM] = useDestroyRiskMutation({
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
      <BreadCrumb crumbs={[["/risk", "Risks"]]} />
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h4>Risks</h4>
        <Link to="/risk/create">
          <Button className="pwc">+ Add Risk</Button>
        </Link>
      </div>
      <Table reloading={loading}>
        <thead>
          <tr>
            <th>Risk ID</th>
            <th>Risk</th>
            <th>Risk Level</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {oc(data)
            .risks.collection([])
            .map(risk => {
              return (
                <tr
                  key={risk.id}
                  onClick={() => history.push(`/risk/${risk.id}`)}
                >
                  <td>{risk.id}</td>
                  <td>{oc(risk).name("")}</td>
                  <td>{capitalCase(oc(risk).levelOfRisk(""))}</td>
                  <td className="action">
                    <DialogButton
                      onConfirm={() => handleDelete(risk.id)}
                      loading={destroyM.loading}
                      message={`Delete risk "${risk.name}"?`}
                    >
                      <FaTrash className="clickable text-red" />
                    </DialogButton>
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
