import React from "react";
import { Policy } from "../../generated/graphql";
import Table from "./Table";
import { Link } from "react-router-dom";
import { previewHtml } from "../formatter";
import Button from "./Button";
import { FaTrash } from "react-icons/fa";
import EmptyAttribute from "./EmptyAttribute";

interface PoliciesTableProps {
  policies: Policy[];
  isAdminView?: boolean;
  onDelete?: (id: string, title: string) => void;
}

export default function PoliciesTable({
  policies,
  onDelete,
  isAdminView
}: PoliciesTableProps) {
  return (
    <Table responsive>
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>References</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {policies.length ? (
          policies.map(item => (
            <tr key={item.id}>
              <td>
                <Link
                  to={
                    isAdminView
                      ? `/policy-admin/${item.id}/details`
                      : `/policy/${item.id}`
                  }
                >
                  {item.title}
                </Link>
              </td>
              <td>
                <div
                  dangerouslySetInnerHTML={{
                    __html: previewHtml(item.description || "")
                  }}
                />
              </td>
              <td>{item?.references?.map(ref => ref.name).join(", ")}</td>
              <td>
                <Button
                  color=""
                  onClick={() => onDelete?.(item.id, item.title || "")}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4}>
              <EmptyAttribute />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
