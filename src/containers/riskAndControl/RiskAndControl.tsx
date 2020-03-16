import get from "lodash/get";
import startCase from "lodash/startCase";
import React, { useState } from "react";
import {
  FaBookmark,
  FaEllipsisV,
  FaEye,
  FaEyeSlash,
  FaFilePdf,
  FaPencilAlt
} from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { NavLink, Route, RouteComponentProps } from "react-router-dom";
import { Badge, Nav, NavItem, TabContent, Table, TabPane } from "reactstrap";
import {
  Assertion,
  Frequency,
  Ipo,
  LevelOfRisk,
  Nature,
  Status,
  TypeOfControl,
  TypeOfRisk,
  useBusinessProcessQuery,
  useCreateBookmarkBusinessProcessMutation,
  useCreateResourceMutation,
  useUpdateControlMutation,
  useUpdateRiskMutation
} from "../../generated/graphql";
import BreadCrumb, { CrumbItem } from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import Collapsible from "../../shared/components/Collapsible";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import HeaderWithBackButton from "../../shared/components/Header";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Menu from "../../shared/components/Menu";
import Modal from "../../shared/components/Modal";
import OpacityButton from "../../shared/components/OpacityButton";
import ResourceBar from "../../shared/components/ResourceBar";
import { toLabelValue } from "../../shared/formatter";
import {
  downloadPdf,
  emailPdf,
  previewPdf
} from "../../shared/utils/accessGeneratedPdf";
import {
  notifyError,
  notifyGraphQLErrors,
  notifyInfo,
  notifySuccess
} from "../../shared/utils/notif";
import ControlForm, {
  ControlFormValues,
  CreateControlFormValues
} from "../control/components/ControlForm";
import ResourceForm, {
  ResourceFormValues
} from "../resources/components/ResourceForm";
import RiskForm, { RiskFormValues } from "../risk/components/RiskForm";
import Flowcharts from "./components/Flowcharts";

