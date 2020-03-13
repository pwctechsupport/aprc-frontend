import React, { useEffect, useState } from "react";
import { GroupType } from "react-select";
import Async from "react-select/async";
import styled from "styled-components";
import {
  RisksOrControlsDocument,
  RisksOrControlsQuery,
  Tag,
  useCreateTagMutation,
  useDeleteTagMutation,
  useTagsQuery
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import { Suggestion, toLabelValue } from "../../../shared/formatter";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import {
  notifyGraphQLErrors,
  notifySuccess
} from "../../../shared/utils/notif";

interface FlowchartProps {
  bpId: string;
  resourceId: string;
  img: string;
  editable: boolean;
  className?: string;
}

export default function Flowchart({
  bpId,
  resourceId,
  img,
  editable,
  className
}: FlowchartProps) {
  const init: CurrentTag = { id: "", active: false, x: 0, y: 0 };
  const [currentTag, setCurrentTag] = useState(init);
  const [selected, setSelected] = useState<NeedProperName | null>(null);
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

  const [deleteTagMutation, deleteTagMutationInfo] = useDeleteTagMutation({
    onCompleted: () => {
      notifySuccess("Tag Deleted");
      handleClose();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["tags"]
  });

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
  function handleCreate(x: number, y: number) {
    createTagMutation({
      variables: {
        input: {
          businessProcessId: bpId,
          resourceId: resourceId,
          xCoordinates: x,
          yCoordinates: y,
          ...selected
        }
      }
    });
  }
  function handleDelete(id: string) {
    deleteTagMutation({
      variables: {
        input: {
          id: id
        }
      }
    });
  }
  function handlePreviewTagClick(tag: Omit<Tag, "createdAt" | "updatedAt">) {
    return function(e: React.MouseEvent<HTMLImageElement, MouseEvent>) {
      e.stopPropagation();
      setCurrentTag({
        id: tag.id,
        active: true,
        x: tag.xCoordinates || 0,
        y: tag.yCoordinates || 0,
        riskId: tag.risk?.id,
        controlId: tag.control?.id
      });
    };
  }

  function handleSelectChange(e: any) {
    e && setSelected(e.value);
  }

  return (
    <div className={className}>
      <FlowchartWrapper onClick={editable ? handleClick : undefined}>
        <Image src={img} editable={editable} />
        {tags.map((tag, index) => (
          <PreviewTag
            key={index}
            onClick={editable ? handlePreviewTagClick(tag) : undefined}
            x={tag.xCoordinates || 0}
            y={tag.yCoordinates || 0}
          >
            <PreviewTagText>
              {tag.risk ? "Risk: " : "Control: "}
              {tag.risk?.name || tag.control?.description}
            </PreviewTagText>
          </PreviewTag>
        ))}
        {currentTag.active && (
          <Tagger
            onClick={e => e.stopPropagation()}
            x={currentTag.x}
            y={currentTag.y}
          >
            <Async<Suggestion>
              loadOptions={handleLoadOptions}
              defaultOptions
              onFocus={e => e.stopPropagation()}
              placeholder="Select..."
              onChange={handleSelectChange}
            />
            <div className="d-flex justify-content-end">
              {currentTag.id ? (
                <Button
                  onClick={() => handleDelete(currentTag.id)}
                  size="sm"
                  className="mr-1 pwc cancel"
                  loading={deleteTagMutationInfo.loading}
                >
                  Delete
                </Button>
              ) : null}
              <Button
                onClick={handleClose}
                size="sm"
                className="mr-1 pwc cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCreate(currentTag.x, currentTag.y)}
                size="sm"
                className="pwc"
                loading={createTagMutationInfo.loading}
              >
                Save
              </Button>
            </div>
          </Tagger>
        )}
      </FlowchartWrapper>
    </div>
  );
}

const FlowchartWrapper = styled.div`
  position: relative;
`;

const Image = styled.img<{ editable: boolean }>`
  cursor: ${p => (p.editable ? "crosshair" : "")};
  position: absolute;
  width: 800px;
  height: 500px;
`;

const PreviewTag = styled.div<{ x: number; y: number }>`
  position: absolute;
  top: ${p => p.y}px;
  left: ${p => p.x}px;
  background-color: rgba(0, 0, 0, 0.85);
  width: 100px;
  border-radius: 4px;
  text-align: center;
  vertical-align: middle;
  z-index: 10;
  cursor: pointer;
  padding: 5px 8px;
  transition: 0.1s cubic-bezier(0.075, 0.82, 0.165, 1);
  white-space: nowrap;
  &:hover {
    white-space: unset;
  }
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

const Tagger = styled.div<{ x: number; y: number }>`
  position: absolute;
  top: ${p => p.y}px;
  left: ${p => p.x}px;
  background-color: rgba(0, 0, 0, 1);
  width: 300px;
  height: 120px;
  border-radius: 5px;
  padding: 20px;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: black;
  z-index: 1000000;
`;

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

interface FlowchartSuggestion {
  label: string;
  value: NeedProperName;
}

interface NeedProperName {
  riskId?: string;
  controlId?: string;
}

interface CurrentTag {
  id: string;
  active: boolean;
  x: number;
  y: number;
  riskId?: string;
  controlId?: string;
}
