import startCase from "lodash/startCase";
import React, { useState, Fragment, useEffect } from "react";
import {
  FaBars,
  FaBookmark,
  FaEllipsisV,
  FaFilePdf,
  FaMinus,
  FaExclamationCircle,
} from "react-icons/fa";
import get from "lodash/get";
import { IoMdDownload, IoMdOpen } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { NavLink, Route, RouteComponentProps, Link } from "react-router-dom";
import {
  Badge,
  Nav,
  NavItem,
  TabContent,
  Table,
  TabPane,
  Row,
  Col,
} from "reactstrap";
import {
  Assertion,
  Control,
  Frequency,
  Ipo,
  LevelOfRisk,
  Nature,
  TypeOfControl,
  TypeOfRisk,
  useBusinessProcessQuery,
  useCreateBookmarkBusinessProcessMutation,
  useUpdateControlMutation,
  useUpdateRiskMutation,
  useBookmarksQuery,
  useResourceRatingsQuery,
  useResourceQuery,
  useResourcesQuery,
  useBusinessProcessesQuery,
  useControlQuery,
  useRiskQuery,
  useApproveRequestEditMutation,
  useCreateRequestEditMutation,
  useReviewControlDraftMutation,
  useReviewRiskDraftMutation,
} from "../../generated/graphql";
import BreadCrumb, { CrumbItem } from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import Collapsible from "../../shared/components/Collapsible";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import HeaderWithBackButton from "../../shared/components/Header";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Menu from "../../shared/components/Menu";
import Modal from "../../shared/components/Modal";
import ResourcesTab from "../../shared/components/ResourcesTab";
import Tooltip from "../../shared/components/Tooltip";
import { toLabelValue } from "../../shared/formatter";
import {
  downloadPdf,
  emailPdf,
  previewPdf,
} from "../../shared/utils/accessGeneratedPdf";
import getRiskColor from "../../shared/utils/getRiskColor";
import {
  notifyError,
  notifyGraphQLErrors,
  notifyInfo,
  notifySuccess,
} from "../../shared/utils/notif";
import ControlForm, {
  ControlFormValues,
  CreateControlFormValues,
} from "../control/components/ControlForm";
import RiskForm, { RiskFormValues } from "../risk/components/RiskForm";
import Flowcharts from "./components/Flowcharts";
import useAccessRights from "../../shared/hooks/useAccessRights";
import { useSelector } from "../../shared/hooks/useSelector";
import { APP_ROOT_URL } from "../../settings";
import ResourceBox from "../resources/components/ResourceBox";
import { capitalCase } from "capital-case";
import useEditState from "../../shared/hooks/useEditState";
import DialogButton from "../../shared/components/DialogButton";
import {
  AiOutlineClockCircle,
  AiOutlineEdit,
  AiFillEdit,
} from "react-icons/ai";

type TParams = { id: string };