const RiskAndControls = ({ match }: RouteComponentProps) => {
  const initialCollapse = ["Risks"];
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

  // Edit Risk Mutation and Modal state
  const [riskModal, setRiskModal] = useState(false);
  const [risk, setRisk] = useState<RiskState>();
  const toggleRiskModal = () => setRiskModal(p => !p);
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
    refetchQueries: ["businessProcess"]
  });
  const handleUpdateRisk = (values: RiskFormValues) => {
    updateRisk({
      variables: {
        input: {
          id: risk?.id || "",
          name: values.name,
          businessProcessIds: values.businessProcessIds?.map(a => a.value),
          levelOfRisk: values.levelOfRisk,
          typeOfRisk: values.typeOfRisk
        }
      }
    });
  };

  // Edit Control Mutation and Modal State
  const [controlModal, setControlModal] = useState(false);
  const [control, setControl] = useState<ControlState>();
  const toggleControlModal = () => setControlModal(p => !p);
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
    refetchQueries: ["businessProcess"]
  });
  const handleUpdateControl = (values: CreateControlFormValues) => {
    updateControl({
      variables: { input: { id: control?.id || "", ...values } }
    });
  };

  // Add Resource Mutation and Modal State
  const [addResourceModal, setAddResourceModal] = useState(false);
  const toggleAddResourceModal = () => setAddResourceModal(prev => !prev);
  const [createResource, createResourceM] = useCreateResourceMutation({
    onCompleted: _ => {
      notifySuccess("Resource Added");
      toggleAddResourceModal();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["businessProcess"]
  });
  function handleCreateResource(values: ResourceFormValues) {
    createResource({
      variables: {
        input: {
          name: values.name || "",
          category: values.category?.value || "",
          resuploadBase64: values.resuploadBase64,
          resuploadFileName: values.resuploadFileName,
          policyIds: values.policyIds?.map(a => a.value),
          controlIds: values.controlIds?.map(a => a.value),
          businessProcessId: values.businessProcessId?.value
        }
      }
    });
  }

  const [addBookmark] = useCreateBookmarkBusinessProcessMutation({
    onCompleted: () => notifySuccess("Added to Bookmark"),
    onError: notifyGraphQLErrors
  });

  const id = get(match, "params.id", "");
  const { data, loading } = useBusinessProcessQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });
  const name = data?.businessProcess?.name || "";
  const risks = data?.businessProcess?.risks || [];
  const resources = data?.businessProcess?.resources || [];
  const ancestors = data?.businessProcess?.ancestors || [];
  const breadcrumb = ancestors.map(a => [
    "/risk-and-control/" + a.id,
    a.name
  ]) as CrumbItem[];

  const tabs = [
    { to: `/risk-and-control/${id}/flowchart`, title: "Flowchart" },
    { to: `/risk-and-control/${id}`, title: "List" },
    { to: `/risk-and-control/${id}/resources`, title: "Resources" }
  ];

  if (loading) return <LoadingSpinner size={30} centered />;

  const renderActions = () => {
    return (
      <div className="d-flex align-items-center">
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
            <FaEyeSlash size={20} />
          ) : (
            <FaEye size={20} />
          )}
        </Button>
        <Menu
          data={[
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
                downloadPdf(`prints/${id}/business_process.pdf`, {
                  fileName: name,
                  onStart: () => notifyInfo("Download Started"),
                  onError: () => notifyError("Download Failed"),
                  onCompleted: () => notifySuccess("Download Success")
                })
            },
            {
              label: (
                <div>
                  <FaBookmark /> Bookmark
                </div>
              ),
              onClick: () => addBookmark({ variables: { id } })
            },
            {
              label: (
                <div>
                  <MdEmail /> Mail
                </div>
              ),
              onClick: () => emailPdf(name)
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
      <BreadCrumb
        crumbs={[
          ["/risk-and-control", "Risk and Controls"],
          ...breadcrumb,
          ["/risk-and-control/" + id, name]
        ]}
      />
      <div className="d-flex justify-content-between">
        <HeaderWithBackButton heading={name} />
        {renderActions()}
      </div>
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
          <Route
            exact
            path="/risk-and-control/:id/flowchart"
            render={() => (
              <Flowcharts
                bpId={id}
                resources={resources.filter(resource =>
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
                  {risks.map(risk => (
                    <li key={risk.id}>
                      <div className="mb-3 d-flex justify-content-between">
                        <h5>
                          {risk.name}
                          <Badge color="danger mx-3">
                            {startCase(risk.levelOfRisk || "")}
                          </Badge>
                          <Badge color="danger">
                            {startCase(risk.typeOfRisk || "")}
                          </Badge>
                        </h5>
                        <Button
                          onClick={() =>
                            editRisk({
                              id: risk.id,
                              name: risk.name || "",
                              businessProcessIds:
                                risk.businessProcesses?.map(toLabelValue) || [],
                              levelOfRisk: risk.levelOfRisk as LevelOfRisk,
                              typeOfRisk: risk.typeOfRisk as TypeOfRisk
                            })
                          }
                          color=""
                        >
                          <FaPencilAlt />
                        </Button>
                      </div>

                      <div className="table-responsive">
                        <Table>
                          <thead>
                            <tr>
                              <th>Description</th>
                              <th>Freq</th>
                              <th>Type of Control</th>
                              <th>Nature</th>
                              <th>IPO</th>
                              <th>Assertion</th>
                              <th>Control Owner</th>
                              <th />
                            </tr>
                          </thead>
                          <tbody>
                            {risk?.controls?.length ? (
                              risk?.controls?.map(control => (
                                <tr key={control.id}>
                                  <td>{control.description}</td>
                                  <td>{startCase(control.frequency || "")}</td>
                                  <td>
                                    {startCase(control.typeOfControl || "")}
                                  </td>
                                  <td>{startCase(control.nature || "")}</td>
                                  <td>
                                    {control.ipo?.map(startCase).join(", ")}
                                  </td>
                                  <td>
                                    {control.assertion
                                      ?.map(startCase)
                                      .join(", ")}
                                  </td>
                                  <td>{control.controlOwner}</td>
                                  <td>
                                    <Button
                                      onClick={() =>
                                        editControl({
                                          id: control.id,
                                          assertion: control.assertion as Assertion[],
                                          controlOwner:
                                            control.controlOwner || "",
                                          description:
                                            control.description || "",
                                          status: control.status as Status,
                                          typeOfControl: control.typeOfControl as TypeOfControl,
                                          nature: control.nature as Nature,
                                          ipo: control.ipo as Ipo[],
                                          businessProcessIds:
                                            control?.businessProcesses?.map(
                                              ({ id }) => id
                                            ) || [],
                                          frequency: control.frequency as Frequency,
                                          keyControl:
                                            control.keyControl || false,
                                          riskIds:
                                            control?.risks?.map(
                                              ({ id }) => id
                                            ) || [],
                                          activityControls:
                                            control.activityControls
                                        })
                                      }
                                      color=""
                                    >
                                      <FaPencilAlt />
                                    </Button>
                                  </td>
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
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyAttribute />
              )}
            </Collapsible>
          </Route>
          <Route exact path="/risk-and-control/:id/resources">
            <div className="mt-3">
              {resources.length ? (
                resources.map(resource => (
                  <ResourceBar key={resource.id} {...resource} />
                ))
              ) : (
                <EmptyAttribute />
              )}
              <OpacityButton onClick={toggleAddResourceModal}>
                + Add Resource
              </OpacityButton>
            </div>
          </Route>
        </TabPane>
      </TabContent>

      <Modal isOpen={riskModal} toggle={toggleRiskModal} title="Edit Risk">
        <RiskForm
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
          defaultValues={control}
          onSubmit={handleUpdateControl}
          submitting={updateControlM.loading}
        />
      </Modal>

      <Modal
        isOpen={addResourceModal}
        toggle={toggleAddResourceModal}
        title="Add Resource"
      >
        <ResourceForm
          defaultValues={{
            category: { label: "Flowchart", value: "Flowchart" },
            businessProcessId: { label: name, value: id }
          }}
          onSubmit={handleCreateResource}
          submitting={createResourceM.loading}
        />
      </Modal>
    </div>
  );
};

export default RiskAndControls;

interface RiskState extends RiskFormValues {
  id: string;
}

interface ControlState extends ControlFormValues {
  id: string;
}
