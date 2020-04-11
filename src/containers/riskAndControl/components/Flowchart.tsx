import React, { useState } from "react";
import { Link } from "react-router-dom";
import Switch from "react-switch";
import { useTagsQuery } from "../../../generated/graphql";
import Header from "../../../shared/components/Header";
import {
  ImageTaggerWrapper,
  PreviewTag,
  PreviewTagText,
  TargetImage,
} from "../../../shared/components/ImageTagger";

interface FlowchartProps {
  bpId: string;
  resourceId: string;
  img: string;
  editable: boolean;
  title?: string | null;
  className?: string;
  enableShowTag?: boolean;
}

export default function Flowchart({
  bpId,
  resourceId,
  img,
  editable,
  title,
  className,
  enableShowTag,
}: FlowchartProps) {
  const [show, setShow] = useState(true);
  const { data } = useTagsQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: {
        resource_id_eq: resourceId,
        business_process_id_eq: bpId,
      },
    },
  });
  const tags = resourceId ? data?.tags?.collection || [] : [];

  return (
    <div className={className}>
      {enableShowTag ? (
        <div className="d-flex align-items-center justify-content-between">
          <Header>{title}</Header>
          <div className="d-flex align-items-center justify-content-start">
            <span>Show Tag</span>
            &nbsp;&nbsp;
            <Switch checked={show} width={50} height={25} onChange={setShow} />
          </div>
        </div>
      ) : null}

      <ImageTaggerWrapper>
        <TargetImage src={img} editable={editable} />
        {tags.map((tag) => {
          const id = tag.risk?.id || tag.control?.id;
          const type = tag.risk?.id ? "Risk" : "Control";
          const name = tag.risk?.name || tag.control?.description;
          const background = tag.risk?.id
            ? "red"
            : tag.control?.id
            ? "orange"
            : undefined;
          const to = tag.risk?.id
            ? `/risk/${tag.risk?.id}`
            : `/control/${tag.control?.id}`;
          return (
            <PreviewTag
              key={tag.id}
              show={show}
              x={tag.xCoordinates || 0}
              y={tag.yCoordinates || 0}
              as={Link}
              to={to}
              background={background}
            >
              <PreviewTagText>{`${type}: (${id}) ${name}`}</PreviewTagText>
            </PreviewTag>
          );
        })}
      </ImageTaggerWrapper>
    </div>
  );
}
