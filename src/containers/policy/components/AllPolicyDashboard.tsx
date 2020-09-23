import React from "react";
import Helmet from "react-helmet";
import { Table } from "reactstrap";
import { oc } from "ts-optchain";
import { usePolicyDashboardQuery } from "../../../generated/graphql";
import PolicyChart from "./PolicyChart";
import useAccessRights from "../../../shared/hooks/useAccessRights";

const AllPolicyDashboard = () => {
  const { data, loading } = usePolicyDashboardQuery();

  const [isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdminReviewer || isAdminPreparer);
  if (loading) return null;
  // reviewed:
  const reviewedPolicies = oc(data).reviewedPolicies.metadata.totalCount(0);
  const reviewedRisks = oc(data).reviewedRisks.metadata.totalCount(0);
  const reviewedControls = oc(data).reviewedControls.metadata.totalCount(0);
  // prepared:
  const preparedPolicies = oc(data).preparedPolicies.metadata.totalCount(0);
  const preparedRisks = oc(data).preparedRisks.metadata.totalCount(0);
  const preparedControls = oc(data).preparedControls.metadata.totalCount(0);
  // total:
  const totalPolicies = oc(data).totalPolicies.metadata.totalCount(0);
  const totalRisks = oc(data).totalRisks.metadata.totalCount(0);
  const totalControls = oc(data).totalControls.metadata.totalCount(0);
  const chartData = [
    {
      label: "Policies",
      total: totalPolicies,
      reviewed: reviewedPolicies,
      prepared: preparedPolicies,
    },
    {
      label: "Risks",
      total: totalRisks,
      reviewed: reviewedRisks,
      prepared: preparedRisks,
    },
    {
      label: "Controls",
      total: totalControls,
      reviewed: reviewedControls,
      prepared: preparedControls,
    },
  ];

  const tableData = isUser
    ? [
        {
          label: "Total",
          subPolicy: totalPolicies,
          risk: totalRisks,
          control: totalControls,
          sum() {
            return this.subPolicy + this.risk + this.control;
          },
        },
      ]
    : [
        {
          label: "Reviewed",
          subPolicy: reviewedPolicies,
          risk: reviewedRisks,
          control: reviewedControls,
          sum() {
            return this.subPolicy + this.risk + this.control;
          },
        },
        {
          label: "Prepared",
          subPolicy: preparedPolicies,
          risk: preparedRisks,
          control: preparedControls,
          sum() {
            return this.subPolicy + this.risk + this.control;
          },
        },
        {
          label: "Total",
          subPolicy: totalPolicies,
          risk: totalRisks,
          control: totalControls,
          sum() {
            return this.subPolicy + this.risk + this.control;
          },
        },
      ];

  return (
    <div>
      <Helmet>
        <title>All Policy Dashboard - PricewaterhouseCoopers</title>
      </Helmet>
      <h2 className="mb-5">All Policy Summary</h2>
      <PolicyChart data={chartData} policies />
      <Table responsive className="mt-5">
        <thead>
          <tr>
            <th>Task Manager</th>
            <th>Policies</th>
            <th>Risks</th>
            <th>Controls</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((item, index) => {
            return (
              <tr key={index}>
                <td>{item.label}</td>
                <td>{item.subPolicy}</td>
                <td>{item.risk}</td>
                <td>{item.control}</td>
                <td>{item.sum()}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default AllPolicyDashboard;
