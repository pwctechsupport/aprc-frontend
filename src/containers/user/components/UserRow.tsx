import React, { useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import Input from "../../../shared/components/forms/Input";
import { UserRowFragmentFragment } from "../../../generated/graphql";
import { oc } from "ts-optchain";

const UserRow = ({ user, ...props }: UserRowProps) => {
  const [isEdit, setIsEdit] = useState(props.isEdit);

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
  user?: UserRowFragmentFragment;
}

export default UserRow;
