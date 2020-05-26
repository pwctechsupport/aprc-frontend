import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaFileExport, FaFileImport, FaTrash } from "react-icons/fa";
import { RouteComponentProps, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  useDestroyControlMutation,
  useAdminControlsQuery,
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import ImportModal from "../../shared/components/ImportModal";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import downloadXls from "../../shared/utils/downloadXls";
import { notifySuccess } from "../../shared/utils/notif";
import useAccessRights from "../../shared/hooks/useAccessRights";

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

  const { loading: loadingAdmin, data: dataAdmin } = useAdminControlsQuery({
    variables: {
      filter: isAdminPreparer
        ? {}
        : isUser
        ? { status_eq: "release" }
        : { status_eq: "draft" },
    },
  });
  const controls = dataAdmin?.preparerControls?.collection || [];

  const [destroy, destroyM] = useDestroyControlMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["controls", "adminControls"],
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

  function toggleCheckAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
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

  return (
    <div>
      <Helmet>
        <title>Controls - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="w-100">
        <BreadCrumb crumbs={[["/control", "Controls"]]} />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Controls</h4>
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
              + Add Control
            </Button>
          ) : null}
        </div>
        <div className="table-responsive">
          <Table reloading={loadingAdmin}>
            <thead>
              <tr>
                {isAdminReviewer ? (
                  <th>
                    <input
                      type="checkbox"
                      checked={selected.length === controls.length}
                      onChange={toggleCheckAll}
                    />
                  </th>
                ) : null}

                <th>Description</th>
                <th>Freq</th>
                <th style={{ width: "10%" }}>Type</th>
                <th style={{ width: "15%" }}>Ass. Risk</th>
                <th style={{ width: "9%" }}>Nature</th>
                <th style={{ width: "9%" }}>Owner</th>
                <th style={{ width: "9%" }}>status</th>
                <th style={{ width: "10%" }}>Last Updated</th>
                <th style={{ width: "10%" }}>Last Updated By</th>

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
                        <input
                          type="checkbox"
                          checked={selected.includes(control.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleCheck(control.id)}
                        />
                      </td>
                    ) : null}

                    <td style={{ width: 200 }}>{control.description}</td>
                    <td>{capitalCase(control.frequency || "")}</td>
                    <td>{capitalCase(control.typeOfControl || "")}</td>
                    <td>
                      {oc(control)
                        .risks([])
                        .map((risk) => risk.name)
                        .join(", ")}
                    </td>
                    <td>{capitalCase(control.nature || "")}</td>
                    <td>{control.controlOwner}</td>
                    <td>
                      {control.status
                        ?.split("_")
                        .map(
                          (a) =>
                            a.charAt(0).toUpperCase() +
                            a.substr(1).toLowerCase()
                        )
                        .join(" ")}
                    </td>
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
                            <FaTrash className="clickable" />
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
        </div>
      </div>
    </div>
  );
};

export default Controls;
