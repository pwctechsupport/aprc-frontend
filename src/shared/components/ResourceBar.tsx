import React from "react";
import { FaDownload } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import styled from "styled-components";
import StarRating from "./StarRating";
import Tooltip from "./Tooltip";
import { useUpdateResourceVisitMutation } from "../../generated/graphql";

interface ResourceBarProps {
  id: string;
  name?: string | null;
  resuploadUrl?: string | null;
  rating?: number | null;
  visit?: number | null;
  totalRating?: number | null;
}

export default function ResourceBar({
  name,
  id,
  resuploadUrl,
  rating = 0,
  visit,
  totalRating = 0
}: ResourceBarProps) {
  const [updateResourceVisit] = useUpdateResourceVisitMutation({
    refetchQueries: ["resources"]
  });

  return (
    <ResourceBarContainer>
      <ResourceBarDivider width="40">
        <Link to={`/resources/${id}`}>
          <ResourceName>{name}</ResourceName>
        </Link>
      </ResourceBarDivider>

      <ResourceBarDivider width="20" align="right">
        <Button color="transparent">
          <Tooltip
            description="Open File"
            subtitle="Will be download if file type not supported"
          >
            <a
              href={`http://mandalorian.rubyh.co${resuploadUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              download={`Pwc-Resource ${name}`}
              onClick={() => updateResourceVisit({ variables: { id } })}
            >
              <FaDownload />
            </a>
          </Tooltip>
        </Button>
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
  width: ${p => p.width + "%"};
  text-align: ${p => p.align};
  margin: 0px 5px;
`;

const ResourceName = styled.div`
  font-weight: bold;
  font-size: 18px;
  line-height: 20px;
  color: #d85604;
`;

const ResourceViewCount = styled.div`
  font-size: 12px;
`;
