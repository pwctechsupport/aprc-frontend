import React, { useState } from "react";
import Helmet from "react-helmet";
import useForm from "react-hook-form";
import { FaPencilAlt, FaTrash, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { Input } from "reactstrap";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  Reference,
  useDestroyReferenceMutation,
  useReferencesQuery,
  useUpdateReferenceMutation
} from "../../generated/graphql";
import DialogButton from "../../shared/components/DialogButton";
import SearchBar from "../../shared/components/SearchBar";
import Table from "../../shared/components/Table";
import CreateReference from "./CreateReference";
import Button from "../../shared/components/Button";

const References = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery] = useDebounce(searchValue, 500);

  const { data, loading } = useReferencesQuery({
    variables: { filter: { name_cont: searchQuery } }
  });
  const [destroyReference, destroyM] = useDestroyReferenceMutation({
    refetchQueries: ["references"],
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed")
  });

  const handleChange = (event: any) => {
    setSearchValue(event.target.value);
  };

  return (
    <div className="d-flex">
      <Helmet>
        <title>References - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="ml-3 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center">
          <h1>References</h1>
        </div>
        <SearchBar
          onChange={handleChange}
          value={searchValue}
          placeholder="Search References"
        />
        <div>
          <CreateReference />
        </div>

        <Table reloading={loading}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {oc(data)
              .references.collection([])
              .map(reference => {
                return (
                  <ReferenceRow
                    key={reference.id}
                    reference={reference}
                    onDelete={() =>
                      destroyReference({ variables: { id: reference.id } })
                    }
                    deleteLoading={destroyM.loading}
                  />
                );
              })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default References;

const ReferenceRow = ({
  reference,
  onDelete,
  deleteLoading
}: ReferenceRowProps) => {
  const { register, handleSubmit } = useForm<{ name: string }>({
    defaultValues: {
      name: reference.name
    }
  });
  const [edit, setEdit] = useState(false);
  const toggleEdit = () => setEdit(p => !p);
  const [update, updateM] = useUpdateReferenceMutation({
    refetchQueries: ["references"],
    onCompleted: () => {
      toast.success("Update Success");
      toggleEdit();
    },
    onError: () => toast.error("Update Failed")
  });

  function updateReference(values: { name: string }) {
    update({
      variables: {
        input: {
          id: reference.id,
          name: values.name
        }
      }
    });
  }

  return (
    <tr>
      <td className="align-middle" style={{ width: "70%" }}>
        {edit ? (
          <form>
            <Input
              className="p-0 m-0"
              name="name"
              defaultValue={reference.name}
              innerRef={register}
            />
          </form>
        ) : (
          reference.name
        )}
      </td>
      <td className="align-middle" style={{ width: "30%" }}>
        <div className="d-flex align-items-center">
          {edit ? (
            <div>
              <Button
                color=""
                onClick={toggleEdit}
                type="button"
                className="mr-2"
              >
                <FaTimes /> Cancel
              </Button>
              <Button
                className="pwc"
                onClick={handleSubmit(updateReference)}
                loading={updateM.loading}
              >
                Save
              </Button>
            </div>
          ) : (
            <div>
              <Button color="" onClick={toggleEdit} className="mr-2">
                <FaPencilAlt />
              </Button>
              <DialogButton onConfirm={onDelete} loading={deleteLoading}>
                <FaTrash />
              </DialogButton>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

interface ReferenceRowProps {
  reference: Omit<Reference, "createdAt" | "policies" | "updatedAt">;
  onDelete: () => void;
  deleteLoading: boolean;
}
