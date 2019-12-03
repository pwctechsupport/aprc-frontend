import get from "lodash/get";
import React from "react";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import {
  PoliciesDocument,
  useDestroyPolicyMutation,
  usePolicyQuery,
  useUpdatePolicyMutation,
  PolicyDocument
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import PolicyForm, { PolicyFormValues } from "./components/PolicyForm";
import { oc } from "ts-optchain";

const Policy = ({ match, history }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  const { loading, data } = usePolicyQuery({ variables: { id } });
  const [update, updateState] = useUpdatePolicyMutation({
    onCompleted: () => toast("Update Success"),
    onError: () => toast("Update Failed"),
    refetchQueries: [{ query: PolicyDocument, variables: { id } }],
    awaitRefetchQueries: true
  });
  const [destroy, destroyState] = useDestroyPolicyMutation({
    onCompleted: () => {
      toast("Delete Success");
      history.push("/policy");
    },
    onError: () => toast("Delete Failed"),
    refetchQueries: [{ query: PoliciesDocument }],
    awaitRefetchQueries: true
  });

  function handleDelete() {
    destroy({ variables: { id } });
  }

  function handleUpdate(values: PolicyFormValues) {
    update({
      variables: {
        input: {
          id,
          title: values.title,
          policyCategoryId: values.policyCategoryId,
          description: values.description
        }
      }
    });
  }

  if (loading) return null;

  const title = oc(data).policy.title("");
  const description = oc(data).policy.description("");
  const policyCategoryId = oc(data).policy.policyCategory.id("");

  return (
    <div>
      <div className="d-flex justify-content-between">
        <HeaderWithBackButton heading={`Policy ${title}`} />
        <Button
          onClick={handleDelete}
          loading={destroyState.loading}
          color="danger"
        >
          Delete
        </Button>
      </div>
      <PolicyForm
        onSubmit={handleUpdate}
        defaultValues={{ title, policyCategoryId, description }}
        submitting={updateState.loading}
      />
    </div>
  );
};

export default Policy;
