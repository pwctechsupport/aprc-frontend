import React, { useState } from "react";
import useForm from "react-hook-form";
import { AiFillEdit } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import { UsersDocument } from "../../../generated/graphql";
import { oc } from "ts-optchain";
import { toLabelValue, ToLabelValueOutput } from "../../../shared/formatter";

const UserRow = (props: UserRowProps) => {
  const { register, setValue } = useForm();
  const [isEdit, setIsEdit] = useState(props.isEdit);
  const getUsers = useLazyQueryReturnPromise(UsersDocument);

  function toggleEdit() {
    setIsEdit(!isEdit);
  }

  function handleSave() {
    setIsEdit(false);
  }

  async function handleGetUsers(
    name_cont: string = ""
  ): Promise<ToLabelValueOutput[]> {
    try {
      const { data } = await getUsers({
        filter: { name_cont }
      });

      return oc(data)
        .users.collection([])
        .map(toLabelValue);
    } catch (error) {
      return [];
    }
  }

  if (!isEdit) {
    return (
      <tr>
        <td>A</td>
        <td>B</td>
        <td>C</td>
        <td>High Risk</td>
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
          <AsyncSelect
            name="userId"
            register={register}
            setValue={setValue}
            cacheOptions
            loadOptions={handleGetUsers}
            defaultOptions
          />
        </td>
        <td>B</td>
        <td>C</td>
        <td>High Risk</td>
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
}

export default UserRow;
