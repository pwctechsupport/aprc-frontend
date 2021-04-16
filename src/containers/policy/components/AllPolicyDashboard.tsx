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
  const { data, loading } = usePolicyDashboardQuery({
    fetchPolicy: "no-cache"
  });

  const [isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdminReviewer || isAdminPreparer);
  if (loading) return null;

  // Admin Preparer
    ///Policies
  const totalAdminPreparerPolicies = oc(data).adminPreparerTotalPolicies.metadata.totalCount(0);
  const preparedAdminPreparerPolicies = oc(data).adminPreparerPreparedPolicies.metadata.totalCount(0);
  const reviewedAdminPreparerPolicies = oc(data).adminPreparerReviewedPolicies.metadata.totalCount(0);
    ///Controls
  const totalAdminPreparerControls = oc(data).adminPreparerTotalControls.metadata.totalCount(0);
  const preparedAdminPreparerControls = oc(data).adminPreparerPreparedControls.metadata.totalCount(0);
  const reviewedAdminPreparerControls = oc(data).adminPreparerReviewedControls.metadata.totalCount(0);
    ///Risks
  const totalAdminPreparerRisks = oc(data).adminPreparerTotalRisks.metadata.totalCount(0);
  const preparedAdminPreparerRisks = oc(data).adminPreparerPreparedRisks.metadata.totalCount(0);
  const reviewedAdminPreparerRisks = oc(data).adminPreparerReviewedRisks.metadata.totalCount(0);

  // Admin Reviewer
    ///Policies
  const totalAdminReviewerPolicies = oc(data).adminReviewerTotalPolicies.metadata.totalCount(0);
  const preparedAdminReviewerPolicies = oc(data).adminReviewerPreparedPolicies.metadata.totalCount(0);
  const reviewedAdminReviewerPolicies = oc(data).adminReviewerReviewedPolicies.metadata.totalCount(0);
    ///Controls
  const totalAdminReviewerControls = oc(data).adminReviewerTotalControls.metadata.totalCount(0);
  const preparedAdminReviewerControls = oc(data).adminReviewerPreparedControls.metadata.totalCount(0);
  const reviewedAdminReviewerControls = oc(data).adminReviewerReviewedControls.metadata.totalCount(0);
    ///Risks
  const totalAdminReviewerRisks = oc(data).adminReviewerTotalRisks.metadata.totalCount(0);
  const preparedAdminReviewerRisks = oc(data).adminReviewerPreparedRisks.metadata.totalCount(0);
  const reviewedAdminReviewerRisks = oc(data).adminReviewerReviewedRisks.metadata.totalCount(0);

  // User
    ///Policies
  const totalUserPolicies = oc(data).userTotalPolicies.metadata.totalCount(0);
    ///Controls
  const totalUserControls = oc(data).userTotalControls.metadata.totalCount(0);
    ///Risks
  const totalUserRisks = oc(data).userTotalRisks.metadata.totalCount(0);

  const chartData = [
    {
      label: "Policies",
      total: (isAdminPreparer ? totalAdminPreparerPolicies : isAdminReviewer ? totalAdminReviewerPolicies : totalUserPolicies),
      reviewed: (isAdminPreparer ? reviewedAdminPreparerPolicies : isAdminReviewer ? reviewedAdminReviewerPolicies : 0),
      prepared: (isAdminPreparer ? preparedAdminPreparerPolicies : isAdminReviewer ? preparedAdminReviewerPolicies : 0),
    },
    {
      label: "Risks",
      total: (isAdminPreparer ? totalAdminPreparerRisks : isAdminReviewer ? totalAdminReviewerRisks : totalUserRisks),
      reviewed: (isAdminPreparer ? reviewedAdminPreparerRisks : isAdminReviewer ? reviewedAdminReviewerRisks : 0),
      prepared: (isAdminPreparer ? preparedAdminPreparerRisks : isAdminReviewer ? preparedAdminReviewerRisks : 0),
    },
    {
      label: "Controls",
      total: (isAdminPreparer ? totalAdminPreparerControls : isAdminReviewer ? totalAdminReviewerControls : totalUserControls),
      reviewed: (isAdminPreparer ? reviewedAdminPreparerControls : isAdminReviewer ? reviewedAdminReviewerControls : 0),
      prepared: (isAdminPreparer ? preparedAdminPreparerControls : isAdminReviewer ? preparedAdminReviewerControls : 0),
    },
  ];

  const tableData = isUser
    ? [
        {
          label: "Total",
          subPolicy: totalUserPolicies,
          risk: totalUserRisks,
          control: totalUserControls,
          sum() {
            return this.subPolicy + this.risk + this.control;
          },
        },
      ]
    : [
        {
          label: "Reviewed",
          subPolicy: (isAdminPreparer ? reviewedAdminPreparerPolicies : isAdminReviewer ? reviewedAdminReviewerPolicies : 0),
          risk: (isAdminPreparer ? reviewedAdminPreparerRisks : isAdminReviewer ? reviewedAdminReviewerRisks : 0),
          control: (isAdminPreparer ? reviewedAdminPreparerControls : isAdminReviewer ? reviewedAdminReviewerControls : 0),
          sum() {
            return this.subPolicy + this.risk + this.control;
          },
        },
        {
          label: "Prepared",
          subPolicy: (isAdminPreparer ? preparedAdminPreparerPolicies : isAdminReviewer ? preparedAdminReviewerPolicies : 0),
          risk: (isAdminPreparer ? preparedAdminPreparerRisks : isAdminReviewer ? preparedAdminReviewerRisks : 0),
          control: (isAdminPreparer ? preparedAdminPreparerControls : isAdminReviewer ? preparedAdminReviewerControls : 0),
          sum() {
            return this.subPolicy + this.risk + this.control;
          },
        },
        {
          label: <strong>Total</strong>,
          subPolicy: (isAdminPreparer ? totalAdminPreparerPolicies : isAdminReviewer ? totalAdminReviewerPolicies : totalUserPolicies),
          risk: (isAdminPreparer ? totalAdminPreparerRisks : isAdminReviewer ? totalAdminReviewerRisks : totalUserRisks),
          control: (isAdminPreparer ? totalAdminPreparerControls : isAdminReviewer ? totalAdminReviewerControls : totalUserControls),
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
                    <td>
                      {item.label === "Reviewed" ? (
                        <Tooltip description="Data with status : Waiting for Approval, Ready for Edit, and Release">
                          {item.label}
                        </Tooltip>
                      ) : (
                        <Fragment>
                          {item.label === "Prepared" ? (
                            <Fragment>
                              {isAdminPreparer ? (
                                <Tooltip description="Data with status : Draft and Waiting for Review">
                                  {item.label}
                                </Tooltip>
                              ) : (
                                <Tooltip description="Data with status : Waiting for Review">
                                  {item.label}
                                </Tooltip>
                              )}
                            </Fragment>
                          ) : (
                            <Fragment>
                              {item.label}
                            </Fragment>
                          )}
                      </Fragment>
                    )}
                    </td>
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
