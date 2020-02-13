import React, { useState, Fragment } from "react";
import useForm from "react-hook-form";
import { AiFillEdit } from "react-icons/ai";
import { FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { oc } from "ts-optchain";
import get from "lodash/get";
import * as yup from "yup";
import {
  RolesDocument,
  UserRowFragmentFragment,
  PolicyCategoriesDocument,
  useAdminUpdateUserMutation,
  useDestroyUserMutation,
  useReviewUserDraftMutation
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import Input from "../../../shared/components/forms/Input";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import { toLabelValue } from "../../../shared/formatter";
import {
  notifyGraphQLErrors,
  notifySuccess
} from "../../../shared/utils/notif";
import useAccessRights from "../../../shared/hooks/useAccessRights";

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

  const [destroy, destroyM] = useDestroyUserMutation({
    refetchQueries: ["users"],
    onError: notifyGraphQLErrors
  });

  const [reviewUser, reviewM] = useReviewUserDraftMutation({
    refetchQueries: ["users"],
    onError: notifyGraphQLErrors
  });

  const [isAdmin] = useAccessRights(["admin"]);

  const draft = oc(user).draft.objectResult();
  let name = oc(user).name("");

  if (draft) {
    const draftData: any = draft || {};
    name = draftData.name;
  }

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
          name: data.name || "",
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

  function handleDestroy(id: string) {
    destroy({ variables: { id } });
  }

  function handleApprove(id: string) {
    reviewUser({ variables: { id, publish: true } }).then(() =>
      notifySuccess("Changes approved")
    );
  }

  function handleReject(id: string) {
    reviewUser({ variables: { id, publish: false } }).then(() =>
      notifySuccess("Changes rejected")
    );
  }

  if (!isEdit) {
    return (
      <tr>
        <td>
          {draft ? <span className="text-orange">[Draft] </span> : null}
          {name}
        </td>
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
          {isAdmin && draft ? (
            <Fragment>
              <DialogButton
                title="Approve"
                data={oc(user).id()}
                onConfirm={handleApprove}
                className="soft orange mr-2"
                loading={reviewM.loading}
              >
                <FaCheck />
              </DialogButton>
              <DialogButton
                title="Reject"
                data={oc(user).id()}
                onConfirm={handleReject}
                className="soft orange"
                loading={reviewM.loading}
              >
                <FaTimes />
              </DialogButton>
            </Fragment>
          ) : (
            <Fragment>
              <Button onClick={toggleEdit} className="soft orange mr-2">
                <AiFillEdit />
              </Button>

              <DialogButton
                title="Delete"
                data={oc(user).id()}
                loading={destroyM.loading}
                className="soft red"
                onConfirm={handleDestroy}
              >
                <FaTrash />
              </DialogButton>
            </Fragment>
          )}
        </td>
      </tr>
    );
  } else {
    return (
      <tr>
        <td>
          <Input
            required
            name="name"
            innerRef={register({ required: true })}
            defaultValue={name}
            error={get(errors, "name.message", undefined) as string | undefined}
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
  name?: string;
  roleIds?: string[];
  policyCategoryIds?: string[];
}

const validationSchema = yup.object().shape({
  name: yup.string().required("Required")
});

export default UserRow;
