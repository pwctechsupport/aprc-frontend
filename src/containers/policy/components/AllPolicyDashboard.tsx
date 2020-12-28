import React, { Fragment } from "react";
import Helmet from "react-helmet";
import { Table } from "reactstrap";
import { oc } from "ts-optchain";
import { usePolicyDashboardQuery } from "../../../generated/graphql";
import PolicyChart from "./PolicyChart";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import styled from "styled-components";
import Tooltip from "../../../shared/components/Tooltip";

const AllPolicyDashboard = () => {
  const { data, loading } = usePolicyDashboardQuery();

  const [isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdminReviewer || isAdminPreparer);
  if (loading) return null;
  // reviewed:
  // const reviewedPolicies = oc(data).reviewedPolicies.metadata.totalCount(0);
  const reviewedRisks = oc(data).reviewedRisks.metadata.totalCount(0);
  const reviewedControls = oc(data).reviewedControls.metadata.totalCount(0);
  // prepared:
  // const preparedPolicies = oc(data).preparedPolicies.metadata.totalCount(0);
  const preparedRisks = oc(data).preparedRisks.metadata.totalCount(0);
  const preparedControls = oc(data).preparedControls.metadata.totalCount(0);
  // total:
  // const totalPolicies = oc(data).totalPolicies.metadata.totalCount(0);
  const totalRisks = oc(data).totalRisks.metadata.totalCount(0);
  const totalControls = oc(data).totalControls.metadata.totalCount(0);
  // Admin Preparer
  const totalAdminPreparerPolicies = oc(data).adminPreparerTotalPolicies.metadata.totalCount(0);
  const preparedAdminPreparerPolicies = oc(data).adminPreparerPreparedPolicies.metadata.totalCount(0);
  const reviewedAdminPreparerPolicies = oc(data).adminPreparerReviewedPolicies.metadata.totalCount(0);
  // Admin Reviewer
  const totalAdminReviewerPolicies = oc(data).adminReviewerTotalPolicies.metadata.totalCount(0);
  const preparedAdminReviewerPolicies = oc(data).adminReviewerPreparedPolicies.metadata.totalCount(0);
  const reviewedAdminReviewerPolicies = oc(data).adminReviewerReviewedPolicies.metadata.totalCount(0);
  // User
  const totalUserPolicies = oc(data).userTotalPolicies.metadata.totalCount(0);

  const chartData = [
    {
      label: "Policies",
      // total: totalPolicies,
      total: (isAdminPreparer ? totalAdminPreparerPolicies : isAdminReviewer ? totalAdminReviewerPolicies : totalUserPolicies),
      reviewed: (isAdminPreparer ? reviewedAdminPreparerPolicies : isAdminReviewer ? reviewedAdminReviewerPolicies : 0),
      prepared: (isAdminPreparer ? preparedAdminPreparerPolicies : isAdminReviewer ? preparedAdminReviewerPolicies : 0),
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
          subPolicy: totalUserPolicies,
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
          subPolicy: (isAdminPreparer ? reviewedAdminPreparerPolicies : isAdminReviewer ? reviewedAdminReviewerPolicies : 0),
          risk: reviewedRisks,
          control: reviewedControls,
          sum() {
            return this.subPolicy + this.risk + this.control;
          },
        },
        {
          label: "Prepared",
          subPolicy: (isAdminPreparer ? preparedAdminPreparerPolicies : isAdminReviewer ? preparedAdminReviewerPolicies : 0),
          risk: preparedRisks,
          control: preparedControls,
          sum() {
            return this.subPolicy + this.risk + this.control;
          },
        },
        {
          label: <strong>Total</strong>,
          subPolicy: (isAdminPreparer ? totalAdminPreparerPolicies : isAdminReviewer ? totalAdminReviewerPolicies : totalUserPolicies),
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
      {!isUser ? (
        <Fragment>
          <TableTitle>Task Manager</TableTitle>
          <Table responsive className="mt-2">
            <thead>
              <tr>
                <th>Status</th>
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
                    {item.label === "Reviewed" ? (
                      <Tooltip description="Data with status : Waiting for Approval, Ready for Edit, and Release">
                        <td>{item.label}</td>
                      </Tooltip>
                    ) : (
                      <Fragment>
                        {item.label === "Prepared" ? (
                          <Fragment>
                            {isAdminPreparer ? (
                              <Tooltip description="Data with status : Draft and Waiting for Review">
                                <td>{item.label}</td>
                              </Tooltip>
                            ) : (
                              <Tooltip description="Data with status : Waiting for Review">
                                <td>{item.label}</td>
                              </Tooltip>
                            )}
                          </Fragment>
                        ) : (
                          <td>{item.label}</td>
                        )}
                      </Fragment>
                    )}
                    <td>{item.subPolicy}</td>
                    <td>{item.risk}</td>
                    <td>{item.control}</td>
                    <td>{item.sum()}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Fragment>
      ) : null}
    </div>
  );
};

export default AllPolicyDashboard;

const TableTitle = styled.h6`
  font-weight: bold;
  margin-top: 50px;
`
