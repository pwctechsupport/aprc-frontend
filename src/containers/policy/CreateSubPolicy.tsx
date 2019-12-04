import React from "react";
import SubPolicyForm from "./components/SubPolicyForm";
import { RouteComponentProps } from "react-router";
import get from "lodash/get";

const CreateSubPolicy = ({ match }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  return (
    <div>
      <h1>CreateSubPolicy</h1>
      <SubPolicyForm parentId={id} />
    </div>
  );
};

export default CreateSubPolicy;
