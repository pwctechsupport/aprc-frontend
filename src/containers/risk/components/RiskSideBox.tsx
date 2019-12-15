import React from "react";
import { Link } from "react-router-dom";
import { Table } from "reactstrap";
import { oc } from "ts-optchain";
import { useRisksQuery } from "../../../generated/graphql";

const RiskSideBox = () => {
  const { data } = useRisksQuery({
    variables: { filter: {}, limit: 5 }
  });

  return (
    <aside>
      <div className="policy-side-box">
        <h4>Recently Added</h4>
        <Table>
          <thead>
            <tr>
              <th>Risk</th>
              <th>Added Date</th>
            </tr>
          </thead>
          <tbody>
            {oc(data)
              .risks.collection([])
              .map(risk => {
                return (
                  <tr key={risk.id}>
                    <td>
                      <Link to={`/risk/${risk.id}`}>{oc(risk).name("")}</Link>
                    </td>
                    <td>24 August 2019</td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </div>
    </aside>
  );
};

export default RiskSideBox;
