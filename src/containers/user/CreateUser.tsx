import React from "react";
import { Container } from "reactstrap";
import UserForm, { UserFormValues } from "./components/UserForm";
import BreadCrumb from "../../shared/components/BreadCrumb";
import { useCreateUserMutation } from "../../generated/graphql";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import { RouteComponentProps } from "react-router-dom";

const CreateUser = ({ history }: RouteComponentProps) => {
  const [create, createM] = useCreateUserMutation({
    refetchQueries: ["users"],
    onCompleted: onCompleted,
    onError: notifyGraphQLErrors
  });

  function handleSubmit(values: UserFormValues) {
    create({
      variables: {
        input: {
          email: values.email || "",
          password: values.password || "",
          passwordConfirmation: values.passwordConfirmation || "",
          phone: values.phone || ""
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
      <Container>
        <BreadCrumb crumbs={[["/user", "User"], ["/create", "Create"]]} />
        <UserForm onSubmit={handleSubmit} submitting={createM.loading} />
      </Container>
    </div>
  );
};

export default CreateUser;
