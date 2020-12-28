import React from "react";
import { PWCLink } from "./PoliciesTable";
import EmptyAttribute from "./EmptyAttribute";
import useAccessRights from "../hooks/useAccessRights";
const PoliciesList = (data: any) => {
  const [isUser] = useAccessRights([
    "user"
  ]);
  const statusPolicy = ['waiting_for_approval', 'release', 'ready_for_edit']
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
    (isUser ? newData.map((a: any) => a.policies.filter((b: any) => statusPolicy.includes(b.status))).flat(10) || [] : newData.map((a: any) => a.policies).flat(10) || [])
    .map((c: any) => {
      return { id: c.id, title: c.title};
    })
  )
  return (
    <>
      {policies.length ? (
        <ul>
          {policies.map((a: any) => (
            <li key={a.id}>
              <div className="mb-3 d-flex justify-content-between">
                <PWCLink style={{ fontSize: "16px" }} to={`/policy/${a.id}`}>
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
