import React, { useState } from "react";
import Helmet from "react-helmet";
import {
  usePolicyCategoriesQuery,
  useDestroyPolicyCategoriesMutation,
  useAdminPolicyCategoriesQuery,
} from "../../../generated/graphql";
import Table from "../../../shared/components/Table";
import { RouteComponentProps, Link } from "react-router-dom";
import { oc } from "ts-optchain";
import BreadCrumb from "../../../shared/components/BreadCrumb";
import Tooltip from "../../../shared/components/Tooltip";
import Button from "../../../shared/components/Button";
import { FaFileExport, FaFileImport, FaTrash } from "react-icons/fa";
import ImportModal from "../../../shared/components/ImportModal";
import {
  notifySuccess,
  notifyGraphQLErrors,
} from "../../../shared/utils/notif";
import { toast } from "react-toastify";
import downloadXls from "../../../shared/utils/downloadXls";
import DialogButton from "../../../shared/components/DialogButton";
import useAccessRights from "../../../shared/hooks/useAccessRights";

const PolicyCategoryLines = ({ history }: RouteComponentProps) => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);

  const [selected, setSelected] = useState<string[]>([]);

  // Queries
  const {
    loading: loadingAdmin,
    data: dataAdmin,
  } = useAdminPolicyCategoriesQuery({
    skip: isUser,
    variables: {
      filter: isAdminPreparer ? {} : { draft_event_not_null: true },
    },
    fetchPolicy: "network-only",
  });

  const { loading, data } = usePolicyCategoriesQuery({
    skip: !isUser,
    variables: { filter: { draft_event_null: true } },
    fetchPolicy: "network-only",
  });
  const policyCategories =
    data?.navigatorPolicyCategories?.collection ||
    dataAdmin?.preparerPolicyCategories?.collection ||
    [];

  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal((p) => !p);
  const [destroy, destroyM] = useDestroyPolicyCategoriesMutation({
    onCompleted: () => {
      history.push("/policy-category");
      notifySuccess("Delete Success");
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["policyCategories"],
    awaitRefetchQueries: true,
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
      setSelected(policyCategories.map((n) => n.id));
    } else {
      setSelected([]);
    }
  }

  function handleExport() {
    downloadXls(
      "/prints/policy_category_excel.xlsx",
      {
        policy_category_ids: selected.map(Number),
      },
      {
        fileName: "Policy Categories.xlsx",
        onStart: () => toast.info("Download Start"),
        onCompleted: () => notifySuccess("Download Success"),
        onError: () => toast.error("Download Failed"),
      }
    );
  }
  return (
    <div>
      <Helmet>
        <title>Policy Category - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="w-100">
        <BreadCrumb crumbs={[["/policyCategory", "Policy Category"]]} />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Policy Category</h4>
          {isAdminReviewer ? (
            <div className="d-flex">
              <Tooltip
                description="Export Policy Categories"
                subtitle={
                  selected.length
                    ? "Export selected policy categories"
                    : "Select policy categories first"
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
              <Tooltip description="Import Policy Categories">
                <Button
                  color=""
                  className="soft orange mr-2"
                  onClick={toggleImportModal}
                >
                  <FaFileImport />
                </Button>
              </Tooltip>
              <ImportModal
                title="Import Policy Categories"
                endpoint="/policy_categories/import"
                isOpen={modal}
                toggle={toggleImportModal}
              />
            </div>
          ) : null}
          {isAdminPreparer ? (
            <Button tag={Link} to="/policy-category/create" className="pwc">
              + Add Policy Category
            </Button>
          ) : null}
        </div>
      </div>
      <Table reloading={loading || loadingAdmin}>
        <thead>
          <tr>
            {isAdminReviewer ? (
              <th style={{ width: "5%" }}>
                <input
                  type="checkbox"
                  checked={selected.length === policyCategories.length}
                  onChange={toggleCheckAll}
                />
              </th>
            ) : null}

            <th style={{ width: "10%" }}>Category Name</th>
            <th style={{ width: "45%" }}>Related Policies</th>
            <th style={{ width: "15%" }}>Status</th>
            <th style={{ width: "12%" }}>Last Updated</th>
            <th style={{ width: "12%" }}>Last Updated By</th>

            <th></th>
          </tr>
        </thead>
        <tbody>
          {policyCategories.map((policyCategory) => {
            return (
              <tr
                key={policyCategory.id}
                onClick={() =>
                  history.push(`/policy-category/${policyCategory.id}`)
                }
              >
                {isAdminReviewer ? (
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(policyCategory.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleCheck(policyCategory.id)}
                    />
                  </td>
                ) : null}

                <td>{policyCategory.name}</td>
                <td>
                  {oc(policyCategory)
                    .policies([])
                    .map((policy) => policy.title)
                    .join(", ")}
                </td>
                <td>{policyCategory.status}</td>
                <td>{policyCategory.updatedAt.split(" ")[0]}</td>
                <td>{policyCategory.lastUpdatedBy}</td>
                {isAdminReviewer ? (
                  <td className="action">
                    <Tooltip description="Delete Policy Category">
                      <DialogButton
                        onConfirm={() => handleDelete(policyCategory.id)}
                        loading={destroyM.loading}
                        message={`Delete "${policyCategory.name}"?`}
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
  );
};

export default PolicyCategoryLines;
