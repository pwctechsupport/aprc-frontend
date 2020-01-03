import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  useControlsQuery,
  useDestroyControlMutation
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import SearchBar from "../../shared/components/SearchBar";
import Table from "../../shared/components/Table";

const Controls = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery] = useDebounce(searchValue, 700);

  const handleChange = (event: any) => {
    setSearchValue(event.target.value);
  };
  const { loading, data } = useControlsQuery({
    variables: { filter: { description_cont: searchQuery } }
  });
  const controls = oc(data).controls.collection([]);

  const [destroy, destroyM] = useDestroyControlMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["controls"]
  });
  const handleDelete = (id: string) => {
    destroy({ variables: { input: { id } } });
  };
  return (
    <div>
      <Helmet>
        <title>Controls - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="ml-3 w-100">
        <div className="d-flex justify-content-between align-items-center">
          <h1>Controls</h1>
          <Link to="/control/create">
            <Button className="pwc">+ Add Control</Button>
          </Link>
        </div>
        <SearchBar
          onChange={handleChange}
          value={searchValue}
          placeholder="Search Controls"
        />
        <Table reloading={loading}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Description</th>
              <th>Freq</th>
              <th>Type</th>
              <th>Ass. Risk</th>
              <th>Nature</th>
              <th>Owner</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {controls.map(control => {
              return (
                <tr key={control.id}>
                  <td>{control.id}</td>
                  <td>
                    <Link to={`/control/${control.id}`}>
                      {control.description}
                    </Link>
                  </td>
                  <td>{capitalCase(control.frequency || "")}</td>
                  <td>{capitalCase(control.typeOfControl || "")}</td>
                  <td>
                    {oc(control)
                      .risks([])
                      .map(risk => risk.name)
                      .join(", ")}
                  </td>
                  <td>{capitalCase(control.nature || "")}</td>
                  <td>{control.controlOwner}</td>
                  <td>
                    <DialogButton
                      onConfirm={() => handleDelete(control.id)}
                      loading={destroyM.loading}
                    >
                      <FaTrash className="clickable" />
                    </DialogButton>
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

export default Controls;
