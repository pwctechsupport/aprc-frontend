import React from "react";
import { Container } from "reactstrap";
import UserForm, { UserFormValues } from "./components/UserForm";
import BreadCrumb from "../../shared/components/BreadCrumb";
import { useCreateUserMutation } from "../../generated/graphql";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import { RouteComponentProps } from "react-router-dom";

const CreateUser = ({ history }: RouteComponentProps) => {
  const [create, createM] = useCreateUserMutation({
    onCompleted: onCompleted,
    onError: notifyGraphQLErrors,
    refetchQueries: ["users"],
    awaitRefetchQueries: true
  });

  function handleSubmit(values: UserFormValues) {
    create({
      variables: {
        input: {
          name: values.name || "",
          email: values.email || "",
          password: values.password || "",
          passwordConfirmation: values.passwordConfirmation || "",
          phone: values.phone || "",
          roleIds: values.roleIds?.map(a => a.value),
          departmentId: values.departmentIds?.value,
          policyCategoryIds: values.policyCategoryIds?.map(a => a.value)
        }
      }
    });
  }

  function onCompleted() {
    notifySuccess();
    history.push("/user");
  }

  return (
    <div>
      <Container className="p-0 pt-3 px-4">
        <BreadCrumb
          crumbs={[
            ["/user", "User"],
            ["/create", "Create"]
          ]}
        />
        <UserForm
          onSubmit={handleSubmit}
          submitting={createM.loading}
          history={history}
          isCreate={history.location.pathname === "/user/create"}
        />
      </Container>
    </div>
  );
};

export default CreateUser;
