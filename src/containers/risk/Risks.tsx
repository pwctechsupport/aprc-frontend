import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaFileExport, FaFileImport, FaTrash } from "react-icons/fa";
import { RouteComponentProps, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  RisksDocument,
  useDestroyRiskMutation,
  useRisksQuery,
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

const Risks = ({ history }: RouteComponentProps) => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);

  const { loading, data } = useRisksQuery({
    variables: { filter: isUser ? { draft_id_null: true } : {} },
    fetchPolicy: "network-only",
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal((p) => !p);

  const [destroy, destroyM] = useDestroyRiskMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: [
      {
        query: RisksDocument,
        variables: { filter: {} },
      },
    ],
  });

  const risks = oc(data).risks.collection([]);

  function handleDelete(id: string) {
    destroy({ variables: { id } });
  }

  function toggleCheck(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else {
      setSelected(selected.concat(id));
    }
  }

  function toggleCheckAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelected(risks.map((r) => r.id));
    } else {
      setSelected([]);
    }
  }

  function handleExport() {
    downloadXls(
      "/prints/risk_excel.xlsx",
      {
        risk_ids: selected.map(Number),
      },
      {
        fileName: "Risks.xlsx",
        onStart: () => toast.info("Download Start"),
        onCompleted: () => notifySuccess("Download Success"),
        onError: () => toast.error("Download Failed"),
      }
    );
  }

  return (
    <div>
      <Helmet>
        <title>Risks - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb crumbs={[["/risk", "Risks"]]} />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Risks</h4>
        {isAdminReviewer ? (
          <div className="d-flex">
            <Tooltip
              description="Export Risk"
              subtitle={
                selected.length ? "Export selected risk" : "Select risks first"
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
            <Tooltip description="Import Risk">
              <Button
                color=""
                className="soft orange mr-2"
                onClick={toggleImportModal}
              >
                <FaFileImport />
              </Button>
            </Tooltip>
            <ImportModal
              title="Import Risks"
              endpoint="/risks/import"
              isOpen={modal}
              toggle={toggleImportModal}
            />
          </div>
        ) : null}
        {isAdmin || isAdminPreparer ? (
          <Button tag={Link} to="/risk/create" className="pwc">
            + Add Risk
          </Button>
        ) : null}
      </div>
      <Table reloading={loading}>
        <thead>
          <tr>
            {isAdminReviewer ? (
              <th style={{ width: "5%" }}>
                <input
                  type="checkbox"
                  checked={selected.length === risks.length}
                  onChange={toggleCheckAll}
                />
              </th>
            ) : null}

            <th style={{ width: "13%" }}>Risk</th>

            <th style={{ width: "13%" }}>Risk Level</th>
            <th style={{ width: "13%" }}>Type of Risk</th>
            <th style={{ width: "13%" }}>Business Process</th>
            <th style={{ width: "13%" }}>Last Updated</th>
            <th style={{ width: "13%" }}>Last Updated By</th>

            <th style={{ width: "13%" }}>Status</th>

            <th></th>
          </tr>
        </thead>
        <tbody>
          {risks.map((risk) => {
            const bps = risk.businessProcesses?.map((a) => `, ${a.name}`) || [];
            bps[0] = risk.businessProcesses?.map((a) => `${a.name}`)[0] || "-";
            return (
              <tr
                key={risk.id}
                onClick={() => history.push(`/risk/${risk.id}`)}
              >
                {isAdminReviewer ? (
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(risk.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleCheck(risk.id)}
                    />
                  </td>
                ) : null}

                <td>{oc(risk).name("")}</td>
                <td>{capitalCase(oc(risk).levelOfRisk(""))}</td>
                <td>
                  {capitalCase(risk.typeOfRisk?.split("_").join(" ") || "")}
                </td>
                <td>{bps}</td>
                <td>{risk.updatedAt?.split(" ")[0]}</td>
                <td>{risk.lastUpdatedBy}</td>
                <td>{risk.status}</td>
                {isAdminReviewer ? (
                  <td className="action">
                    <DialogButton
                      onConfirm={() => handleDelete(risk.id)}
                      loading={destroyM.loading}
                      message={`Delete risk "${risk.name}"?`}
                      className="soft red"
                    >
                      <Tooltip description="Delete Risk">
                        <FaTrash />
                      </Tooltip>
                    </DialogButton>
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
  );
};

export default Risks;
