import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  useBusinessProcessesQuery,
  useDestroyBusinessProcessMutation
} from "../../generated/graphql";
import Table from "../../shared/components/Table";
import BusinessProcessSideBox from "./components/BusinessProcessSideBox";
import CreateBusinessProcess from "./CreateBusinessProcess";
import Helmet from "react-helmet";
import DialogButton from "../../shared/components/DialogButton";

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
  const [destroy, destroyM] = useDestroyBusinessProcessMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["businessProcesses"]
  });

  const handleDelete = (id: string) => {
    destroy({ variables: { input: { id } } });
  };

  return (
    <div className="d-flex">
      <Helmet>
        Business Process
        <title>Controls - PricewaterhouseCoopers</title>
      </Helmet>
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
                  <DialogButton
                    onConfirm={() => handleDelete(item.id)}
                    loading={destroyM.loading}
                  >
                    <FaTrash
                      className="clickable"
                    />
                  </DialogButton>
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
