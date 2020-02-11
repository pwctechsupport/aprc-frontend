import React from "react";
import useForm from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import {
  UpdateUserInput,
  User,
  useUpdateProfileMutation
} from "../../generated/graphql";
import { updateUser } from "../../redux/auth";
import Button from "../../shared/components/Button";
import Input from "../../shared/components/forms/Input";
import { useSelector } from "../../shared/hooks/useSelector";
import LoadingSpinner from "../../shared/components/LoadingSpinner";

const UpdateProfile = () => {
  const user = useSelector(state => state.auth.user);
  const defaultValues = user || {};
  const dispatch = useDispatch();

  const { register, handleSubmit, errors } = useForm<UpdateUserInput>({
    defaultValues
  });

  const [updateProfile, { loading }] = useUpdateProfileMutation({
    onCompleted: res => {
      toast.success("Update Success");
      const newUser = {
        id: oc(res).updateUser.user.id(""),
        email: oc(res).updateUser.user.email(""),
        firstName: oc(res).updateUser.user.firstName(""),
        lastName: oc(res).updateUser.user.lastName(""),
        name: oc(res).updateUser.user.name(""),
        phone: oc(res).updateUser.user.phone(""),
        jobPosition: oc(res).updateUser.user.jobPosition(""),
        department: oc(res).updateUser.user.department("")
      };
      if (user) dispatch(updateUser(newUser));
    },
    onError: () => {
      toast.error("Update Failed");
    }
  });

  const temp = (values: UpdateUserInput) => {
    updateProfile({ variables: { input: values } });
  };

  if (!oc(user).email("")) {
    return <LoadingSpinner centered />;
  }

  return (
    <div>
      <h4>Profile</h4>
      <Form onSubmit={handleSubmit(temp)}>
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
          <Button type="submit" loading={loading} className="pwc">
            Save Profile
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UpdateProfile;

type CurrentUser = User | {};
