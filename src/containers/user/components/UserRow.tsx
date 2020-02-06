import React, { useState } from "react";
import useForm from "react-hook-form";
import { AiFillEdit } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import { oc } from "ts-optchain";
import {
  RolesDocument,
  UserRowFragmentFragment,
  PolicyCategoriesDocument
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import Input from "../../../shared/components/forms/Input";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import { toLabelValue } from "../../../shared/formatter";

const UserRow = ({ user, ...props }: UserRowProps) => {
  const [isEdit, setIsEdit] = useState(props.isEdit);
  const { register, setValue } = useForm();

  const getRoles = useLazyQueryReturnPromise(RolesDocument);
  const getPolicyCategories = useLazyQueryReturnPromise(
    PolicyCategoriesDocument
  );

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

  function handleSave() {
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
            .join(",")}
        </td>
        <td>
          {oc(user)
            .policyCategories([])
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
          <Input />
        </td>
        <td>{oc(user).id("")}</td>
        <td>
          <AsyncSelect
            cacheOptions
            defaultOptions
            name="roles"
            register={register}
            setValue={setValue}
            loadOptions={handleGetRoles}
          />
        </td>
        <td>
          <AsyncSelect
            isMulti
            cacheOptions
            defaultOptions
            name="policyCategoriesId"
            register={register}
            setValue={setValue}
            loadOptions={handleGetPolicyCategories}
          />
        </td>
        <td>
          <Button className="pwc" onClick={handleSave}>
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

export default UserRow;
