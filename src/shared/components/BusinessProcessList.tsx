import React, { useEffect } from "react";
import {
  PolicyQuery,
  usePoliciesQuery,
  usePreparerPoliciesQuery,
  useBusinessProcessesQuery,
} from "../../generated/graphql";
import { oc } from "ts-optchain";
import useAccessRights from "../hooks/useAccessRights";
import { PWCLink } from "./PoliciesTable";
import EmptyAttribute from "./EmptyAttribute";

interface props {
  dataPolicy?: PolicyQuery;
}
const BusinessProcessList = ({ dataPolicy }: props) => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminPreparer || isAdminReviewer);

  const coolFilteringFunction = (a: any) => {
    const requestStatus = a.requestStatus;
    const notRequested = !requestStatus;
    const rejected = requestStatus === "rejected";
    if (isUser && !a.draft && (notRequested || rejected)) {
      return a.id;
    } else if (isAdminReviewer && !a.draft) {
      return a.id;
    } else if (isAdminPreparer) {
      return a.id;
    } else {
      return [];
    }
  };

  const policyIdWithoutChildren = oc(dataPolicy).policy.id("");
  const policyIdFirstChild =
    dataPolicy?.policy?.children?.map((a) => coolFilteringFunction(a)) || [];
  const policyIdSecondChild =
    dataPolicy?.policy?.children?.map((a: any) =>
      a.children.map((b: any) => coolFilteringFunction(b))
    ) || [];
  const policyIdThirdChild =
    dataPolicy?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) =>
        b.children.map((c: any) => coolFilteringFunction(c))
      )
    ) || [];
  const policyIdFourthChild =
    dataPolicy?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) =>
        b.children?.map((c: any) =>
          c.children.map((d: any) => coolFilteringFunction(d))
        )
      )
    ) || [];
  const policyIdFifthChild =
    dataPolicy?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) =>
        b.children?.map((c: any) =>
          c.children.map((d: any) =>
            d.children.map((e: any) => coolFilteringFunction(e))
          )
        )
      )
    ) || [];
  const policyIds = [
    policyIdWithoutChildren,
    ...policyIdFirstChild.flat(10),
    ...policyIdSecondChild.flat(10),
    ...policyIdThirdChild.flat(10),
    ...policyIdFourthChild.flat(10),
    ...policyIdFifthChild.flat(10),
  ];

  const { data, loading } = useBusinessProcessesQuery({
    variables: {
      filter: {
        policies_id_matches_any: policyIds,
      },
    },
  });
  const getBps = oc(data).navigatorBusinessProcesses.collection([]);

  return (
    <ul>
      {getBps.length ? (
        getBps.map((bp) => (
          <li key={bp.id}>
            <div className="mb-3 d-flex justify-content-between">
              <h6>
                <PWCLink to={`/risk-and-control/${bp.id}`}>{bp.name}</PWCLink>
              </h6>
            </div>
          </li>
        ))
      ) : (
        <EmptyAttribute />
      )}
    </ul>
  );
};
export default BusinessProcessList;