export default function RiskAndControl({
  match,
  history,
}: RouteComponentProps<TParams>) {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);
  const initialCollapse = ["Risks", "Controls"];
  const [collapse, setCollapse] = useState(initialCollapse);
  const toggleCollapse = (name: string) =>
    setCollapse((p) => {
      if (p.includes(name)) {
        return p.filter((item) => item !== name);
      }
      return p.concat(name);
    });
  const openAllCollapse = () => setCollapse(initialCollapse);
  const closeAllCollapse = () => setCollapse([]);

  // Edit Risk Mutation and Modal state
  const [riskModal, setRiskModal] = useState(false);
  const [risk, setRisk] = useState<RiskState>();
  const toggleRiskModal = () => setRiskModal((p) => !p);
  const editRisk = (risk: RiskState) => {
    setRiskModal(true);
    setRisk(risk);
  };
  const [updateRisk, updateRiskM] = useUpdateRiskMutation({
    onCompleted: () => {
      notifySuccess("Risk Updated");
      toggleRiskModal();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["businessProcess", "risk"],
  });
  const handleUpdateRisk = (values: RiskFormValues) => {
    updateRisk({
      variables: {
        input: {
          id: risk?.id || "",
          name: values.name,
          businessProcessIds: values.businessProcessIds?.map((a) => a.value),
          levelOfRisk: values.levelOfRisk,
          typeOfRisk: values.typeOfRisk,
        },
      },
    });
  };

  // Edit Control Mutation and Modal State
  const [controlModal, setControlModal] = useState(false);
  const [control, setControl] = useState<ControlState>();
  const toggleControlModal = () => setControlModal((p) => !p);
  const editControl = (control: ControlState) => {
    setControlModal(true);
    setControl(control);
  };
  const [updateControl, updateControlM] = useUpdateControlMutation({
    onCompleted: () => {
      notifySuccess("Control Updated");
      toggleControlModal();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["businessProcess", "control"],
  });
  const handleUpdateControl = (values: CreateControlFormValues) => {
    updateControl({
      variables: { input: { id: control?.id || "", ...values } },
    });
  };

  const [addBookmark] = useCreateBookmarkBusinessProcessMutation({
    onCompleted: () => notifySuccess("Added to Bookmark"),
    onError: notifyGraphQLErrors,
    refetchQueries: ["businessProcess", "bookmarks"],
    awaitRefetchQueries: true,
  });

  const { id } = match.params;

  const { data, loading } = useBusinessProcessQuery({
    variables: { id },
    fetchPolicy: "network-only",
  });
  const { data: dataResources, loading: loadingResources } = useResourcesQuery({
    skip: !history.location.pathname.includes("/flowchart"),
    variables: {
      filter: isUser
        ? { business_process_id_eq: id, draft_id_null: true }
        : { business_process_id_eq: id },
    },
    fetchPolicy: "network-only",
  });
  const bpIds = data?.businessProcess?.id || [];
  const bpIds2 = data?.businessProcess?.children?.map((a) => a.id) || [];
  const bpIds3 =
    data?.businessProcess?.children?.map((a) => a.children?.map((b) => b.id)) ||
    [];
  const bpIds4 =
    data?.businessProcess?.children?.map((a) =>
      a.children?.map((b) => b.children?.map((c) => c.id))
    ) || [];
  const bpIds5 =
    data?.businessProcess?.children?.map((a) =>
      a.children?.map((b) =>
        b.children?.map((c) => c.children?.map((d) => d.id))
      )
    ) || [];
  const bpIds6 =
    data?.businessProcess?.children?.map((a) =>
      a.children?.map((b) =>
        b.children?.map((c) =>
          c.children?.map((d) => d.children?.map((e) => e.id))
        )
      )
    ) || [];
  const bpIdsTotal = [
    bpIds,
    ...bpIds2.flat(10),
    ...bpIds3.flat(10),
    ...bpIds4.flat(10),
    ...bpIds5.flat(10),
    ...bpIds6.flat(10),
  ];

  // bookmark Query
  const { data: bookmarkData, loading: bookmarkLoading } = useBookmarksQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: { originator_id_eq: id, originator_type_eq: "BusinessProcess" },
    },
  });

  const {
    data: dataRisksnControl,
    loading: loadingRisksnControl,
  } = useBusinessProcessesQuery({
    skip:
      history.location.pathname.includes("resources") ||
      history.location.pathname.includes("flowchart"),
    variables: {
      filter: isUser
        ? { id_matches_any: bpIdsTotal, draft_id_null: true }
        : { id_matches_any: bpIdsTotal },
    },
    fetchPolicy: "network-only",
  });

  const name = data?.businessProcess?.name || "";
  const risks =
    dataRisksnControl?.navigatorBusinessProcesses?.collection
      .map((a) => a.risks)
      .flat(10) || [];
  const modifiedRisks = !isUser
    ? risks
    : risks.filter((a) => a?.draft === null);
  const dataModifier = (a: any) => {
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) a.splice(j--, 1);
      }
    }
    return a;
  };
  // const controls =
  //   dataRisksnControl?.navigatorBusinessProcesses?.collection
  //     .map((a) => a.controls)
  //     .flat(10) || [];
  const resources = dataResources?.navigatorResources?.collection || [];

  const isBookmarked = bookmarkData?.bookmarks?.collection || [];
  const ancestors = data?.businessProcess?.ancestors || [];
  const breadcrumb = ancestors.map((a) => [
    "/risk-and-control/" + a.id,
    a.name,
  ]) as CrumbItem[];

  const tabs = [
    { to: `/risk-and-control/${id}`, title: "Detail" },
    { to: `/risk-and-control/${id}/flowchart`, title: "Flowchart" },
    { to: `/risk-and-control/${id}/resources`, title: "Resources" },
  ];
  //resources Bar
  const currentUrl = history.location.pathname;
  const [resourceId, setResourceId] = useState("");
  const userId = useSelector((state) => state.auth.user)?.id;
  useEffect(() => {
    if (currentUrl.includes("resources/")) {
      setResourceId(currentUrl.split("resources/")[1]);
    }
  }, [currentUrl]);

  // query for Flowchart Tab
  const { data: dataResource, loading: loadingResource } = useResourceQuery({
    variables: { id: resourceId },
    fetchPolicy: "network-only",
  });

  //Risk bar

  const [riskId, setRiskId] = useState("");
  useEffect(() => {
    if (currentUrl.includes("/risk/")) {
      setRiskId(currentUrl.split("/risk/")[1]);
    }
  }, [currentUrl]);
  const { data: dataRisk, loading: loadingRisk } = useRiskQuery({
    skip: !riskId,
    variables: { id: riskId },
    fetchPolicy: "network-only",
  });

  // Welcome to risk administrative

  const draftRisk = dataRisk?.risk?.draft;
  const hasEditAccessRisk = dataRisk?.risk?.hasEditAccess || false;
  const requestStatusRisk = dataRisk?.risk?.requestStatus;
  const requestEditState = dataRisk?.risk?.requestEdit?.state;

  const premiseRisk = useEditState({
    draft: draftRisk,
    hasEditAccess: hasEditAccessRisk,
    requestStatus: requestStatusRisk,
    requestEditState: requestEditState,
  });
  async function handleApproveRequest(id: string) {
    try {
      await approveEditMutation({ variables: { id, approve: true } });
      notifySuccess("You Gave Permission");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  async function handleRejectRequest(id: string) {
    try {
      await approveEditMutation({ variables: { id, approve: false } });
      notifySuccess("You Restrict Permission");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  const [
    requestEditMutation,
    requestEditMutationInfo,
  ] = useCreateRequestEditMutation({
    variables: { id: riskId, type: "Risk" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    refetchQueries: ["risk"],
  });
  const [reviewMutation, reviewMutationInfo] = useReviewRiskDraftMutation({
    refetchQueries: ["risk"],
    // onCompleted: () => {
    //   window.location.reload();
    // },
  });
  async function reviewRisk({ publish }: { publish: boolean }) {
    try {
      await reviewMutation({ variables: { id: riskId, publish } });
      notifySuccess(publish ? "Changes Approved" : "Changes Rejected");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  const renderRiskAction = () => {
    if (premiseRisk === 6) {
      return (
        <Tooltip description="Accept edit request">
          <DialogButton
            title={`Accept request to edit?`}
            message={`Request by ${dataRisk?.risk?.requestEdit?.user?.name}`}
            className="soft red mr-2"
            data={dataRisk?.risk?.requestEdit?.id}
            onConfirm={handleApproveRequest}
            onReject={handleRejectRequest}
            actions={{ no: "Reject", yes: "Approve" }}
            loading={approveEditMutationResult.loading}
          >
            <FaExclamationCircle />
          </DialogButton>
        </Tooltip>
      );
    }
    if (premiseRisk === 5) {
      return (
        <Tooltip
          description="Waiting approval"
          subtitle="You will be able to edit as soon as Admin gave you permission"
        >
          <Button disabled className="soft orange mr-2">
            <AiOutlineClockCircle />
          </Button>
        </Tooltip>
      );
    }
    if (premiseRisk === 4) {
      return (
        <Tooltip description="Request edit access">
          <DialogButton
            title="Request access to edit?"
            onConfirm={() => requestEditMutation()}
            loading={requestEditMutationInfo.loading}
            className="soft red mr-2"
            disabled={requestStatusRisk === "requested"}
          >
            <AiOutlineEdit />
          </DialogButton>
        </Tooltip>
      );
    }
    if (premiseRisk === 3) {
      if (riskModal) {
        return null;
      }
      return (
        <div className="d-flex">
          <Tooltip description="Edit Risk">
            <Button
              onClick={() =>
                editRisk({
                  id: dataRisk?.risk?.id || "",
                  name: dataRisk?.risk?.name || "",
                  businessProcessIds:
                    dataRisk?.risk?.businessProcesses?.map(toLabelValue) || [],
                  levelOfRisk: dataRisk?.risk?.levelOfRisk as LevelOfRisk,
                  typeOfRisk: dataRisk?.risk?.typeOfRisk as TypeOfRisk,
                })
              }
              color=""
              className="soft orange"
            >
              <AiFillEdit />
            </Button>
          </Tooltip>
        </div>
      );
    }
    if (premiseRisk === 2) {
      return (
        <div className="d-flex">
          <DialogButton
            color="danger"
            className="mr-2"
            onConfirm={() => reviewRisk({ publish: false })}
            loading={reviewMutationInfo.loading}
          >
            Reject
          </DialogButton>
          <DialogButton
            color="primary"
            className="pwc"
            onConfirm={() => reviewRisk({ publish: true })}
            loading={reviewMutationInfo.loading}
          >
            Approve
          </DialogButton>
        </div>
      );
    }
    return null;
  };
  const draftRiskReal = dataRisk?.risk?.draft?.objectResult;
  const riskName = draftRiskReal
    ? get(dataRisk, "risk.draft.objectResult.name")
    : dataRisk?.risk?.name || "";

  const renderRiskDetails = () => {
    const levelOfRisk = dataRisk?.risk?.levelOfRisk || "";
    const typeOfRisk = dataRisk?.risk?.typeOfRisk || "";
    const bps = dataRisk?.risk?.businessProcess;
    const updatedAt = dataRisk?.risk?.updatedAt;
    const updatedBy = dataRisk?.risk?.lastUpdatedBy;
    const createdBy = dataRisk?.risk?.createdBy;
    const createdAt = dataRisk?.risk?.createdAt;

    const details1 = [
      { label: "Risk Id", value: riskId },
      { label: "Name", value: riskName },
      {
        label: "Business Process",
        value: bps?.join(", "),
      },
      {
        label: "Level of Risk",
        value: (
          <Badge color={getRiskColor(levelOfRisk)}>
            {startCase(levelOfRisk)}
          </Badge>
        ),
      },
      {
        label: "Type of Risk",
        value: <Badge color="secondary">{startCase(typeOfRisk)}</Badge>,
      },
    ];
    const details2 = [
      {
        label: "Last Updated",
        value: updatedAt?.split(" ")[0],
      },
      {
        label: "Updated By",
        value: updatedBy,
      },
      {
        label: "Created At",
        value: createdAt?.split(" ")[0],
      },
      {
        label: "Created By",
        value: createdBy,
      },
      {
        label: "Status",
        value: draftRisk ? "Waiting for review" : "Release",
      },
    ];
    return (
      <Route exact path="/risk-and-control/:id/risk/:id">
        {loadingRisk ? (
          <LoadingSpinner centered size={30} />
        ) : (
          <Row>
            <Col xs={6}>
              <dl>
                {details1.map((item) => (
                  <Fragment key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value || "-"}</dd>
                  </Fragment>
                ))}
              </dl>
            </Col>
            <Col xs={6}>
              {details2.map((item) => (
                <Fragment key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value || "-"}</dd>
                </Fragment>
              ))}
            </Col>
          </Row>
        )}
      </Route>
    );
  };

  //control Bar

  const [controlId, setControlId] = useState("");
  useEffect(() => {
    if (currentUrl.includes("/control/")) {
      setControlId(currentUrl.split("/control/")[1]);
    }
  }, [currentUrl]);
  const { loading: loadingControl, data: dataControl } = useControlQuery({
    skip: !controlId,
    fetchPolicy: "network-only",
    variables: { id: controlId },
  });
  const draftControlReal = dataControl?.control?.draft?.objectResult;
  const draftControl = dataControl?.control?.draft;

  const descriptionControl = draftControlReal
    ? get(dataControl, "control.draft.objectResult.description", "")
    : dataControl?.control?.description || "";
  const hasEditAccessControl = dataControl?.control?.hasEditAccess || false;
  const requestStatusControl = dataControl?.control?.requestStatus;
  const requestEditStateControl = dataControl?.control?.requestEdit?.state;

  // welcome to administrative control

  const premiseControl = useEditState({
    draft: draftControl,
    hasEditAccess: hasEditAccessControl,
    requestStatus: requestStatusControl,
    requestEditState: requestEditStateControl,
  });
  const [
    approveEditMutation,
    approveEditMutationResult,
  ] = useApproveRequestEditMutation({
    refetchQueries: ["control", "risk"],
    onError: notifyGraphQLErrors,
  });
  async function handleApproveRequestControl(id: string) {
    try {
      await approveEditMutation({
        variables: { id, approve: true },
      });
      notifySuccess("You Gave Permission");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  async function handleRejectRequestControl(id: string) {
    try {
      await approveEditMutation({
        variables: { id, approve: false },
      });
      notifySuccess("You Restrict Permission");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  const [
    requestEditMutationControl,
    requestEditMutationControlInfo,
  ] = useCreateRequestEditMutation({
    variables: { id: controlId, type: "Control" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    refetchQueries: ["control"],
  });
  const [
    reviewMutationControl,
    reviewMutationControlInfo,
  ] = useReviewControlDraftMutation({
    refetchQueries: ["control"],
    awaitRefetchQueries: true,
  });
  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewMutationControl({ variables: { id: controlId, publish } });
      notifySuccess(publish ? "Changes Approved" : "Changes Rejected");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  const renderControlAction = () => {
    if (premiseControl === 6) {
      return (
        <Tooltip description="Accept edit request">
          <DialogButton
            title={`Accept request to edit?`}
            message={`Request by ${dataControl?.control?.requestEdit?.user?.name}`}
            className="soft red mr-2"
            data={dataControl?.control?.requestEdit?.id}
            onConfirm={handleApproveRequestControl}
            onReject={handleRejectRequestControl}
            actions={{ no: "Reject", yes: "Approve" }}
            loading={approveEditMutationResult.loading}
          >
            <FaExclamationCircle />
          </DialogButton>
        </Tooltip>
      );
    }
    if (premiseControl === 5) {
      return (
        <Tooltip
          description="Waiting approval"
          subtitle="You will be able to edit as soon as Admin gave you permission"
        >
          <Button disabled className="soft orange mr-2">
            <AiOutlineClockCircle />
          </Button>
        </Tooltip>
      );
    }
    if (premiseControl === 4) {
      return (
        <Tooltip description="Request edit access">
          <DialogButton
            title="Request access to edit?"
            onConfirm={() => requestEditMutationControl()}
            loading={requestEditMutationControlInfo.loading}
            className="soft red mr-2"
            disabled={requestStatusControl === "requested"}
          >
            <AiOutlineEdit />
          </DialogButton>
        </Tooltip>
      );
    }
    if (premiseControl === 3) {
      if (controlModal) {
        return null;
      }
      return (
        <div className="d-flex">
          <Tooltip description="Edit Control">
            <Button
              onClick={() =>
                editControl({
                  id: dataControl?.control?.id || "",
                  assertion: dataControl?.control?.assertion as Assertion[],
                  controlOwner:
                    dataControl?.control?.departments?.map((a) => a.id) || [],
                  description: dataControl?.control?.description || "",
                  typeOfControl: dataControl?.control
                    ?.typeOfControl as TypeOfControl,
                  nature: dataControl?.control?.nature as Nature,
                  ipo: dataControl?.control?.ipo as Ipo[],
                  businessProcessIds:
                    dataControl?.control?.businessProcesses?.map(
                      ({ id }) => id
                    ) || [],
                  frequency: dataControl?.control?.frequency as Frequency,
                  keyControl: dataControl?.control?.keyControl || false,
                  riskIds:
                    dataControl?.control?.risks?.map(({ id }) => id) || [],
                  activityControls: dataControl?.control?.activityControls,
                })
              }
              color=""
              className="soft orange"
            >
              <AiFillEdit />
            </Button>
          </Tooltip>
        </div>
      );
    }
    if (premiseControl === 2) {
      return (
        <div className="d-flex">
          <DialogButton
            color="danger"
            className="mr-2"
            onConfirm={() => review({ publish: false })}
            loading={reviewMutationControlInfo.loading}
          >
            Reject
          </DialogButton>
          <DialogButton
            color="primary"
            className="pwc"
            onConfirm={() => review({ publish: true })}
            loading={reviewMutationControlInfo.loading}
          >
            Approve
          </DialogButton>
        </div>
      );
    }
    return null;
  };
  const renderControlDetails = () => {
    const keyControl = dataControl?.control?.keyControl || false;
    const risks = dataControl?.control?.risks || [];
    const businessProcesses = dataControl?.control?.businessProcesses || [];
    const activityControls = dataControl?.control?.activityControls || [];
    const createdAt = dataControl?.control?.createdAt || "";
    const departments = dataControl?.control?.departments || [];

    const updatedAt = draftControlReal
      ? get(dataControl, "control.draft.objectResult.updatedAt", "")
      : dataControl?.control?.updatedAt?.split(" ")[0] || "";
    const lastUpdatedBy = draftControlReal
      ? get(dataControl, "control.draft.objectResult.lastUpdatedBy", "")
      : dataControl?.control?.lastUpdatedBy || "";
    const createdBy = draftControlReal
      ? get(dataControl, "control.draft.objectResult.createdBy", "")
      : dataControl?.control?.createdBy || "";
    const assertion = draftControlReal
      ? get(dataControl, "control.draft.objectResult.assertion", [])
      : dataControl?.control?.assertion || [];
    const frequency = draftControlReal
      ? get(dataControl, "control.draft.objectResult.frequency", "")
      : dataControl?.control?.frequency || "";
    const ipo = draftControlReal
      ? get(dataControl, "control.draft.objectResult.ipo", [])
      : dataControl?.control?.ipo || [];
    const typeOfControl = draftControlReal
      ? get(dataControl, "control.draft.objectResult.typeOfControl", "")
      : dataControl?.control?.typeOfControl || "";
    const filteredNames = (names: any) =>
      names.filter((v: any, i: any) => names.indexOf(v) === i);

    const details = [
      { label: "Control ID", value: controlId },
      { label: "Description", value: descriptionControl },

      {
        label: "Control Owner",
        value: departments.map((a: any) => a.name).join(", "),
      },
      {
        label: "Key Control",
        value: (
          <input type="checkbox" checked={keyControl} onChange={() => {}} />
        ),
      },
      { label: "Type of Control", value: capitalCase(typeOfControl) },
      {
        label: "Assertion",
        value: assertion.map((x: any) => capitalCase(x)).join(", "),
      },
      {
        label: "IPO",
        value: ipo.map((x: any) => capitalCase(x)).join(", "),
      },
      { label: "Frequency", value: capitalCase(frequency) },
      {
        label: "Status",
        value: `${draftControl ? "Waiting for review" : "Release"}`,
      },
      { label: "Last Updated", value: updatedAt },
      { label: "Last Updated By", value: lastUpdatedBy },
      { label: "Created At", value: createdAt.split(" ")[0] },
      { label: "Created By", value: createdBy },
    ];
    return (
      <Route exact path="/risk-and-control/:id/control/:id">
        {loadingControl ? (
          <LoadingSpinner centered size={30} />
        ) : (
          <Row>
            <Col xs={6}>
              <dl>
                {details.slice(0, Math.ceil(details.length / 2)).map((item) => (
                  <Fragment key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value || "-"}</dd>
                  </Fragment>
                ))}
                <dt>Risks</dt>
                {risks.length ? (
                  filteredNames(risks).map((risk: any) => (
                    <dd key={risk.id}>{risk.name}</dd>
                  ))
                ) : (
                  <EmptyAttribute />
                )}
                <dt>Business Processes</dt>
                {businessProcesses.length ? (
                  filteredNames(businessProcesses).map((bp: any) => (
                    <dd key={bp.id}>{bp.name}</dd>
                  ))
                ) : (
                  <EmptyAttribute />
                )}
              </dl>
            </Col>
            <Col xs={6}>
              <dl>
                {details
                  .slice(Math.ceil(details.length / 2), details.length)
                  .map((item) => (
                    <Fragment key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value || "-"}</dd>
                    </Fragment>
                  ))}
              </dl>
            </Col>

            {activityControls.length > 0 ? (
              <Col xs={7} className="mt-2">
                <dt className="mb-1">Control Activities</dt>
                <Table>
                  <thead>
                    <tr>
                      <th style={{ fontSize: "13px", fontWeight: "normal" }}>
                        Control Activity
                      </th>
                      <th style={{ fontSize: "13px", fontWeight: "normal" }}>
                        Guidance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityControls.map((activity) => (
                      <tr key={"Row" + activity.id}>
                        <td style={{ fontSize: "13px", fontWeight: "normal" }}>
                          {activity.activity}
                        </td>
                        <td style={{ fontSize: "13px", fontWeight: "normal" }}>
                          {activity.guidance ? (
                            activity.guidance
                          ) : (
                            <div className="d-flex align-items-center ">
                              <Button color="" className="soft orange">
                                <a
                                  href={`${APP_ROOT_URL}${activity.guidanceResuploadUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={`Pwc-ActivityControl ${activity.guidanceFileName}`}
                                  className="text-orange"
                                >
                                  <span className="mr-2">
                                    {activity.guidanceFileName}
                                  </span>
                                  <IoMdOpen />
                                </a>
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            ) : null}
          </Row>
        )}
      </Route>
    );
  };

  //Query for rating resource
  const { data: dataRating } = useResourceRatingsQuery({
    skip: !resourceId && currentUrl.includes("resources/"),
    variables: { filter: { user_id_eq: userId, resource_id_eq: resourceId } },
    fetchPolicy: "network-only",
  });
  const resourceName = dataResource?.resource?.name || "";
  const draftRes = dataResource?.resource?.draft;
  const renderResourceDetails = () => {
    const totalRating = dataResource?.resource?.totalRating || 0;
    const visit = dataResource?.resource?.visit || 0;
    const resourceFileType = dataResource?.resource?.resourceFileType;
    const businessProcess = dataResource?.resource?.businessProcess;
    const resuploadUrl = dataResource?.resource?.resuploadUrl;
    const category = dataResource?.resource?.category;
    const resuploadLink = dataResource?.resource?.resuploadLink;
    const policies = dataResource?.resource?.policies || [];
    const bps = dataResource?.resource?.businessProcess;
    const base64File = dataResource?.resource?.base64File;
    const rating =
      dataRating?.resourceRatings?.collection.map((a) => a.rating).pop() || 0;
    const imagePreviewUrl = resuploadLink
      ? resuploadLink
      : resuploadUrl && !resuploadLink?.includes("original/missing.png")
      ? `${APP_ROOT_URL}${resuploadUrl}`
      : undefined;

    return (
      <Route exact path="/risk-and-control/:id/resources/:id">
        <div>
          <Row>
            {resourceName ? (
              <Fragment>
                <Col xs={12} lg={6}>
                  <ResourceBox
                    base64File={base64File}
                    id={resourceId}
                    name={resourceName}
                    rating={rating}
                    totalRating={totalRating}
                    views={visit}
                    imagePreviewUrl={imagePreviewUrl}
                    resourceFileType={resourceFileType}
                  />
                </Col>
                <Col xs={12} lg={6}>
                  <div className="mt-5 mt-lg-0">
                    <h5>
                      Category:&nbsp;
                      <span className="text-orange">{category}</span>
                    </h5>
                    {category === "Flowchart" ? (
                      <>
                        <h5 className="mt-5">Business Process:</h5>
                        <Link to={`/risk-and-control/${businessProcess?.id}`}>
                          {businessProcess?.name}
                        </Link>
                      </>
                    ) : (
                      <>
                        <div>
                          <h5 className="mt-5">Related Business Process:</h5>
                          {bps ? (
                            <ul>
                              <li>{bps.name}</li>
                            </ul>
                          ) : (
                            <EmptyAttribute centered={false} />
                          )}
                        </div>
                        <div>
                          <h5 className="mt-5">Related Policies:</h5>
                          {policies.length ? (
                            <ul>
                              {policies.map((policy) => (
                                <li key={policy.id}>
                                  <Link to={`/policy/${policy.id}`}>
                                    {policy.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <EmptyAttribute centered={false} />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </Col>
              </Fragment>
            ) : null}
          </Row>
        </div>
      </Route>
    );
  };
  if (loadingRisksnControl || loading || loadingResource)
    return <LoadingSpinner size={30} centered />;

  const renderActions = () => {
    return (
      <div className="d-flex align-items-center">
        {!history.location.pathname.includes("resources") &&
          !history.location.pathname.includes("flowchart") && (
            <Tooltip
              description={
                collapse.length === initialCollapse.length
                  ? "Hide All Attribute"
                  : "Show All Attribute"
              }
            >
              <Button
                className="ml-3"
                color="transparent"
                onClick={() => {
                  collapse.length === initialCollapse.length
                    ? closeAllCollapse()
                    : openAllCollapse();
                }}
              >
                {collapse.length === initialCollapse.length ? (
                  <FaMinus size={20} />
                ) : (
                  <FaBars size={20} />
                )}
              </Button>
            </Tooltip>
          )}

        <Menu
          data={
            bookmarkLoading
              ? [
                  {
                    label: (
                      <Fragment>
                        <LoadingSpinner className="mt-2 mb-2" centered />
                      </Fragment>
                    ),
                  },
                ]
              : isBookmarked.length
              ? [
                  {
                    label: (
                      <div>
                        <FaFilePdf /> Preview
                      </div>
                    ),
                    onClick: () =>
                      previewPdf(`prints/${id}/business_process.pdf`, {
                        onStart: () =>
                          notifyInfo("Downloading file for preview", {
                            autoClose: 10000,
                          }),
                      }),
                  },
                  {
                    label: (
                      <div>
                        <IoMdDownload /> Download
                      </div>
                    ),
                    onClick: () =>
                      downloadPdf(`prints/${id}/business_process.pdf`, {
                        fileName: name,
                        onStart: () => notifyInfo("Download Started"),
                        onError: () => notifyError("Download Failed"),
                        onCompleted: () => notifySuccess("Download Success"),
                      }),
                  },
                  {
                    label: (
                      <div>
                        <MdEmail /> Mail
                      </div>
                    ),
                    onClick: () => emailPdf(name),
                  },
                ]
              : [
                  {
                    label: (
                      <div>
                        <FaFilePdf /> Preview
                      </div>
                    ),
                    onClick: () =>
                      previewPdf(`prints/${id}/business_process.pdf`, {
                        onStart: () =>
                          notifyInfo("Downloading file for preview", {
                            autoClose: 10000,
                          }),
                      }),
                  },
                  {
                    label: (
                      <div>
                        <IoMdDownload /> Download
                      </div>
                    ),
                    onClick: () =>
                      downloadPdf(`prints/${id}/business_process.pdf`, {
                        fileName: name,
                        onStart: () => notifyInfo("Download Started"),
                        onError: () => notifyError("Download Failed"),
                        onCompleted: () => notifySuccess("Download Success"),
                      }),
                  },
                  {
                    label: (
                      <div>
                        <FaBookmark /> Bookmark
                      </div>
                    ),
                    onClick: () => addBookmark({ variables: { id } }),
                  },
                  {
                    label: (
                      <div>
                        <MdEmail /> Mail
                      </div>
                    ),
                    onClick: () => emailPdf(name),
                  },
                ]
          }
        >
          <FaEllipsisV />
        </Menu>
      </div>
    );
  };

  return (
    <div>
      <BreadCrumb
        crumbs={
          history.location.pathname.includes("resources/")
            ? [
                ["/risk-and-control", "Risk and Controls"],
                ...breadcrumb,
                ["/risk-and-control/" + id, name],
                ["/risk-and-control/" + resourceId, resourceName],
              ]
            : history.location.pathname.includes("risk/")
            ? [
                ["/risk-and-control", "Risk and Controls"],
                ...breadcrumb,
                ["/risk-and-control/" + id, name],
                ["/risk-and-control/" + riskId, riskName],
              ]
            : currentUrl.includes("/control/")
            ? [
                ["/risk-and-control", "Risk and Controls"],
                ...breadcrumb,
                ["/risk-and-control/" + id, name],
                ["/risk-and-control/" + controlId, descriptionControl],
              ]
            : [
                ["/risk-and-control", "Risk and Controls"],
                ...breadcrumb,
                ["/risk-and-control/" + id, name],
              ]
        }
      />
      <div className="d-flex justify-content-between align-items-center">
        <HeaderWithBackButton
          heading={
            currentUrl.includes("resources/")
              ? resourceName
              : currentUrl.includes("risk/")
              ? riskName
              : currentUrl.includes("/control/")
              ? descriptionControl
              : name
          }
          draft={
            currentUrl.includes("resources/")
              ? !!draftRes
              : currentUrl.includes("risk/")
              ? !!draftRisk
              : currentUrl.includes("/control/")
              ? !!draftControl
              : undefined
          }
        />

        {currentUrl.includes("/control/")
          ? renderControlAction()
          : currentUrl.includes("risk/")
          ? renderRiskAction()
          : currentUrl.includes("resources/")
          ? null
          : renderActions()}
      </div>
      {currentUrl.includes("resources/") ||
      currentUrl.includes("risk/") ||
      currentUrl.includes("/control/") ? null : (
        <Nav tabs className="tabs-pwc">
          {!currentUrl.includes("resources/") &&
            tabs.map((tab, index) => (
              <NavItem key={index}>
                <NavLink
                  exact
                  to={tab.to}
                  className="nav-link"
                  activeClassName="active"
                >
                  {tab.title}
                </NavLink>
              </NavItem>
            ))}
        </Nav>
      )}
      {renderResourceDetails()}
      {renderRiskDetails()}
      {renderControlDetails()}
      <TabContent>
        <TabPane>
          <Route
            exact
            path="/risk-and-control/:id/flowchart"
            render={() => (
              <Flowcharts
                history={history.location.pathname}
                bpId={id}
                loading={loadingResources}
                resources={resources.filter((resource) =>
                  resource.category?.match(/flowchart/gi)
                )}
              />
            )}
          />
          <Route exact path="/risk-and-control/:id">
            <Collapsible
              title="Risks"
              show={collapse.includes("Risks")}
              onClick={toggleCollapse}
            >
              {risks.length ? (
                <ul>
                  {modifiedRisks.map((risk) => (
                    <li key={risk?.id || ""}>
                      <div className="mb-3 d-flex justify-content-between">
                        <Link
                          to={`/risk-and-control/${
                            currentUrl.split("control/")[1]
                          }/risk/${risk?.id || ""}`}
                          onClick={() => {
                            setRiskId(risk?.id || "");
                          }}
                        >
                          <h5>
                            {risk?.name}
                            <Badge
                              color={`${getRiskColor(risk?.levelOfRisk)} mx-3`}
                            >
                              {startCase(risk?.levelOfRisk || "")}
                            </Badge>
                            <Badge color="secondary">
                              {startCase(risk?.typeOfRisk || "")}
                            </Badge>
                          </h5>
                        </Link>

                        {/* {(isAdmin || isAdminPreparer) &&
                          risk?.hasEditAccess &&
                          !risk.draft &&
                          isAdminPreparer && (
                            <Button
                              onClick={() =>
                                editRisk({
                                  id: risk.id,
                                  name: risk.name || "",
                                  businessProcessIds:
                                    risk.businessProcesses?.map(toLabelValue) ||
                                    [],
                                  levelOfRisk: risk.levelOfRisk as LevelOfRisk,
                                  typeOfRisk: risk.typeOfRisk as TypeOfRisk,
                                })
                              }
                              color=""
                            >
                              <FaPencilAlt />
                            </Button>
                          )} */}
                      </div>
                      {isUser ? (
                        dataModifier(
                          risk?.controls?.filter((a: any) => a.draft === null)
                        ).length ? (
                          <>
                            <h6>Control</h6>
                            <ControlsTable
                              history={history.location.pathname}
                              controls={dataModifier(
                                risk?.controls?.filter(
                                  (a: any) => a.draft === null
                                )
                              )}
                              editControl={editControl}
                            />
                          </>
                        ) : null
                      ) : dataModifier(risk?.controls).length ? (
                        <>
                          <h6>Control</h6>
                          <ControlsTable
                            history={history.location.pathname}
                            controls={dataModifier(risk?.controls)}
                            editControl={editControl}
                          />
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyAttribute />
              )}
            </Collapsible>
            {/* <Collapsible
              title="Controls"
              show={collapse.includes("Controls")}
              onClick={toggleCollapse}
            >
              {controls.length ? (
                <ControlsTable controls={controls} editControl={editControl} />
              ) : (
                <EmptyAttribute></EmptyAttribute>
              )}
            </Collapsible> */}
          </Route>
          <Route exact path="/risk-and-control/:id/resources">
            <ResourcesTab
              setResourceId={setResourceId}
              bPId={id}
              // risksnControls
              isDraft={null}
              formDefaultValues={{
                category: { label: "Flowchart", value: "Flowchart" },
                businessProcessId: { label: name, value: id },
              }}
              queryFilters={{
                business_process_id_in: id,
              }}
            />
          </Route>
        </TabPane>
      </TabContent>

      <Modal isOpen={riskModal} toggle={toggleRiskModal} title="Edit Risk">
        <RiskForm
          setModal={setRiskModal}
          defaultValues={risk}
          onSubmit={handleUpdateRisk}
          submitting={updateRiskM.loading}
        />
      </Modal>

      <Modal
        isOpen={controlModal}
        toggle={toggleControlModal}
        title="Edit Control"
      >
        <ControlForm
          setModal={setControlModal}
          defaultValues={control}
          onSubmit={handleUpdateControl}
          submitting={updateControlM.loading}
        />
      </Modal>
    </div>
  );
}

interface RiskState extends RiskFormValues {
  id: string;
}

interface ControlState extends ControlFormValues {
  id: string;
}

const ControlsTable = ({
  controls,
  editControl,
  history,
}: {
  controls: Control[];
  editControl: Function;
  history?: any;
}) => {
  const assertionAndIpoModifier = (data: any) => {
    let finalData: any = data;
    const existence_and_occurence = finalData.findIndex(
      (a: any) => a === "existence_and_occurence"
    );
    const cut_over = finalData.findIndex((a: any) => a === "cut_over");
    const rights_and_obligation = finalData.findIndex(
      (a: any) => a === "rights_and_obligation"
    );
    const presentation_and_disclosure = finalData.findIndex(
      (a: any) => a === "presentation_and_disclosure"
    );
    const accuracy = finalData.findIndex((a: any) => a === "accuracy");
    const completeness = finalData.findIndex((a: any) => a === "completeness");
    const validation = finalData.findIndex((a: any) => a === "validation");
    const restriction = finalData.findIndex((a: any) => a === "restriction");

    if (existence_and_occurence !== -1) {
      finalData[existence_and_occurence] = "E/O ";
    }
    if (cut_over !== -1) {
      finalData[cut_over] = "CO";
    }
    if (rights_and_obligation !== -1) {
      finalData[rights_and_obligation] = "R&O";
    }
    if (presentation_and_disclosure !== -1) {
      finalData[presentation_and_disclosure] = "P&D";
    }
    if (accuracy !== -1) {
      finalData[accuracy] = "A";
    }
    if (completeness !== -1) {
      finalData[completeness] = "C";
    }
    if (validation !== -1) {
      finalData[validation] = "V";
    }
    if (restriction !== -1) {
      finalData[restriction] = "R";
    }
    return finalData.join(", ");
  };
  // const [isAdmin, isAdminPreparer] = useAccessRights([
  //   "admin",
  //   "admin_preparer",
  // ]);
  return (
    <div className="table-responsive">
      <Table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Freq</th>
            <th>Type of Control</th>
            <th>Nature</th>
            <th>Assertion</th>
            <th>IPO</th>
            <th>Control Owner</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {controls?.length ? (
            controls?.map((control) => (
              <tr key={control.id}>
                <td>
                  <Link
                    to={`/risk-and-control/${
                      history.split("control/")[1]
                    }/control/${control.id}`}
                  >
                    {control.description}
                  </Link>
                </td>
                <td>{startCase(control.frequency || "")}</td>
                <td>{startCase(control.typeOfControl || "")}</td>
                <td>{startCase(control.nature || "")}</td>
                <td>{assertionAndIpoModifier(control.assertion)}</td>
                <td>{assertionAndIpoModifier(control.ipo)}</td>
                <td>{control.controlOwner}</td>
                {/* <td>
                  {(isAdmin || isAdminPreparer) &&
                    control.hasEditAccess &&
                    !control.draft &&
                    isAdminPreparer && (
                      <Button
                        onClick={() =>
                          editControl({
                            id: control.id,
                            assertion: control.assertion as Assertion[],
                            controlOwner: control.controlOwner || "",
                            description: control.description || "",
                            status: control.status as Status,
                            typeOfControl: control.typeOfControl as TypeOfControl,
                            nature: control.nature as Nature,
                            ipo: control.ipo as Ipo[],
                            businessProcessIds:
                              control?.businessProcesses?.map(({ id }) => id) ||
                              [],
                            frequency: control.frequency as Frequency,
                            keyControl: control.keyControl || false,
                            riskIds: control?.risks?.map(({ id }) => id) || [],
                            activityControls: control.activityControls,
                          })
                        }
                        color=""
                      >
                        <FaPencilAlt />
                      </Button>
                    )}
                </td> */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>
                <EmptyAttribute />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};
