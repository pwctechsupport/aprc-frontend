import React from "react";
import styled from "styled-components";
import StarRatingComponent from "react-star-rating-component";
import { GoCloudDownload } from "react-icons/go";
import { useSelector } from "../../../shared/hooks/useSelector";
import { useCreateResourceRatingMutation } from "../../../generated/graphql";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";

const ResourceBox = ({
  id,
  name,
  views,
  rating,
  resuploadUrl
}: ResourceBoxProps) => {
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
  return (
    <ResourceBoxContainer>
      <a
        href={`http://mandalorian.rubyh.co${resuploadUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ResourceBoxImagePreview />
      </a>
      <ResourceBoxMeta>
        <div>{name}</div>
        <ResourceBoxBro>
          <StarRatingComponent
            name={name}
            starCount={5}
            value={rating || 0}
            onStarClick={handleStarClick}
          />
          <RevenueBoxViews>{views} Views</RevenueBoxViews>
          <GoCloudDownload className="clickable" size={20} onClick={() => {}} />
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
  views: number | null | undefined;
  rating: number | null | undefined;
  resuploadUrl: string | null | undefined;
}
