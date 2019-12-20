import React, { useState } from "react";
import styled from "styled-components";
import StarRatingComponent from "react-star-rating-component";
import { GoCloudDownload } from "react-icons/go";
import { useSelector } from "../../../shared/hooks/useSelector";
import { useCreateResourceRatingMutation } from "../../../generated/graphql";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { Tooltip } from "reactstrap";

const ResourceBox = ({
  id,
  name,
  views,
  rating,
  totalRating,
  resuploadUrl
}: ResourceBoxProps) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  const tooltipId = "resourceBarTooltip" + id;

  const user = useSelector(state => state.auth.user);
  const [mutate] = useCreateResourceRatingMutation({
    onCompleted: res => {
      const ratingGiven = oc(res).createResourceRating.resourceRating.rating(0);
      toast.success(`You gave ${ratingGiven} star rating`);
    },
    onError: () => toast.error("Update Rating Failed"),
    awaitRefetchQueries: true,
    refetchQueries: ["resource", "resources"]
  });
  const handleStarClick = (nextValue: number) => {
    mutate({
      variables: {
        input: {
          resourceId: id,
          rating: nextValue,
          userId: oc(user).id("")
        }
      }
    });
  };
  const handleDownload = (url: string, fileName: string) => {
    try {
      const link = document.createElement("a");
      link.target = "_blank";
      link.href = url;
      link.setAttribute("download", fileName || "PwC-Generated");
      document.body.appendChild(link);
      link.click();
      link.parentNode && link.parentNode.removeChild(link);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ResourceBoxContainer>
      <Tooltip
        placement="top"
        isOpen={tooltipOpen}
        target={tooltipId}
        toggle={toggle}
      >
        Avg. Rating: {rating} <br />
        From {totalRating} user(s)
      </Tooltip>
      <ResourceBoxImagePreview
        onClick={() =>
          handleDownload(`http://mandalorian.rubyh.co${resuploadUrl}`, name)
        }
      />
      <ResourceBoxMeta>
        <div>{name}</div>
        <ResourceBoxBro>
          <div id={tooltipId}>
            <StarRatingComponent
              name={name}
              starCount={5}
              value={rating}
              onStarClick={handleStarClick}
            />
          </div>
          <RevenueBoxViews>{views} Views</RevenueBoxViews>
          <GoCloudDownload
            size={20}
            className="clickable"
            onClick={() =>
              handleDownload(`http://mandalorian.rubyh.co${resuploadUrl}`, name)
            }
          />
        </ResourceBoxBro>
      </ResourceBoxMeta>
    </ResourceBoxContainer>
  );
};

const ResourceBoxContainer = styled.div`
  width: 300px;
  height: 300px;
  background: white;
  border: grey 2px solid;
  border-radius: 5px;
  position: relative;
`;

const ResourceBoxMeta = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 25%;
  border: grey solid;
  border-width: 0;
  border-top-width: 1px;
  padding: 5px;
  background: white;
`;

const ResourceBoxImagePreview = styled.div`
  width: 100%;
  height: 100%;
  background: url("/dummy-pdf.jpg") no-repeat center;
  cursor: pointer;
`;

const ResourceBoxBro = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RevenueBoxViews = styled.div`
  font-size: 12px;
`;

export default ResourceBox;

interface ResourceBoxProps {
  id: string;
  name: string;
  views: number;
  rating: number;
  resuploadUrl: string | null | undefined;
  totalRating: number;
}
