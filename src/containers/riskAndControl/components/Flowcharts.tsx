import React, { useState } from "react";
import { Resource } from "../../../generated/graphql";
import Flowchart from "./Flowchart";
import styled, { css } from "styled-components";
import EmptyAttribute from "../../../shared/components/EmptyAttribute";

type MyResource = Omit<Resource, "createdAt" | "updatedAt">;

interface FlowchartsProps {
  bpId: string;
  resources: MyResource[];
}

export default function Flowcharts({ resources, bpId }: FlowchartsProps) {
  const [activeId, setActiveId] = useState(() => resources[0]?.id);
  const currentResource = resources.find(a => a.id === activeId);

  if (!resources.length) {
    return <EmptyAttribute>No Flowchart</EmptyAttribute>;
  }

  return (
    <div className="mt-3">
      <Flowchart
        img={
          "http://mandalorian.rubyh.co" + currentResource?.resuploadUrl || ""
        }
        resourceId={currentResource?.id || ""}
        title={currentResource?.name}
        bpId={bpId}
        editable={false}
        enableShowTag={true}
      />
      {resources.map(resource => (
        <ResourceItem key={resource.id}>
          <ResourceBox
            onClick={() => setActiveId(resource.id)}
            isActive={resource.id === activeId}
          >
            <ResourceImage
              src={"http://mandalorian.rubyh.co" + resource.resuploadUrl || ""}
              alt={resource.name || ""}
            />
          </ResourceBox>
          <ResourceName>{resource.name}</ResourceName>
        </ResourceItem>
      ))}
    </div>
  );
}

// ==========================================
// Styled Components
// ==========================================

const ResourceItem = styled.div`
  float: left;
  width: 90px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
`;

const ResourceBox = styled.div<{ isActive: boolean }>`
  width: 72px;
  height: 72px;
  margin: 8.5px;
  cursor: pointer;
  margin-top: 20px;
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  &:hover {
    box-shadow: 0 3px 6px 0 rgba(49, 53, 59, 0.5);
  }
  ${p =>
    p.isActive &&
    css`
      border-color: var(--primary-color);
      box-shadow: 0 3px 6px 0 rgba(49, 53, 59, 0.5);
    `};
`;

const ResourceImage = styled.img`
  object-fit: contain;
  background-color: transparent;
  display: inline-block;
  height: 100%;
  margin: 0 auto;
  position: relative;
  text-align: center;
  width: 100%;
`;

const ResourceName = styled.span`
  color: grey;
  margin: 0px 8.5px;
`;
