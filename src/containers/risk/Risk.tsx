import React from "react";
import { RouteComponentProps } from "react-router";
import {
  useRiskQuery,
  LevelOfRisk,
  Status,
  useUpdateRiskMutation,
  RisksDocument,
  RiskDocument
} from "../../generated/graphql";
import RiskForm, { RiskFormValues } from "./components/RiskForm";
import { oc } from "ts-optchain";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { toast } from "react-toastify";

const Risk = ({ match }: RouteComponentProps) => {
  const id = match.params && (match.params as any).id;
  const { data, loading } = useRiskQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });

  const defaultValues: RiskFormValues = {
    name: oc(data).risk.name(""),
    levelOfRisk: oc(data).risk.levelOfRisk(LevelOfRisk.Low) as LevelOfRisk,
    status: oc(data).risk.status(Status.Draft) as Status
  };

  const [update, updateRiskMutation] = useUpdateRiskMutation({
    onCompleted: () => toast.success("Update Success"),
    onError: () => toast.error("Update Failed"),
    refetchQueries: [
      { query: RisksDocument, variables: { filter: {} } },
      { query: RiskDocument, variables: { id } }
    ],
    awaitRefetchQueries: true
  });

  function handleUpdate(values: RiskFormValues) {
    update({
      variables: {
        input: {
          id,
          ...values
        }
      }
    });
  }

  if (loading) return <LoadingSpinner centered size={30} />;

  return (
    <div>
      <HeaderWithBackButton heading="Risk" />
      <RiskForm
        defaultValues={defaultValues}
        onSubmit={handleUpdate}
        submitting={updateRiskMutation.loading}
      />
    </div>
  );
};

export default Risk;
