import classnames from "classnames";
import React, { Fragment } from "react";
import { FaSpinner } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import { TableProps as BsTableProps } from "reactstrap";
import styled from "styled-components";

interface TableProps extends BsTableProps {
  loading?: boolean;
  reloading?: boolean;
}

const skeletonRow = Array.from(new Array(7));

const Table = ({ loading, reloading, className, ...props }: TableProps) => {
  if (loading) {
    return (
      <div className="text-center py-3">
        <FaSpinner className="icon-spin" size={40} />
      </div>
    );
  }

  return (
    <table className={classnames("table-pwc w-100", className)} {...props}>
      {!reloading ? (
        props.children
      ) : (
        <Fragment>
          <thead>
            <Tr>
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
            </Tr>
          </thead>
          <tbody>
            {skeletonRow.map((row, i) => {
              return (
                <Tr key={i}>
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
                </Tr>
              );
            })}
          </tbody>
        </Fragment>
      )}
    </table>
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
  vertical-align: middle;
  padding: 20px 0px;
  background: rgba(0, 0, 0, 0.1);
`;

export default Table;
