import React, { useState } from "react";
import { Link } from "react-router-dom";
import StarRatingComponent from "react-star-rating-component";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useCreateResourceRatingMutation } from "../../generated/graphql";
import { useSelector } from "../hooks/useSelector";
import { FaFile } from "react-icons/fa";
import { Tooltip } from "reactstrap";
import styled from "styled-components";

const ResourceBar = ({
  name,
  resourceId,
  resuploadUrl,
  rating,
  visit,
  totalRating
}: ResourceBarProps) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  const tooltipId = "resourceBarTooltip" + resourceId;

  const user = useSelector(state => state.auth.user);
  const [mutate] = useCreateResourceRatingMutation({
    onCompleted: res => {
      const ratingGiven = oc(res).createResourceRating.resourceRating.rating(0);
      toast.success(`You gave ${ratingGiven} star rating`);
    },
    onError: () => toast.error("Update Rating Failed"),
    awaitRefetchQueries: true,
    refetchQueries: ["policy", "resource", "resources"]
  });
  const handleStarClick = (nextValue: number) => {
    mutate({
      variables: {
        input: {
          resourceId: resourceId,
          rating: nextValue,
          userId: oc(user).id("")
        }
      }
    });
  };
  return (
    <div className="resource-bar">
      <Tooltip
        placement="top"
        isOpen={tooltipOpen}
        target={tooltipId}
        toggle={toggle}
      >
        Avg. Rating: {rating} <br />
        From {totalRating} user(s)
      </Tooltip>
      <div className="d-flex align-items-center">
        <Link to={`/resources/${resourceId}`}>
          <div className="name">{name}</div>
        </Link>
        <a
          href={`http://mandalorian.rubyh.co${resuploadUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-3"
        >
          <FaFile />
        </a>
      </div>

      <div className="star-and-views">
        <div id={tooltipId}>
          <StarRatingComponent
            name={name}
            value={rating}
            starCount={5}
            onStarClick={handleStarClick}
            starColor="#d85604"
          />
        </div>
        <div className="views">{visit} Views</div>
      </div>
    </div>
  );
};

export default ResourceBar;

export const AddResourceButton = ({ onClick }: AddResourceButtonProps) => {
  return (
    <AddResourceButtonWrapper onClick={onClick}>
      + Add Resource
    </AddResourceButtonWrapper>
  );
};

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

interface AddResourceButtonProps {
  onClick: () => void;
}

interface ResourceBarProps {
  resourceId: string;
  name: string;
  rating: number;
  visit: number;
  resuploadUrl: string | null | undefined;
  totalRating: number;
}
