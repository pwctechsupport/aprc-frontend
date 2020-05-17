import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { useDebounce } from "use-debounce/lib";
import {
  CreateResourceInput,
  RemoveRelationInput,
  useRemoveRelationMutation,
  useCreateResourceMutation,
  PolicyQuery,
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
import { oc } from "ts-optchain";

export default function ResourcesTab({
  queryFilters,
  formDefaultValues,
  isDraft,
  policy,
  policyData,
}: {
  queryFilters: any;
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

  // Pagination state handlers
  const { limit, handlePageChange } = useListState({
    limit: 10,
  });

  const resourcesWithoutChildren = oc(policyData).policy.resources([]);
  const resourceFirstChild =
    policyData?.policy?.children?.map((a) => a.resources) || [];
  const resourceSecondChild =
    policyData?.policy?.children?.map((a: any) =>
      a.children.map((b: any) => b.resources)
    ) || [];
  const resourceThirdChild =
    policyData?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) => b.children.map((c: any) => c.resources))
    ) || [];
  const resourceFourthChild =
    policyData?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) =>
        b.children?.map((c: any) => c.children.map((d: any) => d.resources))
      )
    ) || [];
  const resourceFifthChild =
    policyData?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) =>
        b.children?.map((c: any) =>
          c.children.map((d: any) => d.children.map((e: any) => e.resources))
        )
      )
    ) || [];
  const newData = [
    ...resourcesWithoutChildren.flat(10),
    ...resourceFirstChild.flat(10),
    ...resourceSecondChild.flat(10),
    ...resourceThirdChild.flat(10),
    ...resourceFourthChild.flat(10),
    ...resourceFifthChild.flat(10),
  ];
  const [newDataResources, setNewDataResources] = useState(newData);

  useEffect(() => {
    if (
      !(isAdmin || isAdminReviewer || isAdminPreparer) &&
      newData === newDataResources
    ) {
      setNewDataResources(newData.filter((a: any) => a.draft !== null));
    }
  }, [isAdmin, isAdminReviewer, isAdminPreparer, newData, newDataResources]);

  const dataModifier = (a: any) => {
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) a.splice(j--, 1);
      }
    }
    return a;
  };

  // Query Resources for current policy
  const [search, setSearch] = useState("");
  // if(search!==''){
  //   setNewDataResources(newData.filter((a) => a.status === "release").includes(a=>a.status))
  // }
  const [searchQuery] = useDebounce(search, 700);

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
    refetchQueries: ["resources", "policy"],
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
    refetchQueries: ["resources", "policy"],
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
  const searchData = dataModifier(newDataResources).filter((a: any) =>
    a.name.toLowerCase().includes(searchQuery)
  );
  return (
    <div className="mt-3">
      <div className="w-40 d-flex justify-content-end align-items-center my-2">
        <SearchInput
          search={search}
          setSearch={setSearch}
          placeholder="Search Resources..."
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
      {/* Normal state */}
      {search !== "" ? null : dataModifier(newDataResources).length ? (
        dataModifier(newDataResources).map((resource: any) => (
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
      ) : (
        <EmptyAttribute centered>No Resource</EmptyAttribute>
      )}
      {/* Search State */}
      {search === "" ? null : searchData.length ? (
        searchData.map((resource: any) => (
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
      ) : (
        <EmptyAttribute centered>No Resource</EmptyAttribute>
      )}
      <Pagination
        totalCount={dataModifier(newDataResources).length || 0}
        perPage={limit}
        onPageChange={handlePageChange}
      />

      <Modal
        isOpen={addResourceModal}
        toggle={toggleAddResourceModal}
        title="Create Resource"
      >
        <ResourceForm
          defaultValues={formDefaultValues}
          onSubmit={handleCreateResource}
          submitting={createResourceM.loading}
          policy
        />
      </Modal>
    </div>
  );
}
