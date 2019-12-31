import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { RouteComponentProps } from "react-router-dom";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import { useBusinessProcessesQuery } from "../../generated/graphql";
import SearchBar from "../../shared/components/SearchBar";
import { ActionTd, EmptyTd, Tr } from "../../shared/components/Table";

const RiskAndControls = ({ history }: RouteComponentProps) => {
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 400);
  const { data } = useBusinessProcessesQuery({
    variables: {
      filter: {
        name_cont: searchQuery
      }
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
                <Tr
                  key={bp.id}
                  onClick={() => history.push(`/risk-and-control/${bp.id}`)}
                >
                  <td>{bp.name}</td>
                  <td>
                    {oc(bp)
                      .risks([])
                      .map(({ name }) => capitalCase(name))
                      .join(", ")}
                  </td>
                  <ActionTd></ActionTd>
                </Tr>
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
