import { capitalCase } from "capital-case";
import get from "lodash/get";
import React, { useState, useRef, useCallback } from "react";
import Helmet from "react-helmet";
import {
  FaBookmark,
  FaEllipsisV,
  FaEye,
  FaEyeSlash,
  FaFilePdf,
  FaTimes,
  FaTrash
} from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { MdEmail, MdModeEdit } from "react-icons/md";
import { RouteComponentProps, Route } from "react-router";
import { Link, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  CreateResourceInput,
  Status,
  useCreateBookmarkPolicyMutation,
  useCreateResourceMutation,
  useDestroyPolicyMutation,
  usePolicyQuery,
  useUpdatePolicyMutation,
  useReviewPolicyDraftMutation
} from "../../generated/graphql";
// import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import Collapsible from "../../shared/components/Collapsible";
import DialogButton from "../../shared/components/DialogButton";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import Menu from "../../shared/components/Menu";
import ResourceBar, {
  AddResourceButton
} from "../../shared/components/ResourceBar";
import Table from "../../shared/components/Table";
import {
  downloadPdf,
  emailPdf,
  previewPdf
} from "../../shared/utils/accessGeneratedPdf";
import { formatPolicyChart } from "../../shared/utils/formatPolicy";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import ResourceForm, {
  ResourceFormValues
} from "../resources/components/ResourceForm";
import PolicyDashboard from "./components/PolicyDashboard";
import PolicyForm, { PolicyFormValues } from "./components/PolicyForm";
import SubPolicyForm, { SubPolicyFormValues } from "./components/SubPolicyForm";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Modal from "../../shared/components/Modal";
import Tooltip from "../../shared/components/Tooltip";
import { Nav, NavItem, TabContent, TabPane } from "reactstrap";
import useAccessRights from "../../shared/hooks/useAccessRights";

