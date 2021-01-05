import React from "react";
import {
  PolicyQuery,
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
  const [isAdmin, isAdminReviewer, isAdminPreparer, isUser] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
    "user"
  ]);

  const coolFilteringFunction = (a: any) => {
    const requestStatus = a.requestStatus;
    const notRequested = !requestStatus;
    const rejected = requestStatus === "rejected";
    const isRelease = a.status.includes("release")
    const isWaitingForApproval = a.status.includes("waiting_for_approval")
    const isReadyForEdit = a.status.includes("ready_for_edit")
    const isDraft = a.status.includes("draft")
    const isUserStatus = isRelease || isWaitingForApproval || isReadyForEdit
    if (isUser && isUserStatus && (notRequested || rejected)) {
      return a.id;
    } else if (isAdminReviewer && !isDraft) {
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

  const { data } = useBusinessProcessesQuery({
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
              <PWCLink
                className="wrapped"
                style={{ fontSize: "14px" }}
                to={`/risk-and-control/${bp.id}`}
              >
                {bp.name}
              </PWCLink>
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
