import React from "react";
import Helmet from "react-helmet";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { useCreateRiskMutation } from "../../generated/graphql";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import RiskForm, { RiskFormValues } from "./components/RiskForm";

const CreateRisk = ({ history }: RouteComponentProps) => {
  const [createRisk, { loading }] = useCreateRiskMutation({
    onCompleted: res => {
      toast.success("Create Success");
      history.goBack();
    },
    onError: () => toast.error("Create Failed"),
    refetchQueries: ["risks"],
    awaitRefetchQueries: true
  });

  function handleSubmit(values: RiskFormValues) {
    createRisk({
      variables: {
        input: values
      }
    });
  }
  return (
    <div>
      <Helmet>
        <title>Create Risk - PricewaterhouseCoopers</title>
      </Helmet>
      <HeaderWithBackButton heading="Create Risk" />
      <RiskForm onSubmit={handleSubmit} submitting={loading} />
    </div>
  );
};

export default CreateRisk;
