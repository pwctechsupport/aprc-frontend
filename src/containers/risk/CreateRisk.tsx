import React from "react";
// import PolicyForm, { PolicyFormValues } from "./components/PolicyForm";
// import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import { RouteComponentProps } from "react-router";
import RiskForm, { RiskFormValues } from "./components/RiskForm";
import { useCreateRiskMutation } from "../../generated/graphql";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import Helmet from "react-helmet";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
// import { useCreatePolicyMutation } from "../../generated/graphql";
// import { oc } from "ts-optchain";
// import { toast } from "react-toastify";
// import Helmet from "react-helmet";

// const CreatePolicy = ({ history }: RouteComponentProps) => {
//   const [createPolicy, { loading }] = useCreatePolicyMutation({
//     onCompleted: res => {
//       toast.success("Create Success");
//       const id = oc(res).createPolicy.policy.id("");
//       history.replace(`/policy/${id}`);
//     },
//     onError: () => toast.error("Create Failed"),
//     refetchQueries: ["policies"],
//     awaitRefetchQueries: true
//   });
//   function handleSubmit(values: PolicyFormValues) {
//     createPolicy({
//       variables: {
//         input: {
//           title: values.title,
//           policyCategoryId: values.policyCategoryId,
//           description: values.description
//         }
//       }
//     });
//   }
//   return (
//     <div>
//       <Helmet>
//         <title>Create Policy - PricewaterhouseCoopers</title>
//       </Helmet>
//       <HeaderWithBackButton heading="Create Policy" />
//       <PolicyForm onSubmit={handleSubmit} submitting={loading} />
//     </div>
//   );
// };

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
        <title>Create Policy - PricewaterhouseCoopers</title>
      </Helmet>
      <HeaderWithBackButton heading="Create Risk" />
      <RiskForm onSubmit={handleSubmit} submitting={loading} />
    </div>
  )
};

export default CreateRisk;
