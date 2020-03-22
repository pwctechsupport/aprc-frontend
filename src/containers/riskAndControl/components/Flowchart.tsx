import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { GroupType } from "react-select";
import Async from "react-select/async";
import Switch from "react-switch";
import styled, { keyframes } from "styled-components";
import {
  Control,
  Risk,
  RisksOrControlsDocument,
  RisksOrControlsQuery,
  Tag,
  useCreateTagMutation,
  useDeleteTagMutation,
  useTagsQuery,
  useUpdateTagMutation
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import { Suggestion, toLabelValue } from "../../../shared/formatter";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import {
  notifyGraphQLErrors,
  notifySuccess
} from "../../../shared/utils/notif";
import Header from "../../../shared/components/Header";

interface FlowchartProps {
  bpId: string;
  resourceId: string;
  img: string;
  editable: boolean;
  title?: string | null;
  className?: string;
}

interface FlowchartSuggestion {
  label: string;
  value: FlowchartSuggestionValue;
}

interface FlowchartSuggestionValue {
  riskId?: string;
  controlId?: string;
}

interface CurrentTag {
  id: string;
  active: boolean;
  x: number;
  y: number;
  risk?: Pick<Risk, "id" | "name"> | null;
  control?: Pick<Control, "id" | "description"> | null;
}

export default function Flowchart({
  bpId,
  resourceId,
  img,
  editable,
  title,
  className
}: FlowchartProps) {
  const [show, setShow] = useState(true);
  const init: CurrentTag = { id: "", active: false, x: 0, y: 0 };
  const [currentTag, setCurrentTag] = useState(init);
  const { data } = useTagsQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: {
        resource_id_eq: resourceId,
        business_process_id_eq: bpId
      }
    }
  });
  const tags = data?.tags?.collection || [];

  const restrictedControlIds = tags
    .map(a => a.control?.id)
    .filter(Boolean) as string[];
  const restrictedRiskIds = tags
    .map(a => a.risk?.id)
    .filter(Boolean) as string[];

  const [createTagMutation, createTagMutationInfo] = useCreateTagMutation({
    onCompleted: () => {
      notifySuccess("Tag Saved");
      handleClose();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["tags"]
  });
  function handleCreate(x: number, y: number) {
    createTagMutation({
      variables: {
        input: {
          businessProcessId: bpId,
          resourceId: resourceId,
          xCoordinates: x,
          yCoordinates: y,
          riskId: currentTag.risk?.id,
          controlId: currentTag.control?.id
        }
      }
    });
  }

  const [updateMutation, updateMutationInfo] = useUpdateTagMutation({
    onCompleted: () => {
      notifySuccess("Tag Updated");
      handleClose();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["tags"]
  });
  function handleUpdate(id: string) {
    updateMutation({
      variables: {
        input: {
          id,
          riskId: currentTag.risk?.id,
          controlId: currentTag.control?.id
        }
      }
    });
  }

  const [deleteTagMutation, deleteTagMutationInfo] = useDeleteTagMutation({
    onCompleted: () => {
      notifySuccess("Tag Deleted");
      handleClose();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["tags"]
  });
  function handleDelete(id: string) {
    deleteTagMutation({
      variables: {
        input: {
          id: id
        }
      }
    });
  }

  useEscapeDetection(() => {
    if (currentTag.active) setCurrentTag(init);
  });

  const handleLoadOptions = useLoadRiskAndControls({
    bpId,
    restrictedControlIds: restrictedControlIds,
    restrictedRiskIds: restrictedRiskIds
  });

  function handleClick(e: React.MouseEvent<HTMLImageElement, MouseEvent>) {
    e.persist();
    e.stopPropagation();
    if (currentTag.active) {
      setCurrentTag(init);
    } else {
      setCurrentTag({
        id: "",
        active: true,
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY
      });
    }
  }

  function handleClose() {
    setCurrentTag(init);
  }

  function handlePreviewTagClick(tag: Omit<Tag, "createdAt" | "updatedAt">) {
    return function(e: React.MouseEvent<HTMLImageElement, MouseEvent>) {
      e.stopPropagation();
      setCurrentTag({
        id: tag.id,
        active: true,
        x: tag.xCoordinates || 0,
        y: tag.yCoordinates || 0,
        risk: tag.risk,
        control: tag.control
      });
    };
  }

  function handleSelectChange(e: any) {
    if (e) {
      const { label, value } = e;
      setCurrentTag(prevTag => ({
        ...prevTag,
        ...(value.riskId && { risk: { id: value.riskId, name: label } }),
        ...(value.controlId && {
          control: { id: value.controlId, description: label }
        })
      }));
    }
  }

  return (
    <div className={className}>
      <div className="d-flex align-items-center justify-content-between">
        <Header>{title}</Header>
        <div className="d-flex align-items-center justify-content-start">
          <span>Show Tag</span>
          &nbsp;&nbsp;
          <Switch checked={show} width={50} height={25} onChange={setShow} />
        </div>
      </div>
      <FlowchartWrapper onClick={editable ? handleClick : undefined}>
        <Image src={img} editable={editable} />
        {tags.map(tag => {
          if (editable) {
            return (
              <PreviewTag
                key={tag.id}
                show={show ? 1 : 0}
                onClick={handlePreviewTagClick(tag)}
                x={tag.xCoordinates || 0}
                y={tag.yCoordinates || 0}
              >
                <PreviewTagText>
                  {tag.risk ? "Risk: " : "Control: "}
                  {tag.risk?.name || tag.control?.description}
                </PreviewTagText>
              </PreviewTag>
            );
          }
          return (
            <PreviewTag
              key={tag.id}
              show={show ? 1 : 0}
              x={tag.xCoordinates || 0}
              y={tag.yCoordinates || 0}
              as={Link}
              to={
                tag.risk?.id
                  ? `/risk/${tag.risk?.id}`
                  : `/control/${tag.control?.id}`
              }
            >
              <PreviewTagText>
                {tag.risk ? "Risk: " : "Control: "}
                {tag.risk?.name || tag.control?.description}
              </PreviewTagText>
            </PreviewTag>
          );
        })}
        {currentTag.active && (
          <TaggerBox
            onClick={e => e.stopPropagation()}
            x={currentTag.x}
            y={currentTag.y}
          >
            <TaggerBoxInner>
              <TaggerBoxCloseButton
                onClick={handleClose}
                size={13}
                color="lightgrey"
              />
              <Async
                loadOptions={handleLoadOptions}
                defaultOptions
                onFocus={e => e.stopPropagation()}
                placeholder="Select..."
                onChange={handleSelectChange}
                value={
                  currentTag.risk
                    ? {
                        label: currentTag.risk?.name,
                        value: { riskId: currentTag.risk?.id }
                      }
                    : currentTag.control
                    ? {
                        label: currentTag.control?.description,
                        value: { controlId: currentTag.control?.id }
                      }
                    : undefined
                }
              />
              <div className="d-flex justify-content-end">
                {currentTag.id ? (
                  <Button
                    onClick={() => handleDelete(currentTag.id)}
                    size="sm"
                    className="mr-1 pwc cancel"
                    loading={deleteTagMutationInfo.loading}
                    color="danger"
                  >
                    Delete
                  </Button>
                ) : null}
                <Button
                  onClick={() =>
                    currentTag.id
                      ? handleUpdate(currentTag.id)
                      : handleCreate(currentTag.x, currentTag.y)
                  }
                  size="sm"
                  className="pwc"
                  loading={
                    createTagMutationInfo.loading || updateMutationInfo.loading
                  }
                >
                  Save
                </Button>
              </div>
            </TaggerBoxInner>
          </TaggerBox>
        )}
      </FlowchartWrapper>
    </div>
  );
}

// ==========================================
// Styled Components
// ==========================================

const FlowchartWrapper = styled.div`
  position: relative;
`;

const Image = styled.img<{ editable: boolean }>`
  cursor: ${p => (p.editable ? "crosshair" : "")};
  width: 100%;
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

interface PreviewTagProps {
  x: number;
  y: number;
  show: number; // A bit of hack, because boolean emits warning
}

const PreviewTag = styled.div<PreviewTagProps>`
  position: absolute;
  top: ${p => p.y + 10}px;
  left: ${p => p.x - 50}px;
  background-color: rgba(0, 0, 0, 0.85);
  width: 100px;
  border-radius: 4px;
  text-align: center;
  vertical-align: middle;
  z-index: 10;
  cursor: pointer;
  padding: 5px 8px;
  /* in and out transition */
  visibility: ${p => (!p.show ? "hidden" : "visible")};
  transition: visibility 1s linear;
  animation: ${p => (!p.show ? fadeOut : fadeIn)} 1s linear;
  /* hover transition */
  transition: 1s cubic-bezier(0.075, 0.82, 0.165, 1);
  white-space: nowrap;
  &:hover {
    white-space: unset;
    z-index: 100;
    background-color: black;
  }
  /* remove default Link style */
  text-decoration: none;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
  /* create the tip */
  &::before {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid rgba(0, 0, 0, 0.85);
    position: absolute;
    top: -8px;
    left: 40px;
  }
`;

const PreviewTagText = styled.div`
  color: white;
  font-size: smaller;
  font-weight: bold;
  text-overflow: ellipsis;
  overflow-x: hidden;
  ${PreviewTag}:hover & {
    text-overflow: unset;
    overflow-x: unset;
  }
`;

const TaggerBox = styled.div<{ x: number; y: number }>`
  position: absolute;
  top: ${p => p.y + 10}px;
  left: ${p => p.x - 50}px;
  background-color: rgba(0, 0, 0, 1);
  width: 300px;
  height: 120px;
  border-radius: 5px;
  border: 1px solid black;
  z-index: 1000000;
  &::before {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid rgba(0, 0, 0, 0.85);
    position: absolute;
    top: -8px;
    left: 40px;
  }
`;

const TaggerBoxInner = styled.div`
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: black;
  height: 100%;
`;

const TaggerBoxCloseButton = styled(FaTimes)`
  cursor: pointer;
  position: absolute;
  top: 4px;
  right: 4px;
`;

// ==========================================
// Custom Hooks
// ==========================================

function useLoadRiskAndControls({
  bpId,
  restrictedRiskIds,
  restrictedControlIds
}: {
  bpId: string;
  restrictedRiskIds: string[];
  restrictedControlIds: string[];
}) {
  const query = useLazyQueryReturnPromise<RisksOrControlsQuery>(
    RisksOrControlsDocument
  );
  // Ini adalah high order function. Digunakan agar dapat mengubah nilai 'key' tanpa menulis function 2 kali.
  // Higher Order Function adalah fungsi yang return fungsi.
  const constructValue = (key: string) => (f: Suggestion) => ({
    label: f.label,
    value: { [key]: f.value }
  });

  async function getSuggestions(
    name: string = ""
  ): Promise<GroupType<FlowchartSuggestion>[]> {
    try {
      const { data } = await query({
        filter: {
          name_cont: name,
          description_cont: name,
          business_processes_id_eq: bpId
        }
      });
      const options = [
        {
          label: "Risks",
          options:
            data.risks?.collection
              .filter(({ id }) => {
                return !restrictedRiskIds.includes(id);
              })
              .map(toLabelValue)
              .map(constructValue("riskId")) || []
        },
        {
          label: "Controls",
          options:
            data.controls?.collection
              .filter(({ id }) => !restrictedControlIds.includes(id))
              .map(({ id, description }) => ({ id, name: description }))
              .map(toLabelValue)
              .map(constructValue("controlId")) || []
        }
      ];
      return options;
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}

function useEscapeDetection(callback: Function) {
  useEffect(() => {
    function escFunction(event: KeyboardEvent): any {
      if (event.keyCode === 27) {
        callback();
      }
    }
    document.addEventListener("keydown", escFunction, false);
    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  });
}
