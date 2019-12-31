import React, { Fragment } from "react";
import { Table as BsTable, TableProps as BsTableProps } from "reactstrap";
import { FaSpinner } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import styled from "styled-components";

interface TableProps extends BsTableProps {
  loading?: boolean;
  reloading?: boolean;
}

const skeletonRow = Array.from(new Array(7));

const Table = ({ loading, reloading, ...props }: TableProps) => {
  if (loading) {
    return (
      <div className="text-center py-3">
        <FaSpinner className="icon-spin" size={40} />
      </div>
    );
  }

  return (
    <BsTable className="table-enlogy" {...props}>
      {!reloading ? (
        props.children
      ) : (
        <Fragment>
          <thead>
            <tr>
              <td>
                <Skeleton width="20%" />
              </td>
              <td>
                <Skeleton width="70%" />
              </td>
              <td>
                <Skeleton width="50%" />
              </td>
              <td>
                <Skeleton />
              </td>
              <td>
                <Skeleton />
              </td>
            </tr>
          </thead>
          <tbody>
            {skeletonRow.map((row, i) => {
              return (
                <tr key={i}>
                  <td>
                    <Skeleton width="20%" />
                  </td>
                  <td>
                    <Skeleton width="70%" />
                  </td>
                  <td>
                    <Skeleton width="50%" />
                  </td>
                  <td>
                    <Skeleton width={i % 2 ? "40%" : "90%"} />
                  </td>
                  <td>
                    <Skeleton />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Fragment>
      )}
    </BsTable>
  );
};

export const Tr = styled.tr`
  background: white;
  box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.08);
  cursor: pointer;
  height: 60px;
  color: inherit;
  &:hover {
    background: rgba(0, 0, 0, 0.08);
    text-decoration: none;
    color: inherit;
  }
`;

export const ActionTd = styled.td`
  visibility: hidden;
  &:hover {
    visibility: visible;
  }
  ${Tr}:hover & {
    visibility: visible;
  }
`;

export const EmptyTd = styled.td`
  text-align: center;
  padding: 20px 0px;
  background: rgba(0, 0, 0, 0.1);
`;

export default Table;
