import get from "lodash/get";
import React from "react";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import {
  PoliciesDocument,
  useDestroyPolicyMutation
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import PolicyForm from "./components/PolicyForm";

const Policy = ({ match, history }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
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

  return (
    <div>
      <div className="d-flex justify-content-between">
        <HeaderWithBackButton heading={`Policy ${id}`} />
        <Button
          onClick={handleDelete}
          loading={destroyState.loading}
          color="danger"
        >
          Delete
        </Button>
      </div>
      <PolicyForm />
    </div>
  );
};

export default Policy;
