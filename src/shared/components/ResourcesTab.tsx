import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useDebounce } from "use-debounce/lib";
import {
  CreateResourceInput,
  RemoveRelationInput,
  useRemoveRelationMutation,
  useCreateResourceMutation,
  PolicyQuery,
  useResourcesQuery,
} from "../../generated/graphql";
import Button from "./Button";
import EmptyAttribute from "./EmptyAttribute";
import Modal from "./Modal";
import Pagination from "./Pagination";
import ResourceBar from "./ResourceBar";
import SearchInput from "./SearchInput";
import Tooltip from "./Tooltip";
import useListState from "../hooks/useList";
import { notifyGraphQLErrors, notifySuccess } from "../utils/notif";
import ResourceForm, {
  ResourceFormValues,
} from "../../containers/resources/components/ResourceForm";
import useAccessRights from "../hooks/useAccessRights";

export default function ResourcesTab({
  queryFilters,
  formDefaultValues,
  isDraft,
  policy,
  policyData,
  risksnControls,
}: {
  queryFilters: any;
  risksnControls?: boolean;
  formDefaultValues: ResourceFormValues;
  isDraft: any;
  policy?: boolean;
  policyData?: PolicyQuery;
}) {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);

  const isUser = !isAdmin && !isAdminReviewer && !isAdminPreparer;

  // Pagination state handlers
  const { limit, handlePageChange, page } = useListState({
    limit: 10,
  });

  const policyIdsWithoutChildren = policyData?.policy?.id;
  const policyIdFirstChild =
    policyData?.policy?.children?.map((a) => a.id) || [];
  const policyIdSecondChild =
    policyData?.policy?.children?.map((a: any) =>
      a.children.map((b: any) => b.id)
    ) || [];
  const policyIdThirdChild =
    policyData?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) => b.children.map((c: any) => c.id))
    ) || [];
  const policyIdFourthChild =
    policyData?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) =>
        b.children?.map((c: any) => c.children.map((d: any) => d.id))
      )
    ) || [];
  const policyIdFifthChild =
    policyData?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) =>
        b.children?.map((c: any) =>
          c.children.map((d: any) => d.children.map((e: any) => e.id))
        )
      )
    ) || [];
  const policyIds = [
    policyIdsWithoutChildren,
    ...policyIdFirstChild.flat(10),
    ...policyIdSecondChild.flat(10),
    ...policyIdThirdChild.flat(10),
    ...policyIdFourthChild.flat(10),
    ...policyIdFifthChild.flat(10),
  ];

  const [search, setSearch] = useState("");

  const [searchQuery] = useDebounce(search, 700);

  // Query for RISK AND CONTROL

  const { data, loading } = useResourcesQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: isUser
        ? policy
          ? {
              policies_id_matches_any: policyIds,
              draft_id_null: true,
              name_cont: searchQuery,
            }
          : {
              business_process_id_eq:
                formDefaultValues.businessProcessId?.value,
              name_cont: searchQuery,
              draft_id_null: true,
            }
        : policy
        ? {
            policies_id_matches_any: policyIds,
            name_cont: searchQuery,
          }
        : {
            business_process_id_eq: formDefaultValues.businessProcessId?.value,
            name_cont: searchQuery,
          },
      limit,
      page,
    },
  });
  const resources = data?.navigatorResources?.collection || [];
  const totalCount = data?.navigatorResources?.metadata.totalCount || 0;
  const policyId = queryFilters.policies_id_in;
  // Modal state handlers
  const [addResourceModal, setAddResourceModal] = useState(false);
  const toggleAddResourceModal = () => setAddResourceModal((prev) => !prev);

  // Create Resource handlers
  const [createResource, createResourceM] = useCreateResourceMutation({
    onCompleted: () => {
      notifySuccess("Resource Added");
      toggleAddResourceModal();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["resources", "recentResources"],
  });

  function handleCreateResource(values: ResourceFormValues) {
    const input: CreateResourceInput = {
      name: values.name || "",
      category: values.category?.value || "",
      resuploadBase64: values.resuploadBase64,
      policyIds: values.policyIds?.map((a) => a.value),
      controlIds: values.controlIds?.map((a) => a.value),
      businessProcessId: values.businessProcessId?.value,
      resuploadLink: values.resuploadLink,
    };
    createResource({
      variables: {
        input,
      },
    });
  }
  const [removeRelationPolicy] = useRemoveRelationMutation({
    onCompleted: () => {
      notifySuccess("Resource Deleted");
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["resources", "policy", "recentResources"],
  });
  function handleDeleteResource(resourceId: string) {
    const input: RemoveRelationInput = policy
      ? {
          originatorId: policyId,
          originatorType: "Policy",
          resourceId: resourceId,
        }
      : {
          originatorId: resourceId,
          originatorType: "BusinessProcess",
        };
    removeRelationPolicy({
      variables: {
        input,
      },
    });
  }

  return (
    <div className="mt-3">
      <div className="w-40 d-flex justify-content-end align-items-center my-2">
        <SearchInput
          search={search}
          setSearch={setSearch}
          placeholder="Search Resources..."
          loading={loading}
        />
        {isDraft === null && (isAdmin || isAdminPreparer) && (
          <Tooltip description="Create Resource">
            <Button
              onClick={toggleAddResourceModal}
              color=""
              className="soft red ml-2"
            >
              <FaPlus />
            </Button>
          </Tooltip>
        )}
      </div>

      {resources.length ? (
        resources.map((resource: any) => (
          <ResourceBar
            rating={resource.rating}
            deleteResource={handleDeleteResource}
            totalRating={resource.totalRating}
            visit={resource.visit}
            key={resource.id}
            resourceId={resource.id}
            {...resource}
          />
        ))
      ) : !policy ? (
        <EmptyAttribute centered>No Resource</EmptyAttribute>
      ) : null}

      <Pagination
        totalCount={totalCount}
        perPage={limit}
        onPageChange={handlePageChange}
      />

      <Modal
        isOpen={addResourceModal}
        toggle={toggleAddResourceModal}
        title="Create Resource"
      >
        <ResourceForm
          risksnControls
          defaultValues={formDefaultValues}
          onSubmit={handleCreateResource}
          submitting={createResourceM.loading}
          policy
        />
      </Modal>
    </div>
  );
}
