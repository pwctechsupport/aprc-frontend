import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaTrash } from "react-icons/fa";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  useBusinessProcessTreeQuery,
  useDestroyBusinessProcessMutation
} from "../../generated/graphql";
import DialogButton from "../../shared/components/DialogButton";
import Table from "../../shared/components/Table";
import BusinessProcessSideBox from "./components/BusinessProcessSideBox";
import CreateBusinessProcess from "./CreateBusinessProcess";
import BreadCrumb from "../../shared/components/BreadCrumb";

const BusinessProcesses = ({ history }: RouteComponentProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery] = useDebounce(searchValue, 700);

  const handleChange = (event: any) => {
    setSearchValue(event.target.value);
  };
  const isTree = !searchQuery;
  const businessQuery = useBusinessProcessTreeQuery({
    variables: {
      filter: {
        name_cont: searchQuery,
        ...(isTree && { ancestry_null: true })
      },
      isTree
    }
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
    <div>
      <BreadCrumb crumbs={[["/business-process", "Business Processes"]]} />
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
            <h4>Business Process </h4>
          </div>
          <div>
            <CreateBusinessProcess />
          </div>
          <Table reloading={businessQuery.loading}>
            <thead>
              <tr>
                <th>Business Process</th>
                <th>Business Process ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bPCollection.map(item => (
                <tr
                  key={item.id}
                  onClick={() => history.push(`/business-process/${item.id}`)}
                >
                  <td>{item.name}</td>
                  <td>{item.id}</td>
                  <td className="action">
                    <DialogButton
                      onConfirm={() => handleDelete(item.id)}
                      loading={destroyM.loading}
                      message={`Delete Business Process "${item.name}"?`}
                    >
                      <FaTrash className="clickable" />
                    </DialogButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BusinessProcesses;
