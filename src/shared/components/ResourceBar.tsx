import React from "react";
import { FaDownload, FaTrash } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { Button } from "reactstrap";
import styled from "styled-components";
import StarRating from "./StarRating";
import Tooltip from "./Tooltip";
import { useUpdateResourceVisitMutation } from "../../generated/graphql";
import useAccessRights from "../hooks/useAccessRights";
import DialogButton from "./DialogButton";
import { APP_ROOT_URL } from "../../settings";
import PickIcon from "../../assets/Icons/PickIcon";

interface ResourceBarProps {
  id: string;
  name?: string | null;
  resuploadUrl?: string | null;
  rating?: number | null;
  visit?: number | null;
  totalRating?: number | null;
  deleteResource?: any;
  resourceId?: any;
  policyIdsWithoutChildren?: any;
  setResourceId?: any;
  bPId?: any;
}

export default function ResourceBar({
  name,
  policyIdsWithoutChildren,
  id,
  resuploadUrl,
  bPId,
  deleteResource,
  setResourceId,
  rating = 0,
  visit,
  resourceId,
  totalRating = 0,
}: ResourceBarProps) {
  const [isAdminReviewer] = useAccessRights(["admin_reviewer"]);
  const [updateResourceVisit] = useUpdateResourceVisitMutation({
    refetchQueries: ["resources", "recentResources", "reviewerResourcesStatus"],
  });

  return (
    <ResourceBarContainer>
      <ResourceBarDivider width="40">
        <NavLink
          exact
          to={
            policyIdsWithoutChildren
              ? `/policy/${policyIdsWithoutChildren}/resources/${id}`
              : `/risk-and-control/${bPId}/resources/${id}`
          }
        >
          <ResourceName
            onClick={() => {
              setResourceId(id);
            }}
          >
            {name}
          </ResourceName>
        </NavLink>
      </ResourceBarDivider>

      <ResourceBarDivider width="20" align="right">
        <Button color="transparent">
          <Tooltip
            description="Open File"
            subtitle="Will be download if file type not supported"
          >
            <a
              href={`${APP_ROOT_URL}${resuploadUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              download={`Pwc-Resource ${name}`}
              onClick={() => updateResourceVisit({ variables: { id } })}
            >
              <FaDownload />
            </a>
          </Tooltip>
        </Button>
        {isAdminReviewer && (
          <DialogButton color="" onConfirm={() => deleteResource(resourceId)}>
            <Tooltip
              description="Delete Resource"
              subtitle="Resource will be deleted from current policy"
            >
              <PickIcon name="trash" className="clickable" />
            </Tooltip>
          </DialogButton>
        )}
      </ResourceBarDivider>

      <ResourceBarDivider width="10">
        <StarRating
          id={id}
          rating={rating}
          totalRating={totalRating}
          // onStarClick={handleStarClick}
        />
        <ResourceViewCount className="views">{visit} Views</ResourceViewCount>
      </ResourceBarDivider>
    </ResourceBarContainer>
  );
}

// ------------------------------------------------
// Styled Components Constructor
// ------------------------------------------------

const ResourceBarContainer = styled.div`
  background: #fbeee6;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  margin-bottom: 10px;
  & :last-child {
    margin-bottom: 0px;
  }
`;

const ResourceBarDivider = styled.div<{ width?: string; align?: string }>`
  width: ${(p) => p.width + "%"};
  text-align: ${(p) => p.align};
  margin: 0px 5px;
`;

const ResourceName = styled.div`
  font-weight: bold;
  font-size: 18px;
  line-height: 20px;
  color: #d85604;
  cursor: pointer;
`;

const ResourceViewCount = styled.div`
  font-size: 12px;
`;
