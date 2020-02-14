import React, { useState } from "react";
import Helmet from "react-helmet";
import useForm from "react-hook-form";
import { FaPencilAlt, FaTimes, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { Input } from "reactstrap";
import { oc } from "ts-optchain";
import {
  Reference,
  useDestroyReferenceMutation,
  useReferencesQuery,
  useUpdateReferenceMutation
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import Table from "../../shared/components/Table";
import CreateReference from "./CreateReference";

const References = () => {
  const { data, loading } = useReferencesQuery();
  const [destroyReference, destroyM] = useDestroyReferenceMutation({
    refetchQueries: ["references"],
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed")
  });

  return (
    <div>
      <Helmet>
        <title>References - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-center">
          <h4>References</h4>
        </div>
        <div>
          <CreateReference />
        </div>

        <Table reloading={loading}>
          <thead>
            <tr>
              <th>Name</th>
              <th></th>
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
      <td className="align-middle action" style={{ width: "30%" }}>
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
              <DialogButton
                onConfirm={handleSubmit(updateReference)}
                className="pwc"
                loading={updateM.loading}
                color="primary"
                message="Save reference?"
              >
                Save
              </DialogButton>
            </div>
          ) : (
            <div>
              <Button
                color=""
                onClick={toggleEdit}
                className="soft orange mr-2"
              >
                <FaPencilAlt />
              </Button>
              <DialogButton
                onConfirm={onDelete}
                loading={deleteLoading}
                message={`Delete ${reference.name}?`}
                className="soft red"
              >
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
