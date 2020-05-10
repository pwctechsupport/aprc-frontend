import React from "react";
import { Table } from "reactstrap";
import { oc } from "ts-optchain";
import PolicyChart, { PolicyChartProps } from "./PolicyChart";

const PolicyDashboard = ({ data }: PolicyChartProps) => {
  const subPolicy = data.find((item) => item.label.match(/polic/gi));
  const control = data.find((item) => item.label.match(/control/gi));
  const risk = data.find((item) => item.label.match(/risk/gi));
  const tableData = [
    {
      label: "Reviewed",
      subPolicy: oc(subPolicy).reviewed(0),
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
      label: "Total",
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
      <Table className="mt-5" responsive>
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

export default PolicyDashboard;
