import React, { useState } from "react";
import { Resource } from "../../../generated/graphql";
import Flowchart from "./Flowchart";
import styled, { css } from "styled-components";
import useAccessRights from "../../../shared/hooks/useAccessRights";

interface FlowchartsProps {
  bpId: string;
  resources: Partial<Resource>[];
}

export default function Flowcharts({ resources, bpId }: FlowchartsProps) {
  const rolesArray = useAccessRights(["admin", "admin_preparer"]);
  const userCanEdit = rolesArray.every(() => true);

  const [activeResourceid, setActiveResourceId] = useState(
    () => resources[0]?.id
  );
  const currentResource: undefined | Partial<Resource> = resources.find(
    a => a.id === activeResourceid
  );
  return (
    <div className="mt-3">
      <Flowchart
        img={
          "http://mandalorian.rubyh.co" + currentResource?.resuploadUrl || ""
        }
        resourceId={currentResource?.id || ""}
        bpId={bpId}
        editable={userCanEdit}
      />
      <div>
        {resources.map(resource => (
          <ButtonImage
            key={resource.id}
            onClick={() => setActiveResourceId(resource.id)}
            isActive={resource.id === activeResourceid}
          >
            <ButtonImage2>
              <Image
                src={
                  "http://mandalorian.rubyh.co" + resource.resuploadUrl || ""
                }
                alt={resource.name || ""}
              />
            </ButtonImage2>
          </ButtonImage>
        ))}
      </div>
    </div>
  );
}

const ButtonImage = styled.div<{ isActive: boolean }>`
  width: 72px;
  height: 72px;
  border-radius: 8px;
  margin: 8.5px;
  float: left;
  overflow: hidden;
  cursor: pointer;
  margin-top: 550px;
  border: 0px solid black;
  border-width: ${p => (p.isActive ? 1 : 0)}px;
  &:hover {
    box-shadow: 0 3px 6px 0 rgba(49, 53, 59, 0.5);
  }
  ${p =>
    p.isActive &&
    css`
      box-shadow: 0 3px 6px 0 rgba(49, 53, 59, 0.5);
    `};
`;

const ButtonImage2 = styled.div`
  background-color: transparent;
  display: inline-block;
  height: 100%;
  margin: 0 auto;
  position: relative;
  text-align: center;
  width: 100%;
`;

const Image = styled.img`
  object-fit: contain;
  background-color: transparent;
  display: inline-block;
  height: 100%;
  margin: 0 auto;
  position: relative;
  text-align: center;
  width: 100%;
`;