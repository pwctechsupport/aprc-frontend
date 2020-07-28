import React from "react";
import { PWCLink } from "./PoliciesTable";
const PoliciesList = (data: any) => {
  const newData = data?.data?.navigatorBusinessProcesses?.collection || [];
  const policies =
    newData
      .map((a: any) =>
        a.policies.map((b: any) => {
          return { id: b.id, title: b.title };
        })
      )
      .flat(10) || [];
  return (
    <>
      {policies.length ? (
        <ul>
          {policies.map((a: any) => (
            <li key={a.id}>
              <div className="mb-3 d-flex justify-content-between">
                <h6>
                  <PWCLink to={`/policy/${a.id}`}>{a.title}</PWCLink>
                </h6>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
};
export default PoliciesList;
