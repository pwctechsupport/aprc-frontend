import React from "react";
import Helmet from "react-helmet";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import {
  useCreateRiskMutation,
  LevelOfRisk,
  TypeOfRisk,
} from "../../generated/graphql";
import HeaderWithBackButton from "../../shared/components/Header";
import RiskForm, { RiskFormValues } from "./components/RiskForm";
import BreadCrumb from "../../shared/components/BreadCrumb";

const CreateRisk = ({ history }: RouteComponentProps) => {
  const [createRisk, { loading }] = useCreateRiskMutation({
    onCompleted: (res) => {
      toast.success("Create Success");
      history.goBack();
    },
    onError: () => toast.error("Create Failed"),
    refetchQueries: ["risks", "adminRisks"],
    awaitRefetchQueries: true,
  });

  function handleSubmit(values: RiskFormValues) {
    createRisk({
      variables: {
        input: {
          name: values.name || '',
          businessProcessIds: values.businessProcessIds || [],
          levelOfRisk: values.levelOfRisk || LevelOfRisk.Low,
          typeOfRisk: values.typeOfRisk || TypeOfRisk.BusinessRisk,
        },
      },
    })
  }
  return (
    <div>
      <Helmet>
        <title>Create Risk - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb
        crumbs={[
          ["/risk", "Risks"],
          ["/risk/create", "Create risk"],
        ]}
      />
      <HeaderWithBackButton heading="Create risk" />
      <RiskForm
        onSubmit={handleSubmit}
        submitting={loading}
        history={history}
        isCreate
      />
    </div>
  );
};

export default CreateRisk;
