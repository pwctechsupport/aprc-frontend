import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaFileExport, FaFileImport, FaPlus, FaTrash } from "react-icons/fa";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { Input } from "reactstrap";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  useBusinessProcessTreeQuery,
  useDestroyBusinessProcessMutation,
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import Modal from "../../shared/components/Modal";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import MyApi from "../../shared/utils/api";
import downloadXls from "../../shared/utils/downloadXls";
import CreateBusinessProcess from "./CreateBusinessProcess";
import useAccessRights from "../../shared/hooks/useAccessRights";

const BusinessProcesses = ({ history }: RouteComponentProps) => {
  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal((p) => !p);

  const [createBpModal, setCreateBpModal] = useState(false);
  const toggleCreateBpModal = () => setCreateBpModal((p) => !p);

  const [selected, setSelected] = useState<string[]>([]);
  const [searchValue] = useState("");
  const [searchQuery] = useDebounce(searchValue, 700);

  const isTree = !searchQuery;
  const businessQuery = useBusinessProcessTreeQuery({
    variables: {
      filter: {
        name_cont: searchQuery,
        ...(isTree && { ancestry_null: true }),
      },
      isTree,
    },
  });
  const bps = oc(businessQuery).data.businessProcesses.collection([]);
  const [destroy, destroyM] = useDestroyBusinessProcessMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["businessProcesses"],
  });

  const handleDelete = (id: string) => {
    destroy({ variables: { input: { id } } });
  };

  function toggleCheck(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else {
      setSelected(selected.concat(id));
    }
  }

  function toggleCheckAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelected(bps.map((n) => n.id));
    } else {
      setSelected([]);
    }
  }

  function handleExport() {
    downloadXls(
      "/prints/business_process_excel.xlsx",
      {
        business_process_ids: selected.map(Number),
      },
      {
        fileName: "Business Process.xlsx",
        onStart: () => toast.info("Download Dimulai"),
        onCompleted: () => toast.success("Download Berhasil"),
        onError: () => toast.error("Download Gagal"),
      }
    );
  }
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);

  return (
    <div>
      <BreadCrumb crumbs={[["/business-process", "Business Processes"]]} />
      <div className="d-flex">
        <Helmet>
          <title>Business Process - PricewaterhouseCoopers</title>
        </Helmet>
        <div className="w-100">
          <Modal
            isOpen={createBpModal}
            toggle={toggleCreateBpModal}
            title="Create Business Process"
          >
            <CreateBusinessProcess />
          </Modal>

          <div className="mb-3 d-flex justify-content-end">
            {isAdmin || isAdminReviewer || isAdminPreparer ? (
              <Tooltip description="Create Business Process">
                <Button
                  onClick={toggleCreateBpModal}
                  className="soft orange mr-2"
                  color=""
                >
                  <FaPlus />
                </Button>
              </Tooltip>
            ) : null}
            {isAdminReviewer ? (
              <Tooltip
                description="Export Business Process"
                subtitle={
                  selected.length
                    ? "Export selected business processes"
                    : "Select BPs first"
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
            ) : null}
            {isAdminReviewer ? (
              <Tooltip description="Import Business Process">
                <Button
                  color=""
                  className="soft orange mr-2"
                  onClick={toggleImportModal}
                >
                  <FaFileImport />
                </Button>
              </Tooltip>
            ) : null}
            {isAdminReviewer ? (
              <ImportBusinessProcessModal
                isOpen={modal}
                toggle={toggleImportModal}
              />
            ) : null}
          </div>

          <Table reloading={businessQuery.loading}>
            <thead>
              <tr>
                {isAdminReviewer ? (
                  <th>
                    <input
                      type="checkbox"
                      checked={selected.length === bps.length}
                      onChange={toggleCheckAll}
                    />
                  </th>
                ) : null}

                <th>Business Process</th>
                <th>Business Process ID</th>

                <th>Updated At</th>
                <th>Updated By</th>
                <th>Created At</th>
                <th>Created By</th>

                <th></th>
              </tr>
            </thead>
            <tbody>
              {bps.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => history.push(`/business-process/${item.id}`)}
                >
                  {isAdminReviewer ? (
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleCheck(item.id)}
                      />
                    </td>
                  ) : null}

                  <td>{item.name}</td>
                  <td>{item.id}</td>
                  <td>{item.updatedAt.split("T")[0]}</td>
                  <td>{item.lastUpdatedBy}</td>
                  <td>{item.createdAt.split("T")[0]}</td>
                  <td>{item.createdBy}</td>
                  {isAdmin || isAdminReviewer || isAdminPreparer ? (
                    <td className="action">
                      <DialogButton
                        onConfirm={() => handleDelete(item.id)}
                        loading={destroyM.loading}
                        message={`Delete Business Process "${item.name}"?`}
                        className="soft red"
                      >
                        <Tooltip description="Delete Business Process">
                          <FaTrash className="clickable" />
                        </Tooltip>
                      </DialogButton>
                    </td>
                  ) : (
                    <td></td>
                  )}
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

const ImportBusinessProcessModal = ({
  isOpen,
  toggle,
}: ImportBusinessProcessModalProps) => {
  const [file, setFile] = useState();
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  function handleSetFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (
        file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setError("File type not supported. Allowed type are: .xls, .xlsx");
      } else {
        setError(null);
        setFile(file);
      }
    }
  }

  async function handleImport() {
    const formData = new FormData();

    formData.append("file", file);
    try {
      setLoading(true);
      await MyApi.put("/business_processes/import", formData);
      toast.success("Import Business Process Berhasil");
      toggle();
    } catch (error) {
      setError(error);
      toast.error("Import Business Process Gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} title="Import Business Process" toggle={toggle}>
      <Input type="file" onChange={handleSetFile} />
      {error && <h6 className="text-red mt-2">{error}</h6>}
      <div className="d-flex justify-content-end mt-3">
        <Button
          className="pwc"
          onClick={handleImport}
          disabled={!file || !!error}
          loading={loading}
        >
          Import
        </Button>
      </div>
    </Modal>
  );
};
interface ImportBusinessProcessModalProps {
  isOpen: boolean;
  toggle: () => void;
}
