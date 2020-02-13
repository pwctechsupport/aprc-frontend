import React, { useState } from "react";
import { oc } from "ts-optchain";
import { useRisksQuery } from "../../../generated/graphql";
import {
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
  SideBox
} from "../../../shared/components/SideBox";
import humanizeDate from "../../../shared/utils/humanizeDate";

const RiskSideBox = () => {
  const [search, setSearch] = useState("");
  const { data, loading } = useRisksQuery({
    fetchPolicy: "network-only",
    variables: { filter: { name_cont: search } }
  });

  const risks = oc(data)
    .risks.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <SideBox>
      <SideBoxTitle>Recently Updated</SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search Risk..."
        loading={loading}
      />
      {risks.map(risk => {
        return (
          <SideBoxItem
            key={risk.id}
            to={`/risk/${risk.id}`}
            activeClassName="active"
          >
            <SideBoxItemText flex={2} bold>
              {oc(risk).name("")}
            </SideBoxItemText>
            <SideBoxItemText flex={1} right>
              {humanizeDate(oc(risk).updatedAt(""))}
            </SideBoxItemText>
          </SideBoxItem>
        );
      })}
    </SideBox>
  );
};

export default RiskSideBox;
