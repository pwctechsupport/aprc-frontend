import React, { useState } from "react";
import { oc } from "ts-optchain";
import { useControlsQuery } from "../../../generated/graphql";
import {
  SideBoxItem,
  SideBoxItemText,
  SideBoxSearch,
  SideBoxTitle,
  SideBox
} from "../../../shared/components/SideBox";
import humanizeDate from "../../../shared/utils/humanizeDate";

const ControlSideBox = () => {
  const [search, setSearch] = useState("");
  const { data, loading } = useControlsQuery({
    fetchPolicy: "network-only",
    variables: { filter: { description_cont: search } }
  });

  const controls = oc(data)
    .controls.collection([])
    .sort(
      (a, b) =>
        new Date(String(b.updatedAt)).getTime() -
        new Date(String(a.updatedAt)).getTime()
    );

  return (
    <SideBox>
      <SideBoxTitle>Recently Updated</SideBoxTitle>
      <SideBoxSearch
        search={search}
        setSearch={setSearch}
        placeholder="Search Controls..."
        loading={loading}
      />
      {controls.map(control => {
        return (
          <SideBoxItem
            key={control.id}
            to={`/control/${control.id}`}
            activeClassName="active"
          >
            <SideBoxItemText flex={2} bold>
              {oc(control).description("")}
            </SideBoxItemText>
            <SideBoxItemText flex={1} right>
              {humanizeDate(oc(control).updatedAt(""))}
            </SideBoxItemText>
          </SideBoxItem>
        );
      })}
    </SideBox>
  );
};

export default ControlSideBox;
