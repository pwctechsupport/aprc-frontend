import React, { useState } from "react";
import useForm from "react-hook-form";
import { AiFillEdit } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import { oc } from "ts-optchain";
import * as yup from "yup";
import {
  RolesDocument,
  UserRowFragmentFragment,
  PolicyCategoriesDocument,
  useAdminUpdateUserMutation
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import Input from "../../../shared/components/forms/Input";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import { toLabelValue } from "../../../shared/formatter";
import { notifyGraphQLErrors } from "../../../shared/utils/notif";

const UserRow = ({ user, ...props }: UserRowProps) => {
  const [isEdit, setIsEdit] = useState(props.isEdit);
  const { register, setValue, handleSubmit, errors } = useForm<UserRowValues>({
    defaultValues: {
      roleIds: oc(user)
        .roles([])
        .map(r => r.id),
      policyCategoryIds: oc(user)
        .policyCategories([])
        .map(pc => pc.id)
    },
    validationSchema
  });

  const getRoles = useLazyQueryReturnPromise(RolesDocument);
  const getPolicyCategories = useLazyQueryReturnPromise(
    PolicyCategoriesDocument
  );

  const [update, updateM] = useAdminUpdateUserMutation({
    refetchQueries: ["users"],
    onCompleted,
    onError: notifyGraphQLErrors
  });

  async function handleGetRoles(input: string) {
    try {
      return oc(
        await getRoles({
          filter: { name_cont: input }
        })
      )
        .data.roles.collection([])
        .map(toLabelValue);
    } catch (error) {
      return [];
    }
  }

  async function handleGetPolicyCategories(input: string) {
    try {
      return oc(
        await getPolicyCategories({
          filter: { name_cont: input }
        })
      )
        .data.policyCategories.collection([])
        .map(toLabelValue);
    } catch (error) {
      return [];
    }
  }

  function toggleEdit() {
    setIsEdit(!isEdit);
  }

  function handleSave(data: UserRowValues) {
    update({
      variables: {
        input: {
          firstName: data.firstName,
          userId: oc(user).id(""),
          policyCategoryIds: oc(data).policyCategoryIds([]),
          roleIds: oc(data).roleIds([])
        }
      }
    });
  }

  function onCompleted() {
    setIsEdit(false);
  }

  if (!isEdit) {
    return (
      <tr>
        <td>{oc(user).name("")}</td>
        <td>{oc(user).id("")}</td>
        <td>
          {oc(user)
            .roles([])
            .map(r => r.name)
            .join(",")}
        </td>
        <td>
          {oc(user)
            .policyCategories([])
            .map(p => p.name)
            .join(",")}
        </td>
        <td>
          <Button onClick={toggleEdit} className="soft orange mr-2">
            <AiFillEdit />
          </Button>

          <DialogButton className="soft red">
            <FaTrash />
          </DialogButton>
        </td>
      </tr>
    );
  } else {
    return (
      <tr>
        <td>
          <Input
            required
            name="firstName"
            innerRef={register({ required: true })}
            defaultValue={oc(user).name("")}
            error={oc(errors).firstName.message()}
          />
        </td>
        <td>{oc(user).id("")}</td>
        <td>
          <AsyncSelect
            cacheOptions
            defaultOptions
            name="roleIds"
            register={register}
            setValue={setValue}
            loadOptions={handleGetRoles}
            defaultValue={oc(user)
              .roles([])
              .map(toLabelValue)}
          />
        </td>
        <td>
          <AsyncSelect
            isMulti
            cacheOptions
            defaultOptions
            name="policyCategoryIds"
            register={register}
            setValue={setValue}
            loadOptions={handleGetPolicyCategories}
            defaultValue={oc(user)
              .policyCategories([])
              .map(toLabelValue)}
          />
        </td>
        <td>
          <Button
            loading={updateM.loading}
            className="pwc"
            onClick={handleSubmit(handleSave)}
          >
            Save
          </Button>
        </td>
      </tr>
    );
  }
};

interface UserRowProps {
  isEdit?: boolean;
  user?: UserRowFragmentFragment;
}

interface UserRowValues {
  firstName?: string;
  roleIds?: string[];
  policyCategoryIds?: string[];
}

const validationSchema = yup.object().shape({
  firstName: yup.string().required("Required")
});

export default UserRow;
