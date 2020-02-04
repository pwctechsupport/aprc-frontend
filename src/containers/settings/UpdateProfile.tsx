import React from "react";
import useForm from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import {
  UpdateUserInput,
  useUpdateUserMutation
} from "../../generated/graphql";
import { updateUser } from "../../redux/auth";
import Button from "../../shared/components/Button";
import Input from "../../shared/components/forms/Input";
import { useSelector } from "../../shared/hooks/useSelector";

const UpdateProfile = () => {
  const user = useSelector(state => state.auth.user) || {};
  const dispatch = useDispatch();

  const { register, handleSubmit, errors } = useForm<UpdateUserInput>({
    defaultValues: user
  });

  const [updateProfile, { loading }] = useUpdateUserMutation({
    onCompleted: res => {
      toast.success("Update Success");
      const newUser = {
        id: oc(res).updateUser.user.id(""),
        email: oc(res).updateUser.user.email(""),
        firstName: oc(res).updateUser.user.firstName(""),
        lastName: oc(res).updateUser.user.lastName(""),
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
