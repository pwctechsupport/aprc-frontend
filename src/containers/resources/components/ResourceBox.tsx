import React from "react";
import styled from "styled-components";
import PlaceholderLink from "../../../assets/images/placeholder-link.png";
import PlaceholderPdf from "../../../assets/images/placeholder-pdf.png";
import PlaceholderXls from "../../../assets/images/placeholder-xls.png";
import {
  useCreateResourceRatingMutation,
  useDestroyResourceAttachmentMutation,
  useUpdateResourceVisitMutation,
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import EmptyAttribute from "../../../shared/components/EmptyAttribute";
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
  resourceFileType: string | null | undefined;
}

export default function ResourceBox({
  id,
  name,
  views,
  rating,
  totalRating,
  imagePreviewUrl,
  resourceFileType,
}: ResourceBoxProps) {
  const dialogBox = useDialogBox();

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

  function renderImage() {
    if (!imagePreviewUrl) {
      return (
        <div className="d-flex justify-content-center align-items-center py-5 my-5">
          <EmptyAttribute />
        </div>
      );
    }
    if (
      resourceFileType?.includes("png") ||
      resourceFileType?.includes("jpg")
    ) {
      return (
        <ResourceBoxImagePreview
          src={imagePreviewUrl}
          alt={name}
          onClick={handleDownload}
        />
      );
    }
    if (resourceFileType?.includes("xls")) {
      return <ResourceBoxImagePreview src={PlaceholderXls} />;
    }
    if (resourceFileType?.includes("pdf")) {
      return <ResourceBoxImagePreview src={PlaceholderPdf} />;
    }
    return <ResourceBoxImagePreview src={PlaceholderLink} />;
  }

  return (
    <ResourceBoxContainer>
      <div className="d-flex justify-content-center align-items-center py-1">
        {renderImage()}
      </div>
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
              disabled={!imagePreviewUrl}
              className="cancel"
              color="primary"
            >
              <SmallText>&nbsp;Remove File</SmallText>
            </Button>
          </Tooltip>
          <Tooltip description="Download resource attachment">
            <Button
              onClick={handleDownload}
              disabled={!imagePreviewUrl}
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
  max-width: 100%;
  max-height: 50vh;
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
