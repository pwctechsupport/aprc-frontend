import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaFileExport, FaFileImport } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import PickIcon from "../../assets/Icons/PickIcon";
import {
  useAdminRisksQuery,
  useDestroyRiskMutation,
  useReviewerRisksStatusQuery,
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

const Risks = ({ history }: RouteComponentProps) => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);
  const { limit, handlePageChange, page } = useListState({ limit: 10 });

  const { loading: loadingAdmin, data: dataAdmin } = useAdminRisksQuery({
    skip: isAdminReviewer,
    variables: {
      filter: isUser ? { draft_id_null: true } : {},
      limit,
      page,
    },
    fetchPolicy: "network-only",
  });
  const {
    loading: loadingReviewer,
    data: dataReviewer,
  } = useReviewerRisksStatusQuery({
    skip: isAdminPreparer || isUser,
    variables: {
      filter: {},
      limit,
      page,
    },
    fetchPolicy: "network-only",
  });
  const totalCount =
    dataAdmin?.preparerRisks?.metadata.totalCount ||
    dataReviewer?.reviewerRisksStatus?.metadata.totalCount ||
    0;
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal((p) => !p);

  const [destroy, destroyM] = useDestroyRiskMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["reviewerRisksStatus", "adminRisks", "risks"],
    awaitRefetchQueries: true,
  });

  const risks =
    dataAdmin?.preparerRisks?.collection ||
    dataReviewer?.reviewerRisksStatus?.collection ||
    [];

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
  const [clicked, setClicked] = useState(true);
  const clickButton = () => setClicked((p) => !p);

  function toggleCheckAll() {
    if (clicked) {
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
        <h4 style={{ fontSize: "23px" }}>List of Risks</h4>
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
            + Add risk
          </Button>
        ) : null}
      </div>
      <Table responsive reloading={loadingAdmin || loadingReviewer}>
        <thead>
          <tr>
            {isAdminReviewer ? (
              <th style={{ width: "5%" }}>
                <CheckBox
                  checked={selected.length === risks.length}
                  onClick={() => {
                    clickButton();
                    toggleCheckAll();
                  }}
                />
              </th>
            ) : null}

            <th style={{ width: "13%" }}>Risk</th>

            <th style={{ width: "13%" }}>Level of risk</th>
            <th style={{ width: "13%" }}>Type of risk</th>
            <th style={{ width: "13%" }}>Business Process</th>
            <th style={{ width: "13%" }}>Last updated</th>
            <th style={{ width: "13%" }}>Last updated by</th>

            <th style={{ width: "13%" }}>Status</th>

            <th></th>
          </tr>
        </thead>
        <tbody>
          {risks.map((risk) => {
            const bps = risk.businessProcesses?.map(b => b.name).join(', ')
              || risk.businessProcess?.join(', ')
              || '-';

            return (
              <tr
                key={risk.id}
                onClick={() => history.push(`/risk/${risk.id}`)}
              >
                {isAdminReviewer ? (
                  <td>
                    <CheckBox
                      checked={selected.includes(risk.id)}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        toggleCheck(risk.id);
                      }}
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
                <td>{risk.draft ? "Waiting for review" : "Release"}</td>
                {isAdminReviewer ? (
                  <td className="action">
                    <DialogButton
                      onConfirm={() => handleDelete(risk.id)}
                      loading={destroyM.loading}
                      message={`Delete risk "${risk.name}"?`}
                      className="soft red"
                    >
                      <Tooltip description="Delete Risk">
                        <PickIcon name="trash" className="clickable" />
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
      </Table>{" "}
      <Pagination
        totalCount={totalCount}
        perPage={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Risks;
