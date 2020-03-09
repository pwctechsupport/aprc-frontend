import React, { useState } from "react";
import Helmet from "react-helmet";
import useForm from "react-hook-form";
import {
  FaFileExport,
  FaFileImport,
  FaPencilAlt,
  FaTimes,
  FaTrash
} from "react-icons/fa";
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
import ImportModal from "../../shared/components/ImportModal";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import downloadXls from "../../shared/utils/downloadXls";
import CreateReference from "./CreateReference";

const References = () => {
  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal(p => !p);

  const { data, loading } = useReferencesQuery();

  const [selected, setSelected] = useState<string[]>([]);
  const references = oc(data).references.collection([]);
  const [destroyReference, destroyM] = useDestroyReferenceMutation({
    refetchQueries: ["references"],
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed")
  });
  function toggleCheck(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected(selected.concat(id));
    }
  }

  function toggleCheckAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelected(references.map(n => n.id));
    } else {
      setSelected([]);
    }
  }
  function handleExport() {
    downloadXls(
      "/prints/reference_excel.xlsx",
      {
        reference_ids: selected.map(Number)
      },
      {
        fileName: "Policy Reference.xlsx",
        onStart: () => toast.info("Download Dimulai"),
        onCompleted: () => toast.success("Download Berhasil"),
        onError: () => toast.error("Download Gagal")
      }
    );
  }
  return (
    <div>
      <Helmet>
        <title>References - PricewaterhouseCoopers</title>
      </Helmet>

      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-center">
          <h4>References</h4>
          <div className="mb-3 d-flex justify-content-end">
            <Tooltip
              description="Export Policy Reference"
              subtitle={
                selected.length
                  ? "Export selected Policy References"
                  : "Select References first"
              }
            >
              <Button
                color=""
                className="soft red mr-2"
                onClick={handleExport}
                disabled={!selected.length}
              >
                <FaFileExport />
              </Button>
            </Tooltip>
            <Tooltip description="Import Policy Reference">
              <Button
                color=""
                className="soft orange mr-2"
                onClick={toggleImportModal}
              >
                <FaFileImport />
              </Button>
            </Tooltip>
            <ImportModal
              title="Import Policy Reference"
              endpoint="/references/import"
              isOpen={modal}
              toggle={toggleImportModal}
            />
          </div>
        </div>
        <div>
          <CreateReference />
        </div>

        <Table reloading={loading}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selected.length === references.length}
                  onChange={toggleCheckAll}
                />
              </th>
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
                    toggleCheck={() => toggleCheck(reference.id)}
                    selected={selected.includes(reference.id)}
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
  deleteLoading,
  selected,
  toggleCheck
}: ReferenceRowProps) => {
  const { register, handleSubmit } = useForm<{ name: string }>({
    defaultValues: {
      name: reference.name || ""
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
      <td>
        <input
          type="checkbox"
          checked={selected}
          onClick={e => e.stopPropagation()}
          onChange={toggleCheck}
        />
      </td>
      <td className="align-middle" style={{ width: "70%" }}>
        {edit ? (
          <form>
            <Input
              className="p-0 m-0"
              name="name"
              defaultValue={reference.name || ""}
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
  selected: boolean;
  toggleCheck: any;
}
