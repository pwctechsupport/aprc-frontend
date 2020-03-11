import React, { useState } from "react";
import {
  Tag,
  useCreateTagMutation,
  useTagsQuery,
  Resource
} from "../../../generated/graphql";
import Flowchart from "./Flowchart";
import styled from "styled-components";

interface FlowchartsProps {
  bpId: string;
  resources: Partial<Resource>[];
}

export default function Flowcharts({ resources, bpId }: FlowchartsProps) {
  const [activeResourceid, setActiveResourceId] = useState(
    () => resources[0]?.id
  );
  const currentResource: undefined | Partial<Resource> = resources.find(
    a => a.id === activeResourceid
  );
  return (
    <div>
      <div>
        {resources.map(resource => (
          <ButtonImage key={resource.id}>
            <ButtonImage2>
              <img
                src={
                  "http://mandalorian.rubyh.co" + resource.resuploadUrl || ""
                }
                alt={resource.name || ""}
              />
            </ButtonImage2>
          </ButtonImage>
        ))}
      </div>
      <Flowchart
        img={
          "http://mandalorian.rubyh.co" + currentResource?.resuploadUrl || ""
        }
        resourceId={currentResource?.id || ""}
        bpId={bpId}
      />
    </div>
  );
}

const ButtonImage = styled.div`
  width: 72px;
  height: 72px;
  box-shadow: 0 3px 6px 0 rgba(49, 53, 59, 0.5);
  border-radius: 8px;
  margin: 8.5px;
  float: left;
  overflow: hidden;
`;

const ButtonImage2 = styled.div`
  background-color: transparent;
  display: inline-block;
  height: auto;
  margin: 0 auto;
  position: relative;
  text-align: center;
  width: 100%;
`;
