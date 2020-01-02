import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { RouteComponentProps } from "react-router-dom";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  BusinessProcess,
  useBusinessProcessTreeQuery,
  Risk
} from "../../generated/graphql";
import SearchBar from "../../shared/components/SearchBar";
import { ActionTd, EmptyTd, Tr } from "../../shared/components/Table";

const RiskAndControls = ({ history }: RouteComponentProps) => {
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 400);
  const isTree = !searchQuery;
  const { data } = useBusinessProcessTreeQuery({
    variables: {
      filter: {
        name_cont: searchQuery,
        ...(isTree && { ancestry_null: true })
      },
      isTree
    }
  });

  const handleChange = (e: any) => {
    setSearch(e.target.value);
  };

  const bps = oc(data).businessProcesses.collection([]);

  return (
    <div>
      <Helmet>
        <title>Risk and Controls - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Risk and Controls</h1>
      </div>
      <SearchBar
        value={search}
        onChange={handleChange}
        placeholder="Search Business Processes"
      />
      <table className="w-100">
        <thead>
          <tr>
            <th>Name</th>
            <th>Risks</th>
          </tr>
        </thead>
        <tbody>
          {bps.length ? (
            bps.map(bp => {
              return (
                <RiskAndControlTableRow
                  key={bp.id}
                  businessProcess={bp}
                  onClick={id => history.push(`/risk-and-control/${id}`)}
                />
              );
            })
          ) : (
            <tr>
              <EmptyTd colSpan={4}>
                No item{search ? ` for search "${search}"` : ""}
              </EmptyTd>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RiskAndControls;

const RiskAndControlTableRow = ({
  businessProcess,
  onClick,
  level = 0
}: RiskAndControlTableRowProps) => {
  const childs = oc(businessProcess).children([]);
  return (
    <>
      <Tr key={businessProcess.id} onClick={() => onClick(businessProcess.id)}>
        <td>
          {level ? <span style={{ marginLeft: level * 20 }} /> : null}
          {businessProcess.name}
        </td>
        <td>
          {oc(businessProcess)
            .risks([])
            .map(({ name }) => capitalCase(name))
            .join(", ")}
        </td>
        <ActionTd></ActionTd>
      </Tr>
      {childs.length
        ? childs.map(childBp => (
            <RiskAndControlTableRow
              key={childBp.id}
              businessProcess={childBp}
              onClick={onClick}
              level={level + 1}
            />
          ))
        : null}
    </>
  );
};

interface RiskAndControlTableRowProps {
  businessProcess: Partial<FinalBp>;
  onClick: (value: any) => void;
  level?: number;
}
type MyBp = Pick<BusinessProcess, "name" | "children" | "id">;
type MyRisk = Pick<Risk, "id" | "name">;

interface FinalBp extends MyBp {
  risks: Array<MyRisk>;
}
