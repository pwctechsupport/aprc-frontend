import React, { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { FaFileExport, FaFileImport, FaTrash } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import {
  useAdminPolicyCategoriesQuery,
  useDestroyPolicyCategoriesMutation,
  useReviewerPolicyCategoriesStatusQuery,
} from "../../../generated/graphql";
import BreadCrumb from "../../../shared/components/BreadCrumb";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import CheckBox from "../../../shared/components/forms/CheckBox";
import ImportModal from "../../../shared/components/ImportModal";
import Pagination from "../../../shared/components/Pagination";
import Table from "../../../shared/components/Table";
import Tooltip from "../../../shared/components/Tooltip";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import useListState from "../../../shared/hooks/useList";
import downloadXls from "../../../shared/utils/downloadXls";
import {
  notifyGraphQLErrors,
  notifySuccess,
} from "../../../shared/utils/notif";

const PolicyCategoryLines = ({ history }: RouteComponentProps) => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);

  const [selected, setSelected] = useState<string[]>([]);

  const { limit, handlePageChange, page } = useListState({ limit: 10 });

  // Queries
  const {
    loading: loadingAdmin,
    data: dataAdmin,
  } = useAdminPolicyCategoriesQuery({
    skip: isAdminReviewer,
    variables: {
      filter: isAdminPreparer ? {} : { draft_event_null: true },
      limit,
      page,
    },
    fetchPolicy: "network-only",
  });
  const {
    loading: loadingReviewer,
    data: dataReviewer,
  } = useReviewerPolicyCategoriesStatusQuery({
    skip: isAdminPreparer || isUser,
    variables: {
      filter: {},
      limit,
      page,
    },
    fetchPolicy: "network-only",
  });
  const policyCategories =
    dataAdmin?.preparerPolicyCategories?.collection ||
    dataReviewer?.reviewerPolicyCategoriesStatus?.collection ||
    [];
  const totalCount =
    dataAdmin?.preparerPolicyCategories?.metadata.totalCount ||
    dataReviewer?.reviewerPolicyCategoriesStatus?.metadata.totalCount ||
    0;
  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal((p) => !p);
  const [destroy, destroyM] = useDestroyPolicyCategoriesMutation({
    onCompleted: () => {
      history.push("/policy-category");
      notifySuccess("Delete Success");
    },
    onError: notifyGraphQLErrors,
    refetchQueries: [
      "policyCategories",
      "adminPolicyCategories",
      "reviewerPolicyCategoriesStatus",
    ],
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
  const [clicked, setClicked] = useState(false);
  const clickButton = () => setClicked((p) => !p);
  function toggleCheckAll() {
    if (clicked) {
      setSelected(policyCategories.map((n) => n.id));
    } else {
      setSelected([]);
    }
  }
  useEffect(() => {
    toggleCheckAll();
  }, [clicked]);

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
      <Table reloading={loadingAdmin || loadingReviewer}>
        <thead>
          <tr>
            {isAdminReviewer ? (
              <th style={{ width: "5%" }}>
                <CheckBox
                  checked={selected.length === policyCategories.length}
                  onClick={clickButton}
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
                    <CheckBox
                      checked={selected.includes(policyCategory.id)}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        toggleCheck(policyCategory.id);
                      }}
                    />
                  </td>
                ) : null}

                <td>{policyCategory.name}</td>
                <td>{policyCategory.policy?.join(", ")}</td>
                <td>
                  {policyCategory.draft ||
                  policyCategory.status === "waiting_for_approval"
                    ? "Waiting for review"
                    : "Release"}
                </td>
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
      <Pagination
        totalCount={totalCount}
        perPage={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default PolicyCategoryLines;

export const PwcCheckInput = styled.input`
  &:after {
    width: 15px;
    height: 15px;

    top: -2px;
    left: -1px;
    position: relative;
    visibility: hidden;
    background-color: var(--primary-grey);
    content: "";
    display: inline-block;
    visibility: visible;
    border: 5px solid var(--primary-grey);
  }
  &:checked::after {
    width: 15px;
    height: 15px;
    top: -2px;
    left: -1px;
    position: relative;
    background-color: white;
    display: inline-block;
    visibility: visible;
    border: 5px solid var(--tangerine);
  }
`;
