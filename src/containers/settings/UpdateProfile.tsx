import React from "react";
import { Form } from "reactstrap";
import Input from "../../shared/components/forms/Input";
import useForm from "react-hook-form";
import {
  UpdateUserInput,
  useUpdateUserMutation
} from "../../generated/graphql";
import { useSelector } from "../../shared/hooks/useSelector";
import Button from "../../shared/components/Button";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/auth";
import { oc } from "ts-optchain";
import { omit } from "lodash";

const UpdateProfile = () => {
  const user = useSelector(state => state.auth.user) || {};
  const dispatch = useDispatch();

  const { register, setValue, handleSubmit, errors, watch } = useForm<
    UpdateUserInput
  >({ defaultValues: user });

  const [updateProfile, { loading }] = useUpdateUserMutation({
    onCompleted: res => {
      toast.success("Update Success");
      // const newuser = oc(res).updateUser.user();
      // if (user) dispatch(updateUser(newuser));
    },
    onError: () => {
      toast.error("Update Failed");
    }
  });

  const temp = (values: UpdateUserInput) => {
    updateProfile({ variables: { input: values } });
  };

  return (
    <div>
      <h4>Profile</h4>
      <Form onSubmit={handleSubmit(temp)}>
        <Input
          name="firstName"
          label="First name"
          innerRef={register({ required: true })}
          error={errors.name && errors.name.message}
        />
        <Input
          name="lastName"
          label="Last name"
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
