import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaFileExport, FaFileImport } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import PickIcon from "../../assets/Icons/PickIcon";
import {
  useAdminControlsQuery,
  useDestroyControlMutation,
  useReviewerControlsStatusQuery,
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import CheckBox from "../../shared/components/forms/CheckBox";
import ImportModal from "../../shared/components/ImportModal";
import Pagination from "../../shared/components/Pagination";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import useAccessRights from "../../shared/hooks/useAccessRights";
import useListState from "../../shared/hooks/useList";
import downloadXls from "../../shared/utils/downloadXls";
import { notifySuccess } from "../../shared/utils/notif";

const Controls = ({ history }: RouteComponentProps) => {
  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal((p) => !p);

  const [selected, setSelected] = useState<string[]>([]);
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);
  const { limit, handlePageChange, page } = useListState({ limit: 10 });
  const { loading: loadingAdmin, data: dataAdmin } = useAdminControlsQuery({
    skip: isAdminReviewer,
    fetchPolicy: "network-only",
    variables: {
      filter: isAdminPreparer ? {} : { draft_id_null: true },
      limit,
      page,
    },
  });
  const {
    loading: loadingReviewer,
    data: dataReviewer,
  } = useReviewerControlsStatusQuery({
    skip: isAdminPreparer || isUser,
    fetchPolicy: "network-only",
    variables: {
      filter: {},
      limit,
      page,
    },
  });
  const totalCount =
    dataAdmin?.preparerControls?.metadata.totalCount ||
    dataReviewer?.reviewerControlsStatus?.metadata.totalCount ||
    0;
  const controls =
    dataAdmin?.preparerControls?.collection ||
    dataReviewer?.reviewerControlsStatus?.collection ||
    [];
  const [destroy, destroyM] = useDestroyControlMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["controls", "adminControls", "reviewerControlsStatus"],
  });
  const handleDelete = (id: string) => {
    destroy({ variables: { id } });
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
      setSelected(controls.map((n) => n.id));
    } else {
      setSelected([]);
    }
  }

  function handleExport() {
    downloadXls(
      "/prints/control_excel.xlsx",
      {
        control_ids: selected.map(Number),
      },
      {
        fileName: "Controls.xlsx",
        onStart: () => toast.info("Download Start"),
        onCompleted: () => notifySuccess("Download Success"),
        onError: () => toast.error("Download Failed"),
      }
    );
  }
  const dataModifier = (a: any) => {
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) a.splice(j--, 1);
      }
    }
    return a;
  };
  return (
    <div>
      <Helmet>
        <title>Controls - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="w-100">
        <BreadCrumb crumbs={[["/control", "Controls"]]} />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 style={{ fontSize: "23px" }}>List of Controls</h4>
          {isAdminReviewer ? (
            <div className="d-flex">
              <Tooltip
                description="Export Control"
                subtitle={
                  selected.length
                    ? "Export selected control"
                    : "Select controls first"
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
              <Tooltip description="Import Control">
                <Button
                  color=""
                  className="soft orange mr-2"
                  onClick={toggleImportModal}
                >
                  <FaFileImport />
                </Button>
              </Tooltip>
              <ImportModal
                title="Import Controls"
                endpoint="/controls/import"
                isOpen={modal}
                toggle={toggleImportModal}
              />
            </div>
          ) : null}
          {isAdminPreparer ? (
            <Button tag={Link} to="/control/create" className="pwc">
              + Add control
            </Button>
          ) : null}
        </div>
        <div className="table-responsive">
          <Table reloading={loadingAdmin || loadingReviewer}>
            <thead>
              <tr>
                {isAdminReviewer ? (
                  <th>
                    <CheckBox
                      checked={selected.length === controls.length}
                      onClick={() => {
                        clickButton();
                        toggleCheckAll();
                      }}
                    />
                  </th>
                ) : null}

                <th>Description</th>
                <th>Frequency</th>
                <th style={{ width: "10%" }}>Type</th>
                <th style={{ width: "15%" }}>Ass. risk</th>
                <th style={{ width: "9%" }}>Nature</th>
                <th style={{ width: "9%" }}>Owner</th>
                <th style={{ width: "9%" }}>Status</th>
                <th style={{ width: "10%" }}>Last updated</th>
                <th style={{ width: "10%" }}>Last updated by</th>

                <th></th>
              </tr>
            </thead>
            <tbody>
              {controls.map((control) => {
                return (
                  <tr
                    key={control.id}
                    onClick={() => history.push(`/control/${control.id}`)}
                  >
                    {isAdminReviewer ? (
                      <td>
                        <CheckBox
                          checked={selected.includes(control.id)}
                          onClick={(e: any) => {
                            e.stopPropagation();
                            toggleCheck(control.id);
                          }}
                        />
                      </td>
                    ) : null}

                    <td style={{ width: 200 }}>{control.description}</td>
                    <td>{capitalCase(control.frequency || "")}</td>
                    <td>{capitalCase(control.typeOfControl || "")}</td>
                    <td>
                      {dataModifier(
                        oc(control)
                          .risks([])
                          .map((risk) => risk.name)
                      ).join(", ")}
                    </td>
                    <td>{capitalCase(control.nature || "")}</td>
                    <td>{control.controlOwner?.join(", ")}</td>
                    <td>{control.draft ? "Waiting for review" : "Release"}</td>
                    <td>
                      {control.updatedAt ? control.updatedAt.split(" ")[0] : ""}
                    </td>
                    <td>{control.lastUpdatedBy}</td>
                    {isAdminReviewer ? (
                      <td className="action">
                        <Tooltip description="Delete Control">
                          <DialogButton
                            onConfirm={() => handleDelete(control.id)}
                            loading={destroyM.loading}
                            message={`Delete "${control.description}"?`}
                            className="soft red"
                          >
                            <PickIcon name="trash" className="clickable" />
                          </DialogButton>
                        </Tooltip>
                      </td>
                    ) : (
                      <td></td>
                    )}
                  </tr>
                );
              })}
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

export default Controls;
