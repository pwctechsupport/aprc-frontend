import React, { useState, useEffect } from "react";
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
import Footer from "../../shared/components/Footer";
import { PasswordRequirements } from "../../shared/components/forms/PasswordRequirements";

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
        roles: res?.updateUser?.user?.roles || [],
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
      <h4 style={{ fontSize: "23px" }}>Profile</h4>
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
        innerRef={register}
        error={errors.phone && errors.phone.message}
      />
      <div className="d-flex justify-content-end">
        <Button type="submit" loading={submitting} className="pwc">
          Save profile
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

  const [validatingPassword, setValidatingPassword] = useState({})

  const checkPassword = watch("password")?.split("") || [""];
  const capitalWords = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const lowerCaseWords = "abcdefghijklmnopqrstuvwxyz".split("");
  const specialsCharacters = " `!@#$%^&*()_+-{\\\"'}[/]~|?<=>:;.,".split("");
  const numbers = "1234567890".split("");

  const noLowerCasePassword = checkPassword
    ?.map((a) => lowerCaseWords.includes(a))
    .every((a) => a === false);

  const noSpecialCharacterPassword = checkPassword
    ?.map((a) => specialsCharacters.includes(a))
    .every((a) => a === false);

  const noCapitalPassword = checkPassword
    ?.map((a) => capitalWords.includes(a))
    .every((a) => a === false);

  const noNumberPassword = checkPassword
    ?.map((a) => numbers.includes(a))
    .every((a) => a === false);

  const falsePasswordLength = (checkPassword?.length || 0) < 8;

  const validatePassword = {
    falsePasswordLength,
    noLowerCasePassword,
    noCapitalPassword,
    noNumberPassword,
    noSpecialCharacterPassword,
  }

  const ifValid = 
    falsePasswordLength ||
    noLowerCasePassword ||
    noCapitalPassword ||
    noNumberPassword ||
    noSpecialCharacterPassword

  useEffect(() => {
    setValidatingPassword({
      falsePasswordLength: false,
      noLowerCasePassword: false,
      noCapitalPassword: false,
      noNumberPassword: false,
      noSpecialCharacterPassword: false,
    })
  }, [validatePassword])

  const submit = (data: UpdatePasswordFormValues) => {
    if (!ifValid) {
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
      <h4 style={{ fontSize: "23px" }}>Update password</h4>
      <Input
        name="oldPassword"
        label="Current password"
        type="password"
        innerRef={register({ required: true })}
        error={errors.oldPassword?.message}
        required
      />
      <Input
        name="password"
        label="New password"
        type="password"
        innerRef={register({ required: true })}
        error={errors.password?.message}
        required
      />{" "}
      {ifValid && (
        <PasswordRequirements
          falsePasswordLength={validatePassword.falsePasswordLength}
          noCapitalPassword={validatePassword.noCapitalPassword}
          noLowerCasePassword={validatePassword.noLowerCasePassword}
          noSpecialCharacterPassword={validatePassword.noSpecialCharacterPassword}
          noNumberPassword={validatePassword.noNumberPassword}
        />
      )}
      <Input
        name="passwordConfirmation"
        label="New password confirmation"
        type="password"
        innerRef={register({ required: true })}
        error={errors.passwordConfirmation?.message}
        required
      />
      <div className="d-flex justify-content-end">
        <Button className="pwc" type="submit" loading={submitting}>
          Update password
        </Button>
      </div>
      <Footer />
    </Form>
  );
};
