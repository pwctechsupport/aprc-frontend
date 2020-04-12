import React, { useState } from "react";
import styled from "styled-components";
import {
  useCreateResourceRatingMutation,
  useDestroyResourceAttachmentMutation,
  useUpdateResourceVisitMutation,
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import StarRating from "../../../shared/components/StarRating";
import Tooltip from "../../../shared/components/Tooltip";
import useDialogBox from "../../../shared/hooks/useDialogBox";
import {
  notifyGraphQLErrors,
  notifySuccess,
} from "../../../shared/utils/notif";

interface ResourceBoxProps {
  id: string;
  name: string;
  views: number;
  rating: number;
  imagePreviewUrl: string | undefined;
  totalRating: number;
}

export default function ResourceBox({
  id,
  name,
  views,
  rating,
  totalRating,
  imagePreviewUrl,
}: ResourceBoxProps) {
  const dialogBox = useDialogBox();
  const [previewAvailable, setPreivewAvailable] = useState(true);

  // Hanlde delete attachment
  const [
    deleteAttachmentMutation,
    deleteAttachmentMutationInfo,
  ] = useDestroyResourceAttachmentMutation({
    onCompleted: () => notifySuccess("Attachment Removed"),
    onError: notifyGraphQLErrors,
    refetchQueries: ["resource"],
    awaitRefetchQueries: true,
  });
  function handleErase() {
    dialogBox({
      text: `Delete attached file in "${name}"?`,
      callback: () => deleteAttachmentMutation({ variables: { id } }),
    });
  }

  // Handle give rating
  const [createResourceRatingMutation] = useCreateResourceRatingMutation({
    onCompleted: ({ createResourceRating }) => {
      const rating = createResourceRating?.resourceRating?.rating || 0;
      notifySuccess(`You gave ${rating} star rating`);
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["resource"],
    awaitRefetchQueries: true,
  });
  function handleStarClick(nextValue: number) {
    createResourceRatingMutation({
      variables: {
        input: {
          resourceId: id,
          rating: nextValue,
        },
      },
    });
  }

  const [updateResourceVisit] = useUpdateResourceVisitMutation({
    refetchQueries: ["resource"],
  });

  // Handle download attachment
  const handleDownload = () => {
    updateResourceVisit({ variables: { id } });
    const link = document.createElement("a");
    link.target = "_blank";
    link.href = imagePreviewUrl || "";
    link.setAttribute("download", name || "PwC-Generated");
    document.body.appendChild(link);
    link.click();
    link.parentNode && link.parentNode.removeChild(link);
  };

  return (
    <ResourceBoxContainer>
      <ResourceBoxImagePreview
        src={imagePreviewUrl}
        onError={() => setPreivewAvailable(false)}
        alt={name}
        onClick={handleDownload}
      />
      <ResourceBoxMeta>
        <div>{name}</div>
        <ResourceBoxMetaWrapper>
          <div>
            <StarRating
              id={id}
              rating={rating}
              totalRating={totalRating}
              onStarClick={handleStarClick}
            />
          </div>
          <RevenueBoxViews>{views} Views</RevenueBoxViews>
          <Tooltip description="Delete resource attachment">
            <Button
              onClick={handleErase}
              loading={deleteAttachmentMutationInfo.loading}
              disabled={!previewAvailable}
              className="cancel"
              color="primary"
            >
              <SmallText>&nbsp;Remove File</SmallText>
            </Button>
          </Tooltip>
          <Tooltip description="Download resource attachment">
            <Button
              onClick={handleDownload}
              disabled={!previewAvailable}
              className="pwc"
              color="primary"
            >
              <SmallText>&nbsp;Download File</SmallText>
            </Button>
          </Tooltip>
        </ResourceBoxMetaWrapper>
      </ResourceBoxMeta>
    </ResourceBoxContainer>
  );
}

const ResourceBoxContainer = styled.div`
  width: 100%;
  background: white;
  border: grey 2px solid;
  border-radius: 5px;
  position: relative;
`;

const ResourceBoxMeta = styled.div`
  width: 100%;
  padding: 5px;
  background: #efefef;
`;

const ResourceBoxImagePreview = styled.img`
  width: 100%;
  border-image-repeat: stretch;
`;

const ResourceBoxMetaWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media screen and (max-width: 767px) {
    display: inline-block;
  }
`;

const RevenueBoxViews = styled.div`
  font-size: 12px;
`;

const SmallText = styled.span`
  font-size: 0.8rem;
`;
