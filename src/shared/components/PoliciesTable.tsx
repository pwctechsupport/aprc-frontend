import React, { useState } from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import { Link, useHistory } from "react-router-dom";
import styled from "styled-components";
import PickIcon from "../../assets/Icons/PickIcon";
import { Policy } from "../../generated/graphql";
import { previewHtml } from "../formatter";
import useAccessRights from "../hooks/useAccessRights";
import Button from "./Button";
import DateHover from "./DateHover";
import DisplayStatus from "./DisplayStatus";
import EmptyAttribute from "./EmptyAttribute";
import Table from "./Table";
import Tooltip from "./Tooltip";

interface PoliciesTableProps {
  policies: Policy[];
  isAdminView?: boolean;
  onDelete?: (id: string, title: string) => void;
}

export default function PoliciesTable({
  policies,
  onDelete,
  isAdminView,
}: PoliciesTableProps) {
  const history = useHistory();
  return (
    <Table responsive>
      <thead>
        <tr>
          <th />
          <th>Title</th>
          <th>Description</th>
          <th>Categories</th>
          <th>References</th>
          <th>Status</th>
          <th>Updated</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {policies.length ? (
          policies.map((policy) => (
            <PolicyTableRow
              key={policy.id}
              policy={policy}
              isAdminView={isAdminView}
              onClick={(id) =>
                history.push(
                  isAdminView ? `/policy-admin/${id}/details` : `/policy/${id}`
                )
              }
              onDelete={() => onDelete?.(policy.id, policy.title || "")}
              level={0}
            />
          ))
        ) : (
          <tr>
            <td colSpan={8}>
              <EmptyAttribute />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

const PolicyTableRow = ({
  policy,
  onClick,
  onDelete,
  isAdminView,
  level = 0,
}: {
  policy: Omit<Policy, "createdAt" | "visit">;
  onClick: (id: string) => void;
  onDelete: () => void;
  level?: number;
  isAdminView?: boolean;
}) => {
  const [showChild, setShowChild] = useState(false);
  const toggleChild = () => setShowChild((s) => !s);
  const id = policy.id || "";
  const childs = policy.children || [];
  const hasChild = Array.isArray(childs) && !!childs.length;

  function handleDelete(event: React.MouseEvent<any, MouseEvent>) {
    event.stopPropagation();
    onDelete();
  }
  const [isAdminReviewer] = useAccessRights(["admin_reviewer"]);
  return (
    <>
      <tr key={id}>
        <td>
          {hasChild && (
            <Button onClick={toggleChild} color="" className="text-secondary">
              {showChild ? <FaFolderOpen /> : <FaFolder />}
            </Button>
          )}
        </td>
        <td>
          <div
            style={level ? { marginLeft: level * 10 } : {}}
            className="d-flex align-items-center"
          >
            {level > 0 && (
              <MdSubdirectoryArrowRight color="grey" className="mr-1" />
            )}
            <PWCLink
              to={isAdminView ? `/policy-admin/${id}/details` : `/policy/${id}`}
            >
              {policy.title}
            </PWCLink>
          </div>
        </td>

        <td>
          <div
            dangerouslySetInnerHTML={{
              __html: previewHtml(policy.description || "", 200),
            }}
          />
        </td>
        <td>{policy.policyCategory?.name || ""}</td>
        <td>{policy.references?.map((item) => item.name).join(", ")}</td>
        <td>
          <DisplayStatus>{policy.status}</DisplayStatus>
        </td>
        <td>
          <DateHover withIcon>{policy.updatedAt}</DateHover>
        </td>
        <td className="action">
          {isAdminReviewer ? (
            <Tooltip description="Delete Policy">
              <Button onClick={handleDelete} className="soft red" color="">
                <PickIcon name="trash" className="clickable" />
              </Button>
            </Tooltip>
          ) : null}
        </td>
      </tr>
      {childs.length && showChild
        ? childs.map((childPol) => (
            <PolicyTableRow
              key={childPol.id}
              policy={childPol}
              onClick={onClick}
              onDelete={onDelete}
              level={level + 1}
              isAdminView={isAdminView}
            />
          ))
        : null}
    </>
  );
};
export const PWCLink = styled(Link)`
  color: var(--orange);
  &:hover {
    color: var(--orange);
  }
`;
