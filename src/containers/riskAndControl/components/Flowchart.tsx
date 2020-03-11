import React, { useState } from "react";
import Async from "react-select/async";
import styled from "styled-components";
import {
  Tag,
  useCreateTagMutation,
  useTagsQuery
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import {
  notifyGraphQLErrors,
  notifySuccess
} from "../../../shared/utils/notif";

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
  const [createTagMutation] = useCreateTagMutation({
    onCompleted: () => {
      notifySuccess("Tag Saved");
      handleClose();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["tags"]
  });
  const init = { active: false, x: 0, y: 0, body: "" };
  const [tag, setTag] = useState(init);

  const handleLoadOptions = () => {};

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
  function handleSave(x: number, y: number) {
    createTagMutation({
      variables: {
        input: {
          businessProcessId: bpId,
          body: "hard coded",
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
  return (
    <div className={className}>
      <FlowchartWrapper onClick={handleClick}>
        <Image src={img} />
        {tags.map(tag => (
          <PreviewTag
            key={[tag.xCoordinates, tag.yCoordinates].join()}
            onClick={handlePreviewTagClick(tag)}
            x={tag.xCoordinates || 0}
            y={tag.yCoordinates || 0}
          >
            {tag.body?.concat(tag.body)}
          </PreviewTag>
        ))}
        {tag.active && (
          <Tagger onClick={e => e.stopPropagation()} x={tag.x} y={tag.y}>
            <Async
              loadOptions={handleLoadOptions}
              onFocus={e => e.stopPropagation()}
              placeholder="Select..."
              value={tag.body ? { label: tag.body, value: tag.body } : null}
              options={[
                {
                  label: "Control",
                  options: [
                    { label: "Satu", value: "1" },
                    { label: "Dua", value: "2" }
                  ]
                },
                {
                  label: "Risk",
                  options: [
                    { label: "Satu", value: "1" },
                    { label: "Dua", value: "2" },
                    { label: "Tiga", value: "3" }
                  ]
                }
              ]}
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
                onClick={() => handleSave(tag.x, tag.y)}
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
  background-color: rgba(0, 0, 0, 0.25);
  width: 200px;
  height: 300px;
  border-radius: 5px;
  padding: 20px;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

// function useLoadRiskAndControls() {
//   const query = useLazyQueryReturnPromise<BusinessProcessesQuery>(
//     BusinessProcessesDocument
//   );
//   async function getSuggestions(name_cont: string = ""): Promise<Suggestions> {
//     try {
//       const { data } = await query({
//         filter: { name_cont }
//       });
//       return data.businessProcesses?.collection.map(toLabelValue) || [];
//     } catch (error) {
//       return [];
//     }
//   }
//   return getSuggestions;
// }
