import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { FaFileExport, FaFileImport, FaTimes } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { Input } from "reactstrap";
import { oc } from "ts-optchain";
import PickIcon from "../../assets/Icons/PickIcon";
import {
  Reference,
  useAdminReferencesQuery,
  useDestroyReferenceMutation,
  useUpdateReferenceMutation,
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import AsyncSelect from "../../shared/components/forms/AsyncSelect";
import CheckBox from "../../shared/components/forms/CheckBox";
import ImportModal from "../../shared/components/ImportModal";
import Pagination from "../../shared/components/Pagination";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import { Suggestions, toLabelValue } from "../../shared/formatter";
import useAccessRights from "../../shared/hooks/useAccessRights";
import useLazyQueryReturnPromise from "../../shared/hooks/useLazyQueryReturnPromise";
import useListState from "../../shared/hooks/useList";
import downloadXls from "../../shared/utils/downloadXls";
import {
  notifyError,
  notifyGraphQLErrors,
  notifyInfo,
  notifySuccess,
} from "../../shared/utils/notif";
import { gql } from "apollo-boost";
import DateHover from "../../shared/components/DateHover";

const References = ({ history }: RouteComponentProps) => {
  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal((p) => !p);
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const { limit, handlePageChange, page } = useListState({ limit: 10 });

  const { data: dataAdmin, loading: loadingAdmin } = useAdminReferencesQuery({
    fetchPolicy: "network-only",
    variables: { limit, page },
  });
  const totalCount = dataAdmin?.preparerReferences?.metadata.totalCount || 0;
  const references = dataAdmin?.preparerReferences?.collection || [];

  const [selected, setSelected] = useState<string[]>([]);
  const [destroyReference, destroyM] = useDestroyReferenceMutation({
    refetchQueries: ["references", "adminReferences"],
    onCompleted: () => notifySuccess("Delete Success"),
    onError: notifyGraphQLErrors,
  });
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
      setSelected(references.map((n) => n.id));
    } else {
      setSelected([]);
    }
  }

  function handleExport() {
    downloadXls(
      "/prints/reference_excel.xlsx",
      {
        reference_ids: selected.map(Number),
      },
      {
        fileName: "Policy Reference.xlsx",
        onStart: () => notifyInfo("Download Started"),
        onCompleted: () => notifySuccess("Downloaded"),
        onError: () => notifyError("Download Failed"),
      }
    );
  }

  return (
    <div>
      <Helmet>
        <title>References - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="w-100">
        <BreadCrumb crumbs={[["/references", "Policy Reference Administrative"]]} />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 style={{ fontSize: "23px" }}>List of Policy References</h4>

          {isAdminReviewer ? (
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
          ) : null}
          {(isAdmin || isAdminPreparer) && (
            <Button tag={Link} to="/references/create" className="pwc">
              + Add reference
            </Button>
          )}
        </div>
      </div>
      <Table responsive reloading={loadingAdmin}>
        <thead>
          <tr>
            {isAdminReviewer ? (
              <th style={{ width: "5%" }}>
                <CheckBox
                  checked={selected.length === references.length}
                  onClick={() => {
                    clickButton();
                    toggleCheckAll();
                  }}
                />
              </th>
            ) : null}

            <th style={{ width: "5%" }}>Name</th>
            <th style={{ width: "30%" }}>Policy</th>
            <th style={{ width: "10%" }}>Last updated</th>
            <th style={{ width: "10%" }}>Last updated by</th>
            <th style={{ width: "10%" }}>Created at</th>
            <th style={{ width: "10%" }}>Created by</th>

            <th></th>
          </tr>
        </thead>
        <tbody>
          {references.map((reference) => {
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
                onClick={(id: any) => history.push(`/references/${id}`)}
              />
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

export default References;

const ReferenceRow = ({
  reference,
  onDelete,
  deleteLoading,
  selected,
  toggleCheck,
  onClick,
}: ReferenceRowProps) => {
  const { register, handleSubmit, setValue, reset } = useForm<ReferenceRowFormValues>({
    defaultValues: {
      name: reference.name || "",
      policyIds: oc(reference)
        .policies([])
        .map(toLabelValue),
    },
  });

  useEffect(() => { reset({ name: reference.name || '' }) }, [reference]) //reset reference form values after update

  const getPolicies = useLazyQueryReturnPromise(PoliciesDocument);
  async function handleGetPolicies(input: string) {
    try {
      return oc(await getPolicies({ filter: { title_cont: input } }))
        .data.policies.collection([])
        .map(toLabelValue);
    } catch (error) {
      return [];
    }
  }
  const [edit, setEdit] = useState(false);
  const toggleEdit = () => setEdit((p) => !p);
  const [update, updateM] = useUpdateReferenceMutation({
    awaitRefetchQueries: true,
    refetchQueries: ["references", "adminReferences"],
    onCompleted: () => {
      notifySuccess("Update Success");
      toggleEdit();
    },
    onError: notifyGraphQLErrors,
  });

  function updateReference(values: ReferenceRowFormValues) {
    update({
      variables: {
        input: {
          id: reference.id || "",
          name: values.name,
          policyIds: (values.policyIds || []).map((a) => a.value),
        },
      },
    });
  }
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  return (
    <tr
      key={reference.id}
      onClick={
        !edit
          ? () => {
              onClick(reference.id);
            }
          : () => {}
      }
    >
      {isAdminReviewer ? (
        <td>
          <CheckBox
            checked={selected}
            onClick={(e: any) => {
              e.stopPropagation();
              toggleCheck();
            }}
          />
        </td>
      ) : null}
      <td
        className="align-middle"
        style={{ width: "20%" }}
      >
        {edit ? (
          <Input
            className="p-0 m-0"
            name="name"
            defaultValue={reference.name || ""}
            innerRef={register}
          />
        ) : (
          reference.name
        )}
      </td>

      <td className="align-middle">
        {edit ? (
          <AsyncSelect
            row
            formGroupClassName="mb-0"
            isMulti
            cacheOptions
            defaultOptions
            name="policyIds"
            register={register}
            setValue={setValue}
            loadOptions={handleGetPolicies}
            defaultValue={oc(reference)
              .policies([])
              .map(toLabelValue)}
          />
        ) : (
          reference.policies?.map((a) => a.title).join(", ")
        )}
      </td>
      <td>
        <DateHover humanize={false}>
          {reference.updatedAt.split("T")[0]}
        </DateHover>
      </td>
      <td>{reference.lastUpdatedBy}</td>
      <td>
        <DateHover humanize={false}>
          {reference.createdAt.split("T")[0]}
        </DateHover>
      </td>
      <td>{reference.createdBy}</td>
      {isAdmin || isAdminReviewer || isAdminPreparer ? (
        <td
          className="align-middle text-right action"
          style={{ width: "30%" }}
        >
          <div className="d-flex align-items-center justify-content-end">
            {edit ? (
              <div style={{width: 'max-content'}}>
                <Button
                  onClick={toggleEdit}
                  type="button"
                  className="mr-2 button cancel w-95px"
                >
                  Cancel
                </Button>
                <DialogButton
                  onConfirm={handleSubmit(updateReference)}
                  className="add"
                  loading={updateM.loading}
                  color="primary"
                  message="Save reference?"
                >
                  Save
                </DialogButton>
              </div>
            ) : (
              <div className="d-flex">
                {(isAdminPreparer || isAdmin) && (
                  <Button
                    color=""
                    onClick={(e) => {
                      toggleEdit();
                      e?.stopPropagation();
                    }}
                    className="soft orange mr-2"
                  >
                    <Tooltip description="Edit Reference">
                      <PickIcon name="pencilFill" />
                    </Tooltip>
                  </Button>
                )}
                {isAdminReviewer && (
                  <DialogButton
                    onConfirm={onDelete}
                    loading={deleteLoading}
                    message={`Delete ${reference.name}?`}
                    className="soft red"
                  >
                    <Tooltip description="Delete Reference">
                      <PickIcon name="trash" className="clickable" />
                    </Tooltip>
                  </DialogButton>
                )}
              </div>
            )}
          </div>
        </td>
      ) : (
        <td></td>
      )}
    </tr>
  );
};

const PoliciesDocument = gql`
  query policies(
    $filter: BaseScalar = {}
    $limit: Int
  ) {
    policies(filter: $filter, limit: $limit) {
      collection {
        id
        title
      }
      metadata {
        totalCount
        currentPage
        totalPages
        limitValue
      }
    }
  }
`;

interface ReferenceRowProps {
  reference: Partial<Reference>;
  onDelete: () => void;
  deleteLoading: boolean;
  selected: boolean;
  toggleCheck: any;
  onClick: any;
}
interface ReferenceRowFormValues {
  name: string;
  policyIds: Suggestions;
}