const Policy = ({ match, history, location }: RouteComponentProps) => {
  const subPolicyRef = useRef<HTMLInputElement>(null);
  const riskRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<HTMLInputElement>(null);
  const initialCollapse = ["Resources", "Risks", "Controls", "Sub-Policies"];
  const [collapse, setCollapse] = useState(initialCollapse);
  const toggleCollapse = (name: string) =>
    setCollapse(p => {
      if (p.includes(name)) {
        return p.filter(item => item !== name);
      }
      return p.concat(name);
    });
  const openAllCollapse = () => setCollapse(initialCollapse);
  const closeAllCollapse = () => setCollapse([]);

  const [inEditMode, setInEditMode] = useState(false);
  const toggleEditMode = () => setInEditMode(prev => !prev);

  const [addResourceModal, setAddResourceModal] = useState(false);
  const toggleAddResourceModal = () => setAddResourceModal(prev => !prev);

  const id = get(match, "params.id", "");
  const { loading, data } = usePolicyQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });

  const isAdminMenu = location.pathname.split("/")[1] === "policy-admin";
  const [isAdmin] = useAccessRights(["admin"]);
  const draft = oc(data).policy.draft.objectResult();

  // Delete current policy
  const [destroyMain] = useDestroyPolicyMutation({
    onCompleted: () => {
      const url = isAdminMenu ? "/policy-admin" : "/policy";
      toast.success("Delete Success");
      history.push(url);
    },
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["policies", "policyTree"],
    awaitRefetchQueries: true
  });
  function handleDeleteMain() {
    destroyMain({ variables: { id } });
  }

  // Delete child policy
  const [destroy] = useDestroyPolicyMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["policy"],
    awaitRefetchQueries: true
  });
  function handleDelete(id: string) {
    destroy({ variables: { id } });
  }

  // Bookmark policy
  const [addBookmark] = useCreateBookmarkPolicyMutation({
    onCompleted: _ => toast.success("Added to bookmark"),
    onError: _ => toast.error("Failed to add bookmark"),
    awaitRefetchQueries: true,
    refetchQueries: ["bookmarkPolicies"]
  });

  // Update Policy / Sub-Policy
  const [update, updateState] = useUpdatePolicyMutation({
    onCompleted: () => {
      toast.success("Update Success");
      toggleEditMode();
    },
    onError: () => toast.error("Update Failed"),
    refetchQueries: ["policies", "policyTree", "policy"],
    awaitRefetchQueries: true
  });
  function handleUpdate(values: PolicyFormValues) {
    update({
      variables: {
        input: {
          id,
          title: values.title,
          policyCategoryId: values.policyCategoryId,
          description: values.description,
          status: values.status
        }
      }
    });
  }
  function handleUpdateSubPolicy(values: SubPolicyFormValues) {
    update({
      variables: {
        input: {
          id,
          resourceIds: values.resourceIds,
          businessProcessIds: values.businessProcessIds,
          description: values.description,
          referenceIds: values.referenceIds,
          controlIds: values.controlIds,
          riskIds: values.riskIds,
          status: values.status
        }
      }
    });
  }

  // Add Resource for current policy
  const [createResource, createResourceM] = useCreateResourceMutation({
    onCompleted: _ => {
      toast.success("Resource Added");
      toggleAddResourceModal();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["policy"]
  });
  function handleCreateResource(values: ResourceFormValues) {
    const input: CreateResourceInput = {
      category: values.category,
      name: values.name,
      resuploadBase64: values.resuploadBase64,
      resuploadFileName: values.resuploadFileName,
      policyIds: values.policyIds,
      controlIds: values.controlId ? [values.controlId] : [],
      businessProcessId: values.businessProcessId
    };
    createResource({ variables: { input } });
  }

  const [reviewPolicy, reviewPolicyM] = useReviewPolicyDraftMutation({
    refetchQueries: ["policy"],
    onError: notifyGraphQLErrors
  });

  function review({ publish }: { publish: boolean }) {
    reviewPolicy({ variables: { id, publish } }).then(() => {
      notifySuccess(publish ? "Changes published" : "Changes rejected");
    });
  }

  let title: string = oc(data).policy.title("");
  title = draft ? `[Draft] ${title}` : title;
  const description = draft
    ? get(data, "policy.draft.objectResult.description", "")
    : oc(data).policy.description("");
  const policyCategoryId = oc(data).policy.policyCategory.id("");
  const parentId = oc(data).policy.parentId("");
  const children = oc(data).policy.children([]);
  const isSubPolicy: boolean = !!oc(data).policy.ancestry();
  const ancestry = oc(data).policy.ancestry("");
  const referenceIds = oc(data)
    .policy.references([])
    .map(item => item.id);
  const status = oc(data).policy.status("");
  const resources = oc(data).policy.resources([]);
  const controls = oc(data).policy.controls([]);
  const risks = oc(data).policy.risks([]);
  const controlCount = oc(data).policy.controlCount({});
  const riskCount = oc(data).policy.riskCount({});
  const subCount = oc(data).policy.subCount({});

  const scrollToRisk = useCallback(
    () =>
      window.scrollTo({
        top: riskRef.current ? riskRef.current.offsetTop : 0,
        behavior: "smooth"
      }),
    []
  );
  const scrollToSubPolicy = useCallback(
    () =>
      window.scrollTo({
        top: subPolicyRef.current ? subPolicyRef.current.offsetTop : 0,
        behavior: "smooth"
      }),
    []
  );
  const scrollToControl = useCallback(
    () =>
      window.scrollTo({
        top: controlRef.current ? controlRef.current.offsetTop : 0,
        behavior: "smooth"
      }),
    []
  );
  const policyChartData = formatPolicyChart({
    controlCount,
    riskCount,
    subCount
  }).map(item => ({
    ...item,
    onClick: item.label.includes("Risk")
      ? scrollToRisk
      : item.label.includes("Control")
      ? scrollToControl
      : scrollToSubPolicy
  }));

  const isMaximumLevel = ancestry.split("/").length === 5;

  if (loading) return <LoadingSpinner centered size={30} />;

  const renderPolicy = () => {
    const tabs = isAdminMenu
      ? [{ to: `/policy-admin/${id}/details`, title: "Details" }]
      : [
          { to: `/policy/${id}`, title: "Dashboard" },
          { to: `/policy/${id}/details`, title: "Details" },
          { to: `/policy/${id}/resources`, title: "Resources" }
        ];

    return (
      <div>
        <Nav tabs className="tabs-pwc">
          {tabs.map((tab, index) => (
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

        <TabContent>
          <TabPane>
            <Route exact path="/policy/:id">
              <div className="mb-3 py-3">
                <PolicyDashboard data={policyChartData} />
              </div>
            </Route>
            <Route
              exact
              path={
                isAdminMenu
                  ? "/policy-admin/:id/details"
                  : "/policy/:id/details"
              }
            >
              <div className="d-flex justify-content-end">
                {renderPolicyAction()}
              </div>

              <div
                className="mb-3 py-3"
                dangerouslySetInnerHTML={{
                  __html: description
                }}
              />

              <div ref={riskRef}>
                <Collapsible
                  title="Risks"
                  show={collapse.includes("Risks")}
                  onClick={toggleCollapse}
                >
                  {risks.length ? (
                    <div>
                      <ul>
                        {risks.map(risk => {
                          return (
                            <li key={risk.id}>
                              <Link to={`/risk/${risk.id}`}>{risk.name}</Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    <EmptyAttribute />
                  )}
                </Collapsible>
              </div>

              <div ref={controlRef}>
                <Collapsible
                  title="Controls"
                  show={collapse.includes("Controls")}
                  onClick={toggleCollapse}
                >
                  <Table>
                    <thead>
                      <tr>
                        <th>Desc</th>
                        <th>Freq</th>
                        <th>Type of Control</th>
                        <th>Nature</th>
                        <th>IPO</th>
                        <th>Assertion</th>
                        <th>Control Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {controls.length ? (
                        controls.map(control => {
                          return (
                            <tr key={control.id}>
                              <td>
                                <Link to={`/control/${control.id}`}>
                                  {control.description}
                                </Link>
                              </td>
                              <td>{capitalCase(control.frequency || "")}</td>
                              <td>
                                {capitalCase(control.typeOfControl || "")}
                              </td>
                              <td>{capitalCase(control.nature || "")}</td>
                              <td>
                                {oc(control)
                                  .ipo([])
                                  .map(a => capitalCase(a))
                                  .join(", ")}
                              </td>
                              <td>
                                {oc(control)
                                  .assertion([])
                                  .map(a => capitalCase(a))
                                  .join(", ")}
                              </td>
                              <td>{control.controlOwner}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7}>
                            <EmptyAttribute />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Collapsible>
              </div>

              <div ref={subPolicyRef}>
                <Collapsible
                  title="Sub-Policies"
                  show={collapse.includes("Sub-Policies")}
                  onClick={toggleCollapse}
                >
                  {children.length ? (
                    <Table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Description</th>
                          <th>References</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {children.map(item => (
                          <tr key={item.id}>
                            <td>
                              <Link
                                to={
                                  isAdminMenu
                                    ? `/policy-admin/${item.id}/details`
                                    : `/policy/${item.id}`
                                }
                              >
                                {item.title}
                              </Link>
                            </td>
                            <td>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: item.description
                                    ? item.description
                                    : ""
                                }}
                              />
                            </td>
                            <td>
                              {oc(item)
                                .references([])
                                .map(ref => ref.name)
                                .join(", ")}
                            </td>
                            <td>
                              <DialogButton
                                onConfirm={() => handleDelete(item.id)}
                              >
                                <FaTrash />
                              </DialogButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <EmptyAttribute />
                  )}
                </Collapsible>
              </div>
            </Route>
            <Route exact path="/policy/:id/resources">
              <Collapsible
                title="Resources"
                show={collapse.includes("Resources")}
                onClick={toggleCollapse}
              >
                {resources.map(resource => (
                  <ResourceBar key={resource.id} {...resource} />
                ))}
                <AddResourceButton onClick={toggleAddResourceModal} />
              </Collapsible>
            </Route>
          </TabPane>
        </TabContent>
      </div>
    );
  };

  const renderPolicyInEditMode = () => {
    return isSubPolicy ? (
      <SubPolicyForm
        defaultValues={{
          parentId,
          title,
          description,
          referenceIds,
          resourceIds: oc(data)
            .policy.resources([])
            .map(r => r.id),
          businessProcessIds: oc(data)
            .policy.businessProcesses([])
            .map(r => r.id),
          controlIds: oc(data)
            .policy.controls([])
            .map(r => r.id),
          riskIds: oc(data)
            .policy.risks([])
            .map(r => r.id),
          status: status as Status
        }}
        onSubmit={handleUpdateSubPolicy}
        submitting={updateState.loading}
      />
    ) : (
      <PolicyForm
        onSubmit={handleUpdate}
        defaultValues={{
          title,
          policyCategoryId,
          description,
          status: status as Status
        }}
        submitting={updateState.loading}
      />
    );
  };

  const renderPolicyAction = () => {
    if (draft && isAdmin) {
      return (
        <div>
          <DialogButton
            color="danger"
            className="mr-2"
            onConfirm={() => review({ publish: false })}
            loading={reviewPolicyM.loading}
          >
            Reject
          </DialogButton>
          <DialogButton
            color="primary"
            className="pwc"
            onConfirm={() => review({ publish: true })}
            loading={reviewPolicyM.loading}
          >
            Approve
          </DialogButton>
        </div>
      );
    }

    if (draft && !isAdmin) return null;

    if (inEditMode) {
      return (
        <Button onClick={toggleEditMode} color="">
          <FaTimes size={22} className="mr-2" />
          Cancel Edit
        </Button>
      );
    }
    return (
      <div className="d-flex align-items-center">
        {!isMaximumLevel && (
          <Link
            to={
              isAdminMenu
                ? `/policy-admin/${id}/create-sub-policy`
                : `/policy/${id}/create-sub-policy`
            }
          >
            <Button className="pwc">+ Create Sub-Policy</Button>
          </Link>
        )}
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
            <Tooltip description="Hide All Attribute">
              <FaEyeSlash size={20} />
            </Tooltip>
          ) : (
            <Tooltip description="Show All Attribute">
              <FaEye size={20} />
            </Tooltip>
          )}
        </Button>

        <Button onClick={toggleEditMode} color="transparent">
          <Tooltip description="Edit Policy">
            <MdModeEdit size={22} />
          </Tooltip>
        </Button>
        <DialogButton onConfirm={handleDeleteMain} className="mr-3">
          <Tooltip description="Delete Policy">
            <FaTrash className="clickable text-red" />
          </Tooltip>
        </DialogButton>
        <Menu
          data={[
            {
              label: (
                <div>
                  <FaFilePdf /> Preview
                </div>
              ),
              onClick: () =>
                previewPdf(`prints/${id}.pdf`, {
                  onStart: () =>
                    toast.info("Downloading file for preview", {
                      autoClose: 10000
                    })
                })
            },
            {
              label: (
                <div>
                  <IoMdDownload /> Download
                </div>
              ),
              onClick: () =>
                downloadPdf(`prints/${id}.pdf`, {
                  fileName: title,
                  onStart: () => toast.info("Download Started"),
                  onError: () => toast.error("Download Failed"),
                  onCompleted: () => toast.success("Download Success")
                })
            },
            {
              label: (
                <div>
                  <MdEmail /> Mail
                </div>
              ),
              onClick: () => emailPdf(title)
            },
            {
              label: (
                <div>
                  <FaBookmark /> Bookmark
                </div>
              ),
              onClick: () =>
                addBookmark({ variables: { input: { policyId: id } } })
            }
          ]}
        >
          <FaEllipsisV />
        </Menu>
      </div>
    );
  };

  return (
    <div>
      <Helmet>
        <title>{title} - Policy - PricewaterhouseCoopers</title>
      </Helmet>
      {/* <BreadCrumb
        crumbs={[
          ["/policy", "Policies"],
          ["/policy/" + id, title]
        ]}
      /> */}
      <div className="d-flex justify-content-between">
        <HeaderWithBackButton heading={title} />
      </div>

      {inEditMode ? renderPolicyInEditMode() : renderPolicy()}

      <Modal
        isOpen={addResourceModal}
        toggle={toggleAddResourceModal}
        title="Add Resource"
      >
        <ResourceForm
          defaultValues={{
            policy: [{ value: id, label: title }],
            policyIds: [id]
          }}
          onSubmit={handleCreateResource}
          submitting={createResourceM.loading}
        />
      </Modal>
    </div>
  );
};

export default Policy;
