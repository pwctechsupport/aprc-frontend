import startCase from "lodash/startCase";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { RouteComponentProps } from "react-router-dom";
import { useDebounce } from "use-debounce/lib";
import {
  BusinessProcess,
  Risk,
  useBusinessProcessTreeQuery,
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Pagination from "../../shared/components/Pagination";
import SearchBar from "../../shared/components/SearchBar";
import Table from "../../shared/components/Table";
import useListState from "../../shared/hooks/useList";

const RiskAndControls = ({ history }: RouteComponentProps) => {
  const { limit, handlePageChange, page } = useListState({ limit: 10 });
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 400);
  const isTree = !searchQuery;
  const { data, loading } = useBusinessProcessTreeQuery({
    variables: {
      filter: {
        name_cont: searchQuery,
        ...(isTree && { ancestry_null: true }),
      },
      limit,
      page,
      isTree,
    },
  });
  const bps = data?.navigatorBusinessProcesses?.collection || [];
  const totalCount = data?.navigatorBusinessProcesses?.metadata.totalCount || 0;

  return (
    <div>
      <Helmet>
        <title>Risk and Controls - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb crumbs={[["/risk-and-control", "Risk and Controls"]]} />
      <div className="d-flex justify-content-end align-items-center"></div>
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder="Search Business Processes"
        loading={loading}
      />
      <Table reloading={loading}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Risks</th>
          </tr>
        </thead>
        <tbody>
          {bps.length ? (
            bps.map((bp) => {
              return (
                <RiskAndControlTableRow
                  key={bp.id}
                  businessProcess={bp}
                  onClick={(id) => history.push(`/risk-and-control/${id}`)}
                />
              );
            })
          ) : (
            <tr>
              <td className="empty" colSpan={4}>
                No item{search ? ` for search "${search}"` : ""}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination
        totalCount={totalCount}
        perPage={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default RiskAndControls;

const RiskAndControlTableRow = ({
  businessProcess,
  onClick,
  level = 0,
}: RiskAndControlTableRowProps) => {
  const childs = businessProcess?.children || [];
  return (
    <>
      <tr key={businessProcess.id} onClick={() => onClick(businessProcess.id)}>
        <td>
          {level ? <span style={{ marginLeft: level * 20 }} /> : null}
          {businessProcess.name}
        </td>
        <td>
          {businessProcess?.risks
            ?.map(({ name }) => startCase(name || ""))
            .join(", ")}
        </td>
      </tr>
      {childs.length
        ? childs.map((childBp) => (
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
  risks: Array<MyRisk> | null;
}
