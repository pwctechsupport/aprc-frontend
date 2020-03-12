import React, { useState } from "react";
import { GroupType } from "react-select";
import Async from "react-select/async";
import styled from "styled-components";
import {
  Tag,
  useCreateTagMutation,
  useTagsQuery,
  RisksOrControlsQuery,
  RisksOrControlsDocument
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import {
  notifyGraphQLErrors,
  notifySuccess
} from "../../../shared/utils/notif";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import {
  Suggestions,
  toLabelValue,
  Suggestion
} from "../../../shared/formatter";

interface FlowchartProps {
  bpId: string;
  resourceId: string;
  img: string;
  className?: string;
}

export default function Flowchart({
  img,
  className,
  bpId,
  resourceId
}: FlowchartProps) {
  const init = { active: false, x: 0, y: 0, body: "" };
  const [tag, setTag] = useState(init);
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

  const [createTagMutation] = useCreateTagMutation({
    onCompleted: () => {
      notifySuccess("Tag Saved");
      handleClose();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["tags"]
  });

  const handleLoadOptions = useLoadRiskAndControls({
    bpId,
    restrictedControlIds: restrictedControlIds,
    restrictedRiskIds: restrictedRiskIds
  });

  function handleClick(e: React.MouseEvent<HTMLImageElement, MouseEvent>) {
    e.persist();
    e.stopPropagation();
    if (tag.active) {
      setTag(init);
    } else {
      setTag({
        active: true,
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
        body: ""
      });
    }
  }
  function handleClose() {
    setTag(init);
  }
  function handleCreate(x: number, y: number) {
    createTagMutation({
      variables: {
        input: {
          businessProcessId: bpId,
          // body: selected,
          ...selected,

          xCoordinates: x,
          yCoordinates: y,
          resourceId: resourceId
        }
      }
    });
  }
  function handlePreviewTagClick(tag: Partial<Tag>) {
    return function(e: React.MouseEvent<HTMLImageElement, MouseEvent>) {
      e.stopPropagation();
      setTag({
        active: true,
        x: tag.xCoordinates || 0,
        y: tag.yCoordinates || 0,
        body: tag.body || ""
      });
    };
  }

  function handleSelectChange(e: any) {
    console.log(e);
    e && setSelected(e.value);
  }

  return (
    <div className={className}>
      <FlowchartWrapper onClick={handleClick}>
        <Image src={img} />
        {tags.map((tag, index) => (
          <PreviewTag
            key={index}
            onClick={handlePreviewTagClick(tag)}
            x={tag.xCoordinates || 0}
            y={tag.yCoordinates || 0}
          >
            {tag.risk?.name || tag.control?.description}
          </PreviewTag>
        ))}
        {tag.active && (
          <Tagger onClick={e => e.stopPropagation()} x={tag.x} y={tag.y}>
            <Async<Suggestion>
              loadOptions={handleLoadOptions}
              defaultOptions
              onFocus={e => e.stopPropagation()}
              placeholder="Select..."
              // value={selected}
              // value={tag.body ? { label: tag.body, value: tag.body } : null}
              onChange={handleSelectChange}
              // onChange={a => console.log(a)}
            />
            <div className="d-flex justify-content-end">
              <Button
                onClick={handleClose}
                size="sm"
                className="mr-1 pwc cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCreate(tag.x, tag.y)}
                size="sm"
                className="pwc"
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

const Image = styled.img`
  cursor: crosshair;
  position: absolute;
  width: 800px;
  height: 500px;
`;

const PreviewTag = styled.div<{ x: number; y: number }>`
  position: absolute;
  top: ${p => p.y}px;
  left: ${p => p.x}px;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  font-weight: bold;
  width: 100px;
  border-radius: 4px;
  text-align: center;
  vertical-align: middle;
  z-index: 10;
  cursor: pointer;
  padding: 5px 8px;
  text-overflow: ellipsis;
  overflow-x: hidden;
  overflow: hidden;
  white-space: nowrap;
  // transition: 0.15s ease-in-out;
  &:hover {
    width: 200px;
    text-overflow: unset;
    overflow: unset;
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
    left: 32px;
  }
`;

const Tagger = styled.div<{ x: number; y: number }>`
  position: absolute;
  top: ${p => p.y}px;
  left: ${p => p.x}px;
  background-color: rgba(0, 0, 0, 1);
  width: 400px;
  height: 300px;
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
  // Ini adalah high order function. Digunakan agar dapat mengubah nilai 'a' tanpa menulis function 2 kali.
  // Higher Order Function adalah fungsi yang return fungsi.
  const constructValue = (a: string) => (f: Suggestion) => ({
    label: f.label,
    value: { [a]: f.value }
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

interface FlowchartSuggestion {
  label: string;
  value: NeedProperName;
}

interface NeedProperName {
  riskId?: string;
  controlId?: string;
}
