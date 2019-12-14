import React, { useState } from "react";
import { useRisksQuery } from "../../../generated/graphql";
import { Table } from "reactstrap";
import { oc } from "ts-optchain";
import { Link } from "react-router-dom";

const RiskSideBox = () => {
  const {loading, data} = useRisksQuery({
    variables: { filter: {}, limit: 5 }
  })

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
