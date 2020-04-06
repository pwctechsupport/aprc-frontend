import React from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import {
  User,
  useUpdateProfileMutation,
  useUpdateUserPasswordMutation,
} from "../../generated/graphql";
import { updateUser } from "../../redux/auth";
import Button from "../../shared/components/Button";
import Input from "../../shared/components/forms/Input";
import { useSelector } from "../../shared/hooks/useSelector";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";

export default function UpdateProfile() {
  const user = useSelector((state) => state.auth.user);
  const defaultValues = user || {};
  const dispatch = useDispatch();

  // Handler for update user information
  const [updateProfileM, { loading }] = useUpdateProfileMutation({
    onCompleted: (res) => {
      notifySuccess("Update Success");
      const newUser = {
        id: oc(res).updateUser.user.id(""),
        email: oc(res).updateUser.user.email(""),
        firstName: oc(res).updateUser.user.firstName(""),
        lastName: oc(res).updateUser.user.lastName(""),
        name: oc(res).updateUser.user.name(""),
        phone: oc(res).updateUser.user.phone(""),
        jobPosition: oc(res).updateUser.user.jobPosition(""),
        department: oc(res).updateUser.user.department(""),
      };
      if (user) dispatch(updateUser(newUser));
    },
    onError: notifyGraphQLErrors,
  });
  function updateProfile(values: UpdateProfileFormValues) {
    updateProfileM({ variables: { input: values } });
  }

  // Handler for update user password
  const [
    updateUserPasswordM,
    updateUserPasswordMutInfo,
  ] = useUpdateUserPasswordMutation({
    onCompleted: () => notifySuccess("Password Updated"),
    onError: notifyGraphQLErrors,
  });
  function updateUserPassword(values: UpdatePasswordFormValues) {
    updateUserPasswordM({ variables: { input: values } });
  }

  if (!oc(user).email("")) {
    return <h3>You are not signed in</h3>;
  }

  return (
    <div>
      <Helmet>
        <title>Profile - Settings - PricewaterhouseCoopers</title>
      </Helmet>
      <UpdateProfileForm
        onSubmit={updateProfile}
        submitting={loading}
        defaultValues={defaultValues}
      />
      <UpdatePasswordForm
        onSubmit={updateUserPassword}
        submitting={updateUserPasswordMutInfo.loading}
      />
    </div>
  );
}

// ============================================
// Building Blocks => Update profile form
// ============================================
interface UpdateProfileFormValues {
  name?: string | null;
  jobPosition?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface UpdateProfileFormProps {
  onSubmit: (values: UpdateProfileFormValues) => void;
  submitting?: boolean;
  defaultValues?: User | {};
}

const UpdateProfileForm = ({
  onSubmit,
  submitting,
  defaultValues,
}: UpdateProfileFormProps) => {
  const { register, handleSubmit, errors } = useForm<UpdateProfileFormValues>({
    defaultValues,
  });
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <h4>Profile</h4>
      <Input
        name="name"
        label="First name"
        innerRef={register({ required: true })}
        error={errors.name && errors.name.message}
      />
      <Input
        name="jobPosition"
        label="Position"
        innerRef={register({ required: true })}
        error={errors.jobPosition && errors.jobPosition.message}
      />
      <Input
        name="email"
        label="Email"
        innerRef={register({ required: true })}
        error={errors.email && errors.email.message}
      />
      <Input
        name="phone"
        label="Phone number"
        innerRef={register({ required: true })}
        error={errors.phone && errors.phone.message}
      />
      <div className="d-flex justify-content-end">
        <Button
          type="submit"
          loading={submitting}
          className="soft orange"
          color=""
        >
          Save Profile
        </Button>
      </div>
    </Form>
  );
};

// ============================================
// Building Blocks => Update password form
// ============================================
interface UpdatePasswordFormValues {
  password: string;
  passwordConfirmation: string;
}

interface UpdatePasswordFormProps {
  onSubmit: (values: UpdatePasswordFormValues) => void;
  submitting?: boolean;
}

const UpdatePasswordForm = ({
  onSubmit,
  submitting,
}: UpdatePasswordFormProps) => {
  const { register, handleSubmit, errors, reset } = useForm<
    UpdatePasswordFormValues
  >();
  const submit = (data: UpdatePasswordFormValues) => {
    onSubmit(data);
    reset({
      password: "",
      passwordConfirmation: "",
    });
  };
  return (
    <Form onSubmit={handleSubmit(submit)}>
      <h4>Update Password</h4>
      <Input
        name="password"
        label="New Password"
        type="password"
        innerRef={register({ required: true })}
        error={errors.password?.message}
        required
      />
      <Input
        name="passwordConfirmation"
        label="New Password Confirmation"
        type="password"
        innerRef={register({ required: true })}
        error={errors.passwordConfirmation?.message}
        required
      />
      <div className="d-flex justify-content-end">
        <Button
          className="soft orange"
          type="submit"
          color=""
          loading={submitting}
        >
          Update Password
        </Button>
      </div>
    </Form>
  );
};
