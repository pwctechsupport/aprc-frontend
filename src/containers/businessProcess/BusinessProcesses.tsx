import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaFileExport, FaFileImport, FaTrash } from "react-icons/fa";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  useAdminBusinessProcessTreeQuery,
  useDestroyBusinessProcessMutation,
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import CheckBox from "../../shared/components/forms/CheckBox";
import ImportModal from "../../shared/components/ImportModal";
import Modal from "../../shared/components/Modal";
import Pagination from "../../shared/components/Pagination";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import useAccessRights from "../../shared/hooks/useAccessRights";
import useListState from "../../shared/hooks/useList";
import downloadXls from "../../shared/utils/downloadXls";
import CreateBusinessProcess from "./CreateBusinessProcess";
import PickIcon from "../../assets/Icons/PickIcon";

const BusinessProcesses = ({ history }: RouteComponentProps) => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal((p) => !p);

  const [createBpModal, setCreateBpModal] = useState(false);
  const toggleCreateBpModal = () => setCreateBpModal((p) => !p);

  const [selected, setSelected] = useState<string[]>([]);
  const [searchValue] = useState("");
  const [searchQuery] = useDebounce(searchValue, 700);

  const isTree = !searchQuery;
  const { limit, handlePageChange, page } = useListState({ limit: 10 });

  const adminBusinessQuery = useAdminBusinessProcessTreeQuery({
    variables: {
      filter: {
        name_cont: searchQuery,
        ...(isTree && { ancestry_null: true }),
      },
      limit,
      page,
      isTree,
    },
  });
  const totalCount =
    adminBusinessQuery.data?.preparerBusinessProcesses?.metadata.totalCount ||
    0;
  const bps =
    oc(adminBusinessQuery).data.preparerBusinessProcesses.collection() || [];
  const [destroy, destroyM] = useDestroyBusinessProcessMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["businessProcesses", "adminBusinessProcessTree"],
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

  const [clicked, setClicked] = useState(true);
  const clickButton = () => setClicked((p) => !p);

  function toggleCheckAll() {
    if (clicked) {
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
        onStart: () => toast.info("Download Started"),
        onCompleted: () => toast.success("Downloaded"),
        onError: () => toast.error("Download Failed"),
      }
    );
  }

  return (
    <div>
      <BreadCrumb crumbs={[["/business-process", "Business processes"]]} />
      <div className="d-flex">
        <Helmet>
          <title>Business Process - PricewaterhouseCoopers</title>
        </Helmet>
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 style={{ fontSize: "23px" }}>Business process</h4>
            {isAdmin || isAdminPreparer ? (
              <Tooltip description="Create business process">
                <Button onClick={toggleCreateBpModal} className="pwc">
                  + Add business process
                </Button>
              </Tooltip>
            ) : null}
            {isAdminReviewer ? (
              <div className="d-flex">
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
                <Tooltip description="Import Business Process">
                  <Button
                    color=""
                    className="soft orange mr-2"
                    onClick={toggleImportModal}
                  >
                    <FaFileImport />
                  </Button>
                </Tooltip>
              </div>
            ) : null}

            {isAdminReviewer ? (
              <ImportModal
                title="Import Business Process"
                endpoint="/business_processes/import"
                isOpen={modal}
                toggle={toggleImportModal}
              />
            ) : null}
          </div>
          <Modal
            isOpen={createBpModal}
            toggle={toggleCreateBpModal}
            title="Create business process"
          >
            <CreateBusinessProcess createBpModal={setCreateBpModal} />
          </Modal>
          <Table responsive reloading={adminBusinessQuery.loading}>
            <thead>
              <tr>
                {isAdminReviewer ? (
                  <th>
                    <CheckBox
                      checked={selected.length === bps.length}
                      onClick={() => {
                        clickButton();
                        toggleCheckAll();
                      }}
                    />
                  </th>
                ) : null}

                <th>Business process</th>
                <th>Last updated</th>
                <th>Last updated by</th>
                <th>Created at</th>
                <th>Created by</th>

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
                      <CheckBox
                        checked={selected.includes(item.id)}
                        onClick={(e: any) => {
                          e.stopPropagation();
                          toggleCheck(item.id);
                        }}
                      />
                    </td>
                  ) : null}

                  <td>{item.name}</td>
                  <td>{item.updatedAt.split("T")[0]}</td>
                  <td>{item.lastUpdatedBy}</td>
                  <td>{item.createdAt.split("T")[0]}</td>
                  <td>{item.createdBy}</td>
                  {isAdminReviewer ? (
                    <td className="action">
                      <DialogButton
                        onConfirm={() => handleDelete(item.id)}
                        loading={destroyM.loading}
                        message={`Delete Business Process "${item.name}"?`}
                        className="soft red"
                      >
                        <Tooltip description="Delete Business Process">
                          <PickIcon className="clickable" name="trash" />
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
          <Pagination
            totalCount={totalCount}
            perPage={limit}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessProcesses;
