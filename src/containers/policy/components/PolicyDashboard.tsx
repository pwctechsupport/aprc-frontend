import React, { Fragment } from "react";
import { Table } from "reactstrap";
import { oc } from "ts-optchain";
import PolicyChart, { PolicyChartProps } from "./PolicyChart";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import styled from "styled-components";
import Tooltip from "../../../shared/components/Tooltip";

const PolicyDashboard = ({ data }: PolicyChartProps) => {
  const [isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdminReviewer || isAdminPreparer);
  const subPolicy = data.find((item) => item.label.match(/polic/gi));
  const control = data.find((item) => item.label.match(/control/gi));
  const risk = data.find((item) => item.label.match(/risk/gi));
  const tableData = isUser
    ? [
        {
          label: "Total",
          subPolicy: oc(subPolicy).total(0),
          control: oc(control).total(0),
          risk: oc(risk).total(0),
          sum() {
            return this.subPolicy + this.control + this.risk;
          },
        },
      ]
    : [
        {
          label: "Reviewed",
          subPolicy: oc(subPolicy).reviewed(0) + oc(subPolicy).addToReviewed(0),
          control: oc(control).reviewed(0),
          risk: oc(risk).reviewed(0),
          sum() {
            return this.subPolicy + this.control + this.risk;
          },
        },
        {
          label: "Prepared",
          subPolicy: oc(subPolicy).prepared(0) + oc(subPolicy).addToPrepare(0),
          control: oc(control).prepared(0) + oc(control).addToPrepare(0),
          risk: oc(risk).prepared(0) + oc(risk).addToPrepare(0),
          sum() {
            return this.subPolicy + this.control + this.risk;
          },
        },
        {
          label: <strong>Total</strong>,
          subPolicy: oc(subPolicy).total(0),
          control: oc(control).total(0),
          risk: oc(risk).total(0),
          sum() {
            return this.subPolicy + this.control + this.risk;
          },
        },
      ];
  return (
    <div>
      <PolicyChart data={data} />
      <TableTitle>Task Manager</TableTitle>
      <Table className="mt-2" responsive>
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
    </div>
  );
};

export default PolicyDashboard;

const TableTitle = styled.h6`
  font-weight: bold;
  margin-top: 50px;
`
