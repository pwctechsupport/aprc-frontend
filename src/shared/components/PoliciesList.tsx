import React from "react";
import { PWCLink } from "./PoliciesTable";
import EmptyAttribute from "./EmptyAttribute";
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
                <PWCLink style={{ fontSize: "14px" }} to={`/policy/${a.id}`}>
                  {a.title}
                </PWCLink>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyAttribute />
      )}
    </>
  );
};
export default PoliciesList;
