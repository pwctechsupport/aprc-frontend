import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import styled from "styled-components";
import {
  useCreateResourceRatingMutation,
  useDestroyResourceAttachmentMutation,
  useUpdateResourceVisitMutation
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import StarRating from "../../../shared/components/StarRating";
import Tooltip from "../../../shared/components/Tooltip";
import {
  notifyGraphQLErrors,
  notifySuccess
} from "../../../shared/utils/notif";

interface ResourceBoxProps {
  id: string;
  name: string;
  views: number;
  rating: number;
  resuploadUrl: string | null | undefined;
  totalRating: number;
}

export default function ResourceBox({
  id,
  name,
  views,
  rating,
  totalRating,
  resuploadUrl
}: ResourceBoxProps) {
  const [previewAvailable, setPreivewAvailable] = useState(true);
  // Hanlde delete attachment
  const [
    deleteAttachmentMutation,
    deleteAttachmentMutationInfo
  ] = useDestroyResourceAttachmentMutation({
    onCompleted: () => notifySuccess("Attachment Removed"),
    onError: notifyGraphQLErrors,
    refetchQueries: ["resource"],
    awaitRefetchQueries: true
  });
  function handleErase() {
    deleteAttachmentMutation({ variables: { id } });
  }

  // Handle give rating
  const [createResourceRatingMutation] = useCreateResourceRatingMutation({
    onCompleted: ({ createResourceRating }) => {
      const rating = createResourceRating?.resourceRating?.rating || 0;
      notifySuccess(`You gave ${rating} star rating`);
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["resource"],
    awaitRefetchQueries: true
  });
  function handleStarClick(nextValue: number) {
    createResourceRatingMutation({
      variables: {
        input: {
          resourceId: id,
          rating: nextValue
        }
      }
    });
  }

  const [updateResourceVisit] = useUpdateResourceVisitMutation({
    refetchQueries: ["resource"]
  });

  // Handle download attachment
  const handleDownload = () => {
    updateResourceVisit({ variables: { id } });
    const link = document.createElement("a");
    link.target = "_blank";
    link.href = `http://mandalorian.rubyh.co${resuploadUrl}`;
    link.setAttribute("download", name || "PwC-Generated");
    document.body.appendChild(link);
    link.click();
    link.parentNode && link.parentNode.removeChild(link);
  };

  return (
    <ResourceBoxContainer>
      <ResourceBoxImagePreview
        src={`http://mandalorian.rubyh.co${resuploadUrl}`}
        onError={() => setPreivewAvailable(false)}
        alt={name}
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
            <DialogButton
              onConfirm={handleErase}
              color="soft red"
              message={`Delete attached file in "${name}"?`}
              className="soft red"
              loading={deleteAttachmentMutationInfo.loading}
              disabled={!previewAvailable}
            >
              <IoMdRemoveCircleOutline />
            </DialogButton>
          </Tooltip>
          <Tooltip description="Download resource attachment">
            <Button
              className="soft red"
              disabled={!previewAvailable}
              onClick={handleDownload}
              color=""
            >
              <FaDownload size={18} />
            </Button>
          </Tooltip>
        </ResourceBoxMetaWrapper>
      </ResourceBoxMeta>
    </ResourceBoxContainer>
  );
}

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
  padding: 5px;
  background: rgba(0, 0, 0, 0.1);
`;

const ResourceBoxImagePreview = styled.img`
  width: 100%;
  border-image-repeat: stretch;
`;

const ResourceBoxMetaWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RevenueBoxViews = styled.div`
  font-size: 12px;
`;
