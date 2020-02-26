import useAccessRights from "./useAccessRights";

export default function useEditState({
  draft,
  hasEditAccess,
  requestEditState,
  requestStatus
}: {
  draft: any;
  hasEditAccess: boolean;
  requestEditState: string | null | undefined;
  requestStatus: string | null | undefined;
}) {
  const [isAdmin, isAdminPreparer, isAdminReviewer] = useAccessRights([
    "admin",
    "admin_preparer",
    "admin_reviewer"
  ]);

  const requested = requestStatus === "requested";
  const notRequested = !requestStatus;
  const rejected = requestStatus === "rejected";

  let premise: number = 1;

  /* premis 1 None */
  /* premis 2 Approve */
  /* premis 3 Edit */
  /* premis 4 Request Edit */
  /* premis 5 Waiting approval */
  /* premis 6 Accept request to edit */
  if ((draft && isAdminPreparer) || (!draft && isAdminReviewer)) {
    premise = 1;
  }
  if (draft && (isAdminReviewer || isAdmin)) {
    premise = 2;
  }
  if ((hasEditAccess && !draft && isAdminPreparer) || (!draft && isAdmin)) {
    premise = 3;
  }
  if (!draft && (notRequested || rejected) && isAdminPreparer) {
    premise = 4;
  }
  if (requested && isAdminPreparer) {
    premise = 5;
  }
  if (requestEditState === "requested" && (isAdminReviewer || isAdmin)) {
    premise = 6;
  }

  return premise;
}

// How to use:
// YOU HAVE TO SUPPLY ALL THESE PROPS
// draft, hasEditAccess, notRequested, rejected, requestEdit, requested

// const Component = props => {
// const premise = useEditState({ draft, hasEditAccess, notRequested, rejected, requestEdit, requested })
// return (
//   <div>
//     {premise === 1 ? <AnotherComponent1 /> : <AnotherComponent2 />}
//   </div>
// )
// }
