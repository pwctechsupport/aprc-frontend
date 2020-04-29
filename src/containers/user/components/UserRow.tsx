import get from "lodash/get";
import React, { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AiFillEdit,
  AiOutlineClockCircle,
  AiOutlineEdit,
} from "react-icons/ai";
import { FaCheck, FaExclamationCircle, FaTimes, FaTrash } from "react-icons/fa";
import { oc } from "ts-optchain";
import * as yup from "yup";
import {
  useAdminUpdateUserMutation,
  useApproveRequestEditMutation,
  useCreateRequestEditMutation,
  useDestroyUserMutation,
  useReviewUserDraftMutation,
  UserRowFragmentFragment,
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import Input from "../../../shared/components/forms/Input";
import { Suggestions, toLabelValue } from "../../../shared/formatter";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import { notifyGraphQLErrors, notifyInfo } from "../../../shared/utils/notif";
import { useLoadPolicyCategories, useLoadRoles } from "./UserForm";
import Tooltip from "../../../shared/components/Tooltip";

interface UserRowProps {
  isEdit?: boolean;
  user?: UserRowFragmentFragment;
}

interface UserRowValues {
  name?: string;
  roleIds?: any;
  policyCategoryIds?: Suggestions;
}

export default function UserRow({ user, ...props }: UserRowProps) {
  const [isEdit, setIsEdit] = useState(props.isEdit);
  const { register, setValue, handleSubmit, errors } = useForm<UserRowValues>({
    defaultValues: {
      roleIds: oc(user)
        .roles([])
        .map(toLabelValue),
      policyCategoryIds: oc(user)
        .policyCategories([])
        .map(toLabelValue),
    },
    validationSchema,
  });

  const [update, updateM] = useAdminUpdateUserMutation({
    refetchQueries: ["users"],
    onCompleted,
    onError: notifyGraphQLErrors,
  });

  const [destroy, destroyM] = useDestroyUserMutation({
    refetchQueries: ["users"],
    onError: notifyGraphQLErrors,
  });

  const [requestEdit, requestEditM] = useCreateRequestEditMutation({
    variables: { id: oc(user).id(""), type: "User" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    refetchQueries: ["users"],
  });

  const [approveEdit, approveEditM] = useApproveRequestEditMutation({
    refetchQueries: ["users"],
    onError: notifyGraphQLErrors,
  });

  const [reviewUser, reviewM] = useReviewUserDraftMutation({
    refetchQueries: ["users"],
    onError: notifyGraphQLErrors,
  });

  const [isAdmin, isAdminPreparer, isAdminReviewer] = useAccessRights([
    "admin",
    "admin_preparer",
    "admin_reviewer",
  ]);
  const admins = isAdmin || isAdminPreparer || isAdminReviewer;
  const createdAt = oc(user).createdAt() || "";
  const updatedAt = oc(user).updatedAt() || "";
  const status = oc(user).requestEdit.state() || "";
  const draft = oc(user).draft.objectResult();
  const requestStatus = oc(user).requestStatus();
  const notRequested = !requestStatus;
  const requested = requestStatus === "requested";
  const hasEditAccess = oc(user).hasEditAccess();
  const rejected = requestStatus === "rejected";
  let name = oc(user).name("");

  if (draft) {
    const draftData: any = draft || {};
    name = draftData.name;
  }

  const handleGetRoles = useLoadRoles();
  const handleGetPolicyCategories = useLoadPolicyCategories();

  function toggleEdit() {
    setIsEdit(!isEdit);
  }

  function confirmRequestEdit() {
    requestEdit();
  }

  function handleSave(data: UserRowValues) {
    update({
      variables: {
        input: {
          name: data.name || "",
          userId: oc(user).id(""),
          policyCategoryIds: data.policyCategoryIds?.map((a) => a.value),
          roleIds: data.roleIds?.value||'',
        },
      },
    });
  }

  function onCompleted() {
    setIsEdit(false);
  }

  function handleDestroy(id: string) {
    destroy({ variables: { id } });
  }

  function handleApprove(id: string) {
    reviewUser({ variables: { id, publish: true } });
  }

  function handleReject(id: string) {
    reviewUser({ variables: { id, publish: false } });
  }

  function handleApproveRequest(id: string) {
    approveEdit({ variables: { id, approve: true } });
  }

  function handleRejectRequest(id: string) {
    approveEdit({ variables: { id, approve: false } });
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
            .map((r) => r.name)
            .join(",")}
        </td>
        <td>
          {oc(user)
            .policyCategories([])
            .map((p) => p.name)
            .join(",")}
        </td>
        <td>{status}</td>
        <td>{createdAt.split(" ")[0]}</td>
        <td>{updatedAt.split(" ")[0]}</td>

        <td>
          {/* premis 1 None */}
          {(draft && isAdminPreparer) || (!draft && isAdminReviewer && null)}

          {/* premis 2 Approve */}
          {draft && (isAdminReviewer || isAdmin) && (
            <Fragment>
              <DialogButton
                title="Approve"
                data={oc(user).id()}
                onConfirm={handleApprove}
                className="soft orange mr-2"
                loading={reviewM.loading}
              >
                <Tooltip description="Approve User">
                  <FaCheck />
                </Tooltip>
              </DialogButton>
              <DialogButton
                title="Reject"
                data={oc(user).id()}
                onConfirm={handleReject}
                className="soft orange"
                loading={reviewM.loading}
              >
                <Tooltip description="Reject User">
                  <FaTimes />
                </Tooltip>
              </DialogButton>
            </Fragment>
          )}

          {/* premis 3 Edit */}
          {((hasEditAccess && !draft && isAdminPreparer) ||
            (!draft && isAdmin)) && (
            <Fragment>
              <Button onClick={toggleEdit} className="soft orange mr-2">
                <Tooltip description="Edit User">
                  <AiFillEdit />
                </Tooltip>
              </Button>
            </Fragment>
          )}

          {/* premis 4 Request Edit */}
          {!draft && (notRequested || rejected) && isAdminPreparer && (
            <DialogButton
              title="Request access to edit?"
              onConfirm={confirmRequestEdit}
              onClick={requested ? () => {} : undefined}
              loading={requestEditM.loading}
              className="soft red mr-2"
              disabled={requestStatus === "requested"}
            >
              <Tooltip description="Request To Edit">
                <AiOutlineEdit />
              </Tooltip>
            </DialogButton>
          )}

          {/* premis 5 Waiting approval */}
          {requested && isAdminPreparer && (
            <Button disabled className="soft orange mr-2">
              <AiOutlineClockCircle />
            </Button>
          )}

          {/* premis 6 Accept request to edit */}
          {oc(user).requestEdit.state() === "requested" &&
            (isAdminReviewer || isAdmin) && (
              <DialogButton
                title={`Accept request to edit?`}
                message={`Request by ${oc(user).requestEdit.user.name()}`}
                className="soft red mr-2"
                data={oc(user).requestEdit.id()}
                onConfirm={handleApproveRequest}
                onReject={handleRejectRequest}
                actions={{ no: "Reject", yes: "Approve" }}
                loading={approveEditM.loading}
              >
                <Tooltip description="Accept Request To Edit">
                  <FaExclamationCircle />
                </Tooltip>
              </DialogButton>
            )}

          {!draft && admins && (
            <DialogButton
              title="Delete"
              data={oc(user).id()}
              loading={destroyM.loading}
              className="soft red"
              onConfirm={handleDestroy}
            >
              <Tooltip description="Delete User">
                <FaTrash />
              </Tooltip>
            </DialogButton>
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
            // isMulti
            cacheOptions
            defaultOptions
            name="roleIds"
            register={register}
            setValue={setValue}
            loadOptions={handleGetRoles}
            defaultValue={user?.roles?.map(toLabelValue) || []}
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
            defaultValue={user?.policyCategories?.map(toLabelValue) || []}
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
          <Button
            // loading={updateM.loading}
            className="ml-1 black"
            style={{
              backgroundColor: "rgba(233, 236, 239, 1)",
              color: "black",
            }}
            onClick={toggleEdit}
          >
            Cancel
          </Button>
        </td>
      </tr>
    );
  }
}

const validationSchema = yup.object().shape({
  name: yup.string().required("Required"),
});
