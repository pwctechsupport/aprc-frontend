import React, { Fragment } from "react";
import { Table as BsTable, TableProps as BsTableProps } from "reactstrap";
import { FaSpinner } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";

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

export default Table;
