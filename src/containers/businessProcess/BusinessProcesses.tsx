import React from "react";
import {
  useBusinessProcessesQuery,
  useDestroyBusinessProcessMutation,
  BusinessProcessesDocument
} from "../../generated/graphql";
import Table from "../../shared/components/Table";
import { oc } from "ts-optchain";
import { Link } from "react-router-dom";
import Button from "../../shared/components/Button";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const BusinessProcesses = () => {
  const boby = useBusinessProcessesQuery({ variables: { filter: {} } });
  const boba = oc(boby).data.businessProcesses.collection([]);
  const [destroy, bodel] = useDestroyBusinessProcessMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: [
      { query: BusinessProcessesDocument, variables: { filter: {} } }
    ]
  });

  const handleDelete = (id: string) => {
    destroy({ variables: { input: { id } } });
  };

  return (
    <Table>
      <thead>
        <tr>
          <th>Business Process</th>
          <th>Business Process ID</th>
          <th>Parent</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {boba.map(item => (
          <tr>
            <td>
              <Link to={`/business-process/${item.id}`}>{item.name}</Link>{" "}
            </td>
            <td> {item.id}</td>
            <td> {item.ancestry}</td>
            <td>
              <Button onClick={() => handleDelete(item.id)} color="transparent">
                <FaTrash />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default BusinessProcesses;
