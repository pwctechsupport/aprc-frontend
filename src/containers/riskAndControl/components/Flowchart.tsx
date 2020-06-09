import React, { useState } from "react";
import { Link } from "react-router-dom";
import Switch from "react-switch";
import { useTagsQuery } from "../../../generated/graphql";
import Header from "../../../shared/components/Header";
import {
  PreviewTag,
  PreviewTagText,
  TargetImage,
} from "../../../shared/components/ImageTagger";
import styled from "styled-components";
import useAccessRights from "../../../shared/hooks/useAccessRights";

interface FlowchartProps {
  bpId: string;
  resourceId: string;
  img: string;
  editable: boolean;
  title?: string | null;
  className?: string;
  history?: string;
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
  history = "",
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
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);
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

      <Container>
        <div className="d-flex justify-content-center align-items-center py-1">
          <TargetImage src={img} editable={editable} />
        </div>

        {tags.map((tag) => {
          const id = tag.risk?.id || tag.control?.id;
          const type = tag.risk?.id ? "Risk" : "Control";
          const name = tag.risk?.name || tag.control?.description;
          const background = tag.risk?.id
            ? "orange"
            : tag.control?.id
            ? "#810001"
            : undefined;
          const to =
            isUser && history.includes("/flowchart")
              ? `/risk-and-control/${
                  history.split("/risk-and-control/")[1].split("flowchart")[0]
                }`
              : tag.risk?.id
              ? `/risk/${tag.risk?.id}`
              : `/control/${tag.control?.id}`;
          return (
            <PreviewTag
              key={tag.id}
              show={show}
              x={(tag.xCoordinates || 0) + 110}
              y={tag.yCoordinates || 0}
              as={Link}
              to={to}
              background={background}
            >
              <PreviewTagText>{`${type}: (${id}) ${name}`}</PreviewTagText>
            </PreviewTag>
          );
        })}
      </Container>
    </div>
  );
}
const Container = styled.div`
  max-width: 36vw;
  max-height: 36vw;
  background: white;
  border: grey 2px solid;
  border-radius: 5px;
  position: relative;
`;
