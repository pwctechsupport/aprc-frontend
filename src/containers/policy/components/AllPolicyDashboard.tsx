import React from "react";
import { usePolicyDashboardQuery } from "../../../generated/graphql";
import { oc } from "ts-optchain";
import PolicyDashboard from "./PolicyDashboard";
import Helmet from "react-helmet";

const AllPolicyDashboard = () => {
  const { data, loading } = usePolicyDashboardQuery();
  if (loading) return null;

  //draft
  const draftPolicies = oc(data).draftPolicies.metadata.totalCount(0);
  const draftRisks = oc(data).draftRisks.metadata.totalCount(0);
  const draftControls = oc(data).draftControls.metadata.totalCount(0);
  //released
  const releasedPolicies = oc(data).releasedPolicies.metadata.totalCount(0);
  const releasedRisks = oc(data).releasedRisks.metadata.totalCount(0);
  const releasedControls = oc(data).releasedControls.metadata.totalCount(0);

  return (
    <div>
      <Helmet>
        <title>All Policy Dashboard - PricewaterhouseCoopers</title>
      </Helmet>
      <h2 className="mb-5">All Policy Summary</h2>
      <PolicyDashboard
        data={[
          {
            label: "Policies",
            total: draftPolicies + releasedPolicies,
            reviewed: releasedPolicies
          },
          {
            label: "Risks",
            total: draftRisks + releasedRisks,
            reviewed: releasedRisks
          },
          {
            label: "Controls",
            total: draftControls + releasedControls,
            reviewed: releasedControls
          }
        ]}
      />
    </div>
  );
};

export default AllPolicyDashboard;
