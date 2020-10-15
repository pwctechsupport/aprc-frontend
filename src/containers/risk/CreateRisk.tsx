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
import { notifyError } from "../../shared/utils/notif";

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
    if(values.businessProcessFirst === undefined && values.businessProcessSecond === undefined && values.businessProcessMain !== undefined ){
      notifyError("The main business process must have at least 1 sub business process level and that sub business  process must be selected")
    } else{
    createRisk({
      variables: {
        input: {
          name: values.name || "",
          businessProcessIds: values.businessProcessIds || [],
          levelOfRisk: values.levelOfRisk || LevelOfRisk.Low,
          typeOfRisk: values.typeOfRisk || TypeOfRisk.BusinessRisk,
        },
      },
    })};
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
