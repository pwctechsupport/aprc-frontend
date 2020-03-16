import React from "react";
import { FaFile } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import styled from "styled-components";
import StarRating from "./StarRating";
import Tooltip from "./Tooltip";

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
  visit = 0,
  totalRating = 0
}: ResourceBarProps) {
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
            >
              <FaFile />
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

export const AddResourceButton = ({ onClick }: AddResourceButtonProps) => {
  return (
    <AddResourceButtonWrapper onClick={onClick}>
      + Add Resource
    </AddResourceButtonWrapper>
  );
};

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

const AddResourceButtonWrapper = styled.div`
  background-color: white;
  text-align: center;
  cursor: pointer;
  padding: 5px 0;
  border-radius: 3px;
  transition: 0.15s ease-in-out;
  color: grey;
  &:hover {
    background: lightgrey;
    color: black;
  }
`;

// ------------------------------------------------
// Type Definitions
// ------------------------------------------------

interface AddResourceButtonProps {
  onClick: () => void;
}
