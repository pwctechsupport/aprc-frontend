import { capitalCase } from "capital-case";
import get from "lodash/get";
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
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { Badge, Table } from "reactstrap";
import { oc } from "ts-optchain";
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
  useUpdateControlMutation,
  useUpdateRiskMutation
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import Collapsible from "../../shared/components/Collapsible";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Menu from "../../shared/components/Menu";
import Modal from "../../shared/components/Modal";
import ResourceBar from "../../shared/components/ResourceBar";
import {
  downloadPdf,
  emailPdf,
  previewPdf
} from "../../shared/utils/accessGeneratedPdf";
import ControlForm, {
  CreateControlFormDefaultValues,
  CreateControlFormValues
} from "../control/components/ControlForm";
import RiskForm, {
  RiskFormDefaultValues,
  RiskFormValues
} from "../risk/components/RiskForm";
import BreadCrumb from "../../shared/components/BreadCrumb";

const RiskAndControls = ({ match, history }: RouteComponentProps) => {
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

  const [riskModal, setRiskModal] = useState(false);
  const [risk, setRisk] = useState<RiskState>();
  const toggleRiskModal = () => setRiskModal(p => !p);
  const editRisk = (risk: RiskState) => {
    setRiskModal(true);
    setRisk(risk);
  };
  const [updateRisk, updateRiskM] = useUpdateRiskMutation({
    onCompleted: () => {
      toast.success("Risk Updated");
      toggleRiskModal();
    },
    onError: () => toast.error("Update Risk Failed"),
    awaitRefetchQueries: true,
    refetchQueries: ["businessProcess"]
  });
  const handleUpdateRisk = (values: RiskFormValues) => {
    updateRisk({ variables: { input: { id: oc(risk).id(""), ...values } } });
  };

  const [controlModal, setControlModal] = useState(false);
  const [control, setControl] = useState<ControlState>();
  const toggleControlModal = () => setControlModal(p => !p);
  const editControl = (control: ControlState) => {
    setControlModal(true);
    setControl(control);
  };
  const [updateControl, updateControlM] = useUpdateControlMutation({
    onCompleted: () => {
      toast.success("Control Updated");
      toggleControlModal();
    },
    onError: () => toast.error("Update control Failed"),
    awaitRefetchQueries: true,
    refetchQueries: ["businessProcess"]
  });
  const handleUpdateControl = (values: CreateControlFormValues) => {
    updateControl({
      variables: { input: { id: oc(control).id(""), ...values } }
    });
  };

  const id = get(match, "params.id", "");
  const { data, loading } = useBusinessProcessQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });

  const [addBookmark] = useCreateBookmarkBusinessProcessMutation({
    onCompleted: () => toast.success("Added to Bookmark"),
    onError: () => toast.error("Failed to add")
  });

  const name = oc(data).businessProcess.name("");
  const risks = oc(data).businessProcess.risks([]);
  const resources = oc(data).businessProcess.resources([]);

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
                downloadPdf(`prints/${id}/business_process.pdf`, {
                  fileName: name,
                  onStart: () => toast.info("Download Started"),
                  onError: () => toast.error("Download Failed"),
                  onCompleted: () => toast.success("Download Success")
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
          ["/risk-and-control/" + id, name]
        ]}
      />
      <div className="d-flex justify-content-between">
        <HeaderWithBackButton heading={name} />
        {renderActions()}
      </div>
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
                    {risk.name.padEnd(1)}
                    <Badge color="danger mx-3">
                      {capitalCase(risk.levelOfRisk || "")}
                    </Badge>
                    <Badge color="danger">
                      {capitalCase(risk.typeOfRisk || "")}
                    </Badge>
                  </h5>
                  <Button
                    onClick={() =>
                      editRisk({
                        id: risk.id,
                        name: risk.name,
                        status: oc(risk).status(Status.Draft) as Status,
                        businessProcessId: oc(risk).businessProcessId(""),
                        levelOfRisk: oc(risk).levelOfRisk() as LevelOfRisk,
                        typeOfRisk: oc(risk).typeOfRisk() as TypeOfRisk
                      })
                    }
                    color=""
                  >
                    <FaPencilAlt />
                  </Button>
                </div>

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
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {risk.controls.length ? (
                      risk.controls.map(control => (
                        <tr key={control.id}>
                          <td>{control.description}</td>
                          <td>{capitalCase(control.frequency || "")}</td>
                          <td>{capitalCase(control.typeOfControl || "")}</td>
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
                          <td>
                            <Button
                              onClick={() =>
                                editControl({
                                  id: control.id,
                                  assertion: control.assertion as Assertion[],
                                  controlOwner: control.controlOwner || "",
                                  description: control.description,
                                  status: control.status as Status,
                                  typeOfControl: control.typeOfControl as TypeOfControl,
                                  nature: control.nature as Nature,
                                  ipo: control.ipo as Ipo[],
                                  businessProcessIds: oc(control)
                                    .businessProcesses([])
                                    .map(({ id }) => id),
                                  frequency: control.frequency as Frequency,
                                  keyControl: control.keyControl || false,
                                  riskIds: oc(control)
                                    .risks([])
                                    .map(({ id }) => id)
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
              </li>
            ))}
          </ul>
        ) : (
          <EmptyAttribute />
        )}
      </Collapsible>

      <Collapsible
        title="Resources"
        show={collapse.includes("Resources")}
        onClick={toggleCollapse}
      >
        {resources.length ? (
          resources.map(resource => {
            return <ResourceBar key={resource.id} {...resource} />;
          })
        ) : (
          <EmptyAttribute />
        )}
      </Collapsible>

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
    </div>
  );
};

export default RiskAndControls;

interface RiskState extends RiskFormDefaultValues {
  id: string;
}

interface ControlState extends CreateControlFormDefaultValues {
  id: string;
}
