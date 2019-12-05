import React from "react";
import {
  useBusinessProcessesQuery,
  useBusinessProcessQuery,
  useDestroyBusinessProcessMutation,
  BusinessProcessDocument
} from "../../generated/graphql";
import { RouteComponentProps, Route } from "react-router";
import get from "lodash/get";
import Table from "../../shared/components/Table";
import { oc } from "ts-optchain";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import { toast } from "react-toastify";
import Button from "../../shared/components/Button";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import CreateSubBusinessProcess from "./CreateSubBusinessProcess";

const BusinessProcess = ({ match, history }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  const { data } = useBusinessProcessQuery({ variables: { id } });
  // const { data: dato } = useBusinessProcessesQuery({
  //   variables: {
  //     filter: { ancestry_cont: id }
  //   }
  // });
  const childs = oc(data).businessProcess.children([]);
  // console.log(dato);

  const [destroy] = useDestroyBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Delete Success");
      // history.push("/business-process");
    },
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["businessProcess"],
    awaitRefetchQueries: true
  });

  const handleDelete = (id: string) => {
    destroy({ variables: { input: { id } } });
  };

  const nama = oc(data).businessProcess.name("");
  const ancest = oc(data).businessProcess.ancestry("");
  const ident = oc(data).businessProcess.id;
  const isLimitMax = ancest.includes("/");
  // const isSubBusinessProcess: boolean = !!oc(data).businessProcess.ancestry();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <HeaderWithBackButton heading={`BusinessProcess ${nama}`} />
      </div>
      <div>
        {isLimitMax ? null : <Route component={CreateSubBusinessProcess} />}
      </div>
      <Table>
        <thead>
          <tr>
            <th>Business Process</th>
            <th>Business Process ID</th>
            <th>Parent</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {childs.map(child => {
            return (
              <tr key={child.id}>
                <td>
                  <Link to={`/business-process/${child.id}`}>{child.name}</Link>
                </td>
                <td>{child.id}</td>
                <td>{child.ancestry}</td>
                <td>
                  <Button
                    onClick={() => handleDelete(child.id)}
                    color="transparent"
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default BusinessProcess;

// import React from "react";
// import {
//   useCreateSubBusinessProcessMutation,
//   BusinessProcessesDocument
// } from "../../generated/graphql";
// import { toast } from "react-toastify";
// import { Form, Input } from "reactstrap";
// import Button from "../../shared/components/Button";
// import useForm from "react-hook-form";

// const CreateSubBusinessProcess = () => {
//   const { register, handleSubmit, reset } = useForm<CreateSBPFormValues>();
//   const [createSBP] = useCreateSubBusinessProcessMutation({
//     onCompleted: () => {
//       toast.success("Create Success");
//       reset();
//     },
//     onError: () => toast.error("Create Failed"),
//     refetchQueries: [
//       { query: BusinessProcessesDocument, variables: { filter: {} } }
//     ]
//   });
//   const submit = (values: CreateSBPFormValues) => {
//     createSBP({ variables: { input: { parentId: values.parentId,  }});
//   };
//   return (
//     <Form
//       onSubmit={handleSubmit(submit)}
//       className="d-flex align-items-center mb-4"
//     >
//       <Input
//         name="name"
//         placeholder="Sub Business Process Name"
//         innerRef={register}
//         required
//       />
//       <Button type="submit" className="pwc ml-3">
//         Add
//       </Button>
//     </Form>
//   );
// };

// export default CreateSubBusinessProcess;

// interface CreateSBPFormValues {
//   name: string;
//   parentId: string;
// }
