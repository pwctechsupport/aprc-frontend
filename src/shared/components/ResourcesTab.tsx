import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useDebounce } from "use-debounce/lib";
import {
  CreateResourceInput,
  useCreateResourceMutation,
  useResourcesQuery
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
  ResourceFormValues
} from "../../containers/resources/components/ResourceForm";

export default function ResourcesTab({
  queryFilters,
  formDefaultValues
}: {
  queryFilters: any;
  formDefaultValues: ResourceFormValues;
}) {
  // Pagination state handlers
  const { limit, page, handlePageChange } = useListState({
    limit: 10,
    page: 1
  });

  // Query Resources for current policy
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const { data, loading } = useResourcesQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: {
        name_cont: debouncedSearch,
        // policies_id_in: policyId,
        ...queryFilters
      },
      limit,
      page
    }
  });
  const resources = data?.resources?.collection || [];
  const totalCount = data?.resources?.metadata?.totalCount || 0;
  // Modal state handlers
  const [addResourceModal, setAddResourceModal] = useState(false);
  const toggleAddResourceModal = () => setAddResourceModal(prev => !prev);

  // Create Resource handlers
  const [createResource, createResourceM] = useCreateResourceMutation({
    onCompleted: () => {
      notifySuccess("Resource Added");
      toggleAddResourceModal();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["resources"]
  });
  function handleCreateResource(values: ResourceFormValues) {
    const input: CreateResourceInput = {
      name: values.name || "",
      category: values.category?.value || "",
      resuploadBase64: values.resuploadBase64,
      policyIds: values.policyIds?.map(a => a.value),
      controlIds: values.controlIds?.map(a => a.value),
      businessProcessId: values.businessProcessId?.value,
      resuploadLink: values.resuploadLink
    };
    createResource({
      variables: {
        input
      }
    });
  }

  return (
    <div className="mt-3">
      <div className="w-40 d-flex justify-content-end align-items-center my-2">
        <SearchInput
          search={search}
          setSearch={setSearch}
          loading={loading}
          placeholder="Search Resources..."
        />
        <Tooltip description="Create Resource">
          <Button
            onClick={toggleAddResourceModal}
            color=""
            className="soft red ml-2"
          >
            <FaPlus />
          </Button>
        </Tooltip>
      </div>
      {resources.length ? (
        resources.map(resource => (
          <ResourceBar visit={resource.visit} key={resource.id} {...resource} />
        ))
      ) : (
        <EmptyAttribute centered>No Resource</EmptyAttribute>
      )}

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
          defaultValues={formDefaultValues}
          onSubmit={handleCreateResource}
          submitting={createResourceM.loading}
        />
      </Modal>
    </div>
  );
}
