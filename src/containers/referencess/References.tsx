import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  useDestroyReferenceMutation,
  useReferencesQuery
} from "../../generated/graphql";
import Table from "../../shared/components/Table";
import ControlSideBox from "../control/components/ControlSideBox";
import CreateReference from "./CreateReference";

const References = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery] = useDebounce(searchValue, 700);

  const { data, loading } = useReferencesQuery({
    variables: { filter: { name_cont: searchQuery } }
  });
  const [destroyReference] = useDestroyReferenceMutation({
    refetchQueries: ["references"],
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed")
  });

  const handleChange = (event: any) => {
    setSearchValue(event.target.value);
  };

  return (
    <div className="d-flex">
      <ControlSideBox searchValue={searchValue} handleChange={handleChange} />
      <div className="ml-3 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center">
          <h1>References</h1>
        </div>

        <div>
          <CreateReference />
        </div>

        <Table loading={loading}>
          <thead>
            <tr>
              <th>Name</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {oc(data)
              .references.collection([])
              .map(reference => {
                return (
                  <tr key={reference.id}>
                    <td>{reference.name}</td>
                    <td>
                      <FaTrash
                        onClick={() =>
                          destroyReference({ variables: { id: reference.id } })
                        }
                        className="clickable"
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default References;
