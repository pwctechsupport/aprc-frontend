import React, { useState } from "react";
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
import CreateBusinessProcess from "./CreateBusinessProcess";
import BusinessProcessSideBox from "./components/BusinessProcessSideBox";
import { useDebounce } from "use-debounce/lib";

const BusinessProcesses = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery] = useDebounce(searchValue, 700);

  const handleChange = (event: any) => {
    setSearchValue(event.target.value);
  };
  const businessQuery = useBusinessProcessesQuery({
    variables: { filter: { name_cont: searchQuery } }
  });
  const bPCollection = oc(businessQuery).data.businessProcesses.collection([]);
  const [destroy] = useDestroyBusinessProcessMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["businessProcesses"]
  });

  const handleDelete = (id: string) => {
    destroy({ variables: { input: { id } } });
  };

  return (
    <div className="d-flex">
      <BusinessProcessSideBox
        searchValue={searchValue}
        handleChange={handleChange}
      />
      <div className="ml-3 w-100">
        <div className="d-flex justify-content-between align-items-center">
          <h1>Business Process </h1>
        </div>
        <div>
          <CreateBusinessProcess />
        </div>
        <Table reloading={businessQuery.loading}>
          <thead>
            <tr>
              <th>Business Process</th>
              <th>Business Process ID</th>
              <th>Parent</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bPCollection.map(item => (
              <tr key={item.id}>
                <td>
                  <Link to={`/business-process/${item.id}`}>{item.name}</Link>
                </td>
                <td> {item.id}</td>
                <td> {item.ancestry}</td>
                <td>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    color="transparent"
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default BusinessProcesses;
