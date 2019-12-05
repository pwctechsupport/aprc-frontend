import React from "react";
import { RouteComponentProps } from "react-router";
import get from "lodash/get";
import SubBusinessProcessForm from "./components/SubBusinessProcessForm";

const CreateSubBusinessProcess = ({ match }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  return (
    <div>
      <h5>Sub Business Process</h5>
      <SubBusinessProcessForm parentId={id} />
    </div>
  );
};

export default CreateSubBusinessProcess;
