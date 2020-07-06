import React, { Fragment } from "react";
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
import { toast } from "react-toastify";

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
        department: oc(res).updateUser.user.department.name(""),
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
      <div className="mt-5">
        <UpdateProfileForm
          onSubmit={updateProfile}
          submitting={loading}
          defaultValues={defaultValues}
        />
      </div>
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
        label="Full name"
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
        onKeyDown={(e) =>
          (e.keyCode === 69 ||
            e.keyCode === 188 ||
            e.keyCode === 190 ||
            e.keyCode === 38 ||
            e.keyCode === 40) &&
          e.preventDefault()
        }
        type="number"
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
  oldPassword: string;
}

interface UpdatePasswordFormProps {
  onSubmit: (values: UpdatePasswordFormValues) => void;
  submitting?: boolean;
}

const UpdatePasswordForm = ({
  onSubmit,
  submitting,
}: UpdatePasswordFormProps) => {
  const { register, handleSubmit, errors, reset, watch } = useForm<
    UpdatePasswordFormValues
  >();
  const checkPassword = watch("password")?.split("") || [""];
  console.log("checkPassword", checkPassword);
  const capitalWords = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const lowerCaseWords = "abcdefghijklmnopqrstuvwxyz".split("");
  const numbers = "1234567890".split("");

  const noLowerCasePassword = checkPassword
    ?.map((a) => lowerCaseWords.includes(a))
    .every((a) => a === false);

  const noCapitalPassword = checkPassword
    ?.map((a) => capitalWords.includes(a))
    .every((a) => a === false);

  const noNumberPassword = checkPassword
    ?.map((a) => numbers.includes(a))
    .every((a) => a === false);

  const falsePasswordLength = (checkPassword?.length || 0) < 8;

  const validatePassword =
    noLowerCasePassword ||
    noCapitalPassword ||
    noNumberPassword ||
    falsePasswordLength;
  console.log("noCapitalPassword", noCapitalPassword);
  const submit = (data: UpdatePasswordFormValues) => {
    if (!validatePassword) {
      onSubmit(data);
      reset({
        password: "",
        passwordConfirmation: "",
      });
    } else {
      toast.error("Password doesn't fullfill requirement(s)");
    }
  };
  return (
    <Form onSubmit={handleSubmit(submit)}>
      <h4>Update Password</h4>
      <Input
        name="oldPassword"
        label="Current Password"
        type="password"
        innerRef={register({ required: true })}
        error={errors.oldPassword?.message}
        required
      />
      <Input
        name="password"
        label="New Password"
        type="password"
        innerRef={register({ required: true })}
        error={errors.password?.message}
        required
      />{" "}
      {validatePassword && (
        <Fragment>
          <h6 style={{ fontSize: "14px", color: "red" }}>
            Password requirements:
          </h6>
          <ul>
            {falsePasswordLength && (
              <li style={{ color: "red" }}>At least 8 characters</li>
            )}
            {noCapitalPassword && (
              <li style={{ color: "red" }}>Uppercase characters (A - Z)</li>
            )}
            {noLowerCasePassword && (
              <li style={{ color: "red" }}>Lowercase characters (a - z)</li>
            )}
            {noNumberPassword && (
              <li style={{ color: "red" }}>Numbers (0 - 9)</li>
            )}
          </ul>
        </Fragment>
      )}
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
