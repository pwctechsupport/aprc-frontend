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
import {
  Suggestions,
  toLabelValue,
  Suggestion,
} from "../../../shared/formatter";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import { notifyGraphQLErrors, notifyInfo } from "../../../shared/utils/notif";
import { useLoadPolicyCategories, useLoadRoles } from "./UserForm";
import Tooltip from "../../../shared/components/Tooltip";
import { toast } from "react-toastify";
import { useLoadDepartmentUser } from "../../../shared/hooks/suggestions";
import styled from "styled-components";

interface UserRowProps {
  isEdit?: boolean;
  user?: UserRowFragmentFragment;
  policyCategories?: any;
}

interface UserRowValues {
  name?: string;
  roleIds?: Suggestion;
  policyCategoryIds?: Suggestions;
  departmentId?: Suggestion;
}

export default function UserRow({
  user,
  policyCategories,
  ...props
}: UserRowProps) {
  const [isEdit, setIsEdit] = useState(props.isEdit);
  const { register, setValue, handleSubmit, errors } = useForm<UserRowValues>({
    defaultValues: {
      roleIds: oc(user)
        .roles([])
        .map(toLabelValue)
        .pop(),
      policyCategoryIds: oc(user)
        .policyCategories([])
        .map(toLabelValue),
      departmentId: user?.department
        ? [user?.department].map(toLabelValue).pop()
        : {},
    },
    validationSchema,
  });
  const [update, updateM] = useAdminUpdateUserMutation({
    refetchQueries: ["preparerUsers", "reviewerUsersStatus"],
    onCompleted: () => {
      toast.success("Update Success");
    },
    onError: notifyGraphQLErrors,
  });

  const [destroy, destroyM] = useDestroyUserMutation({
    onCompleted: () => {
      toast.success("Delete Success");
    },

    refetchQueries: ["preparerUsers", "reviewerUsersStatus"],
    onError: notifyGraphQLErrors,
  });

  const [requestEdit, requestEditM] = useCreateRequestEditMutation({
    variables: { id: oc(user).id(""), type: "User" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    refetchQueries: ["preparerUsers", "reviewerUsersStatus"],
  });

  const [approveEdit, approveEditM] = useApproveRequestEditMutation({
    onCompleted: () => {
      toast.success("User Approved");
    },

    refetchQueries: ["preparerUsers", "reviewerUsersStatus"],
    onError: notifyGraphQLErrors,
  });

  const [reviewUser, reviewM] = useReviewUserDraftMutation({
    onCompleted: () => {
      toast.success("User Reviewed");
    },

    refetchQueries: ["preparerUsers", "reviewerUsersStatus"],
    onError: notifyGraphQLErrors,
  });

  const [isAdmin, isAdminPreparer, isAdminReviewer] = useAccessRights([
    "admin",
    "admin_preparer",
    "admin_reviewer",
  ]);
  const createdAt = oc(user).createdAt() || "";
  const updatedAt = oc(user).updatedAt() || "";
  const draft = oc(user).draft.objectResult();
  const requestStatus = oc(user).requestStatus();
  const notRequested = !requestStatus;
  const requested = requestStatus === "requested";
  const hasEditAccess = oc(user).hasEditAccess();
  const rejected = requestStatus === "rejected";
  const department = user?.department?.name || "";
  let name = user?.name || "";

  if (draft) {
    const draftData: any = draft || {};
    name = draftData.name;
  }

  const handleGetRoles = useLoadRoles();
  const handleGetPolicyCategories = useLoadPolicyCategories();
  const handleGetDepartments = useLoadDepartmentUser();
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
          roleIds: [data.roleIds?.value || ""] || [""],
          departmentId: data.departmentId?.value || "",
        },
      },
    });
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
        <td>{name}</td>
        <td>{oc(user).id("")}</td>
        <td>
          {oc(user)
            .roles([])
            .map((r) => r.name)
            .join(",")}
        </td>
        <td>{policyCategories.join(",")}</td>
        <td>{department}</td>
        <td>
          {draft ? (
            <span className="text-orange">[Waiting for review] </span>
          ) : (
            <span className="text-orange">[Approved] </span>
          )}
        </td>
        <td>{createdAt.split(" ")[0]}</td>
        <td>{updatedAt.split(" ")[0]}</td>

        <td>
          {/* premis 1 None */}
          {(draft && isAdminPreparer) || (!draft && isAdminReviewer && null)}

          {/* premis 2 Approve */}
          {draft && (isAdminReviewer || isAdmin) && (
            <div className="d-flex">
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
            </div>
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

          {!draft && isAdminReviewer && (
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
            label="Name"
            innerRef={register({ required: true })}
            defaultValue={name}
            error={get(errors, "name.message", undefined) as string | undefined}
          />
        </td>
        <td>{oc(user).id("")}</td>
        <td>
          <AsyncSelect
            cacheOptions
            label="User Group"
            defaultOptions
            name="roleIds"
            register={register}
            error={errors.roleIds && "Role is a required field"}
            setValue={setValue}
            loadOptions={handleGetRoles}
            defaultValue={user?.roles?.map(toLabelValue).pop() || {}}
          />
        </td>
        <td>
          <AsyncSelect
            isMulti
            cacheOptions
            label="Policy Category"
            defaultOptions
            error={
              errors.policyCategoryIds && "Policy category is a required field"
            }
            name="policyCategoryIds"
            register={register}
            setValue={setValue}
            loadOptions={handleGetPolicyCategories}
            defaultValue={user?.policyCategories?.map(toLabelValue) || []}
          />
        </td>

        <td>
          <AsyncSelect
            cacheOptions
            label="Department"
            defaultOptions
            error={errors.departmentId && "Department is a required field"}
            name="departmentId"
            register={register}
            setValue={setValue}
            loadOptions={handleGetDepartments}
            defaultValue={
              (user?.department && [user.department].map(toLabelValue)) || {}
            }
          />
        </td>
        <td>
          <DialogButton
            loading={updateM.loading}
            className="pwc"
            color="primary"
            onConfirm={handleSubmit(handleSave)}
          >
            Save
          </DialogButton>
          <StyledButton
            // loading={updateM.loading}
            className="ml-1"
            onConfirm={toggleEdit}
          >
            Cancel
          </StyledButton>
        </td>
      </tr>
    );
  }
}
export const StyledButton = styled(DialogButton)`
  background: var(--soft-grey);
`;
const validationSchema = yup.object().shape({
  name: yup.string().required("Name is a required field"),
  policyCategoryIds: yup.array().required(),
  roleIds: yup.object().required(),
  departmentId: yup.object().required(),
});
