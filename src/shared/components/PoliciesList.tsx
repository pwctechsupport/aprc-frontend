import React from "react";
import { PWCLink } from "./PoliciesTable";
import EmptyAttribute from "./EmptyAttribute";
const PoliciesList = (data: any) => {
  const newData = data?.data?.navigatorBusinessProcesses?.collection || [];
  const dataModifier = (a: any) => {
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i].id === a[j].id) a.splice(j--, 1);
      }
    }
    return a;
  };
  const policies = dataModifier(
    newData
      .map((a: any) =>
        a.policies.map((b: any) => {
          return { id: b.id, title: b.title };
        })
      )
      .flat(10) || []
  );
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
