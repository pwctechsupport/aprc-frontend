import capitalize from "lodash/startCase";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { FaFile } from "react-icons/fa";
import { Container, Form, FormGroup, Input, Label } from "reactstrap";
import styled from "styled-components";
import PickIcon from "../../assets/Icons/PickIcon";
import Button from "../../shared/components/Button";
import Footer from "../../shared/components/Footer";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import {
  DownloadPdfInput,
  downloadPdfs,
  previewPdfs,
} from "../../shared/utils/accessGeneratedPdf";
import { notifyError, notifyInfo } from "../../shared/utils/notif";
import useWindowSize from "../../shared/hooks/useWindowSize";

const reportOptions = [
  {
    name: "Risk Without Policy",
    id: "report_risk",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
    description: "List of reviewed risks that are not mapped to any policies",
  },
  {
    name: "Risk Without Control",
    id: "report_risk_policy",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
    description: "List of reviewed risks that are not mapped with any control",
  },
  // {
  //   name: "Control Without Risk",
  //   id: "report_control_policy",
  //   formats: [
  //     { id: "jangan masuk", name: "PDF" },
  //     { id: "jangan masuk", name: "Excel" },
  //   ],
  //   description:
  //     "List of reviewed control(s) that are not mapped with any control",
  // },
  {
    name: "Resources with rating",
    id: "report_resource_rating",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
    description:
      "Report that summarizes resources (SOP) with highest utilisation",
  },
  {
    name: "Unmapped Risk",
    id: "unmapped_risk",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
    description:
      "List of reviewed risks that have been mapped into sub-business process but not yet tagged in flowchart",
  },
  {
    name: "Unmapped Control",
    id: "unmapped_control",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
    description:
      "List of reviewed controls that have been mapped into sub-business process but not yet tagged in flowchart",
  },
];

export default function Report() {
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const { register, handleSubmit, watch } = useForm<ReportFormValues>();

  const constructDataFromForm = (
    values: ReportFormValues
  ): DownloadPdfInput[] => {
    return (Object.keys(values) as Array<Key>)
      .map((key: Key) => {
        const bro = values[key];
        return { name: key, format: bro };
      })
      .filter((a) => Boolean(a.format))
      .map(({ name, format }) => {
        const fileName = `${
          reportOptions.find((a) => a.id === name)?.name
        }.${format}`;
        return {
          url: `/prints/${name}.${format}`,
          options: {
            fileType: format,
            fileName,
            onError: () => notifyError(`Error accessing ${fileName}`),
          },
        };
      });
  };
  const { width } = useWindowSize();
  const isMobile = width < 387;
  async function handlePreview(values: ReportFormValues) {
    if (
      values.report_control_policy === "xlsx" ||
      values.report_resource_rating === "xlsx" ||
      values.report_risk === "xlsx" ||
      values.report_risk_policy === "xlsx" ||
      values.unmapped_control === "xlsx" ||
      values.unmapped_risk === "xlsx"
    ) {
      notifyError("Excel format cannot be previewed");
    }
    if (
      !values.report_control_policy &&
      !values.report_resource_rating &&
      !values.report_risk &&
      !values.report_risk_policy &&
      !values.unmapped_control &&
      !values.unmapped_risk
    ) {
      notifyError("Select PDF format to preview");
    }
    if (values.report_control_policy === "jangan masuk") {
      notifyError("cant preview or download Control Without Risk");
    }
    if (
      (values.report_control_policy === "pdf" ||
        values.report_resource_rating === "pdf" ||
        values.report_risk === "pdf" ||
        values.report_risk_policy === "pdf" ||
        values.unmapped_control === "pdf" ||
        values.unmapped_risk === "pdf") &&
      !(
        values.report_control_policy === "xlsx" ||
        values.report_resource_rating === "xlsx" ||
        values.report_risk === "xlsx" ||
        values.report_risk_policy === "xlsx" ||
        values.unmapped_control === "xlsx" ||
        values.unmapped_risk === "xlsx"
      )
    ) {
      notifyInfo("Preparing file to preview");
      setPreviewing(true);
      await previewPdfs(constructDataFromForm(values));
      setPreviewing(false);
    }
  }

  async function handleDownload(values: ReportFormValues) {
    if (
      values.report_control_policy === "jangan masuk" ||
      (values.report_control_policy === "" &&
        values.report_resource_rating === "" &&
        values.report_risk === "" &&
        values.report_risk_policy === "" &&
        values.unmapped_control === "" &&
        values.unmapped_risk === "")
    ) {
      notifyError("cant preview or download Control Without Risk");
    } else {
      notifyInfo("Preparing file to download");
      setDownloading(true);
      await downloadPdfs(constructDataFromForm(values));
      setDownloading(false);
    }
  }
  const [text, sText] = useState("");
  const reportRisk = watch("report_risk");
  const reportRiskPolicy = watch("report_risk_policy");
  const reportControlPolicy = watch("report_control_policy");
  const reportResourceRating = watch("report_resource_rating");
  const unmappedRisk = watch("unmapped_risk");
  const unmappedControl = watch("unmapped_control");
  const [checked, setChecked] = useState(true);
  return (
    <Container fluid className="p-0 pt-3 px-4">
      <h4>Exception report</h4>
      <div style={{ minHeight: "60vh" }}>
        <Form>
          <Table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Report name</th>
                <th>Report description</th>
                <th>Format</th>
              </tr>
            </thead>
            <tbody>
              {reportOptions.map((option, index) => {
                return (
                  <tr key={option.id}>
                    <td>{index + 1}</td>
                    <td>{capitalize(option.name)}</td>
                    <td>{option.description || "-"}</td>
                    <td>
                      <FormGroup tag="fieldset">
                        {option.formats.map((format) => (
                          <FormGroup key={format.id} check>
                            <Label check>
                              <PwcRadioInput
                                type="radio"
                                name={option.id}
                                defaultChecked={
                                  option.id === "report_risk" &&
                                  format.id === "pdf" &&
                                  checked
                                }
                                disabled={
                                  // 1
                                  !reportRisk &&
                                  checked &&
                                  [
                                    "report_risk_policy",
                                    "report_control_policy",
                                    "report_resource_rating",
                                    "unmapped_risk",
                                    "unmapped_control",
                                  ].includes(option.id)
                                    ? true
                                    : !checked &&
                                      text !== "" &&
                                      [
                                        "report_risk",
                                        "report_risk_policy",
                                        "report_control_policy",
                                        "report_resource_rating",
                                        "unmapped_risk",
                                        "unmapped_control",
                                      ]
                                        .filter((a) => a !== text)
                                        .includes(option.id)
                                    ? true
                                    : checked &&
                                      text === "report_risk" &&
                                      [
                                        "report_risk",
                                        "report_risk_policy",
                                        "report_control_policy",
                                        "report_resource_rating",
                                        "unmapped_risk",
                                        "unmapped_control",
                                      ]
                                        .filter((a) => a !== text)
                                        .includes(option.id)
                                    ? true
                                    : text === "" &&
                                      checked &&
                                      reportRisk === "pdf"
                                    ? [
                                        "report_risk_policy",
                                        "report_control_policy",
                                        "report_resource_rating",
                                        "unmapped_risk",
                                        "unmapped_control",
                                      ].includes(option.id)
                                    : false
                                }
                                onClick={(e: any) =>
                                  sText(e.currentTarget.name)
                                }
                                value={format.id}
                                innerRef={register}
                              />
                              {format.name}
                            </Label>
                          </FormGroup>
                        ))}
                      </FormGroup>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <div className="text-center mt-3 mb-5">
            {reportRisk === "pdf" ||
            reportRiskPolicy === "pdf" ||
            reportControlPolicy === "pdf" ||
            reportResourceRating === "pdf" ||
            unmappedRisk === "pdf" ||
            unmappedControl === "pdf" ||
            (!reportRisk &&
              !reportRiskPolicy &&
              !reportControlPolicy &&
              !reportResourceRating &&
              !unmappedRisk &&
              !unmappedControl) ? (
              <Button
                onClick={handleSubmit(handlePreview)}
                type="button"
                // color="transparent"
                className={isMobile ? "button pwc mr-1" : "button pwc mr-3"}
                loading={previewing}
              >
                <FaFile /> Preview
              </Button>
            ) : null}

            <Button
              // color="secondary"
              className="pwc"
              onClick={handleSubmit(handleDownload)}
              loading={downloading}
            >
              <PickIcon name="download" /> Download
            </Button>
            <Tooltip description="Reset Selected Format">
              <Button
                onClick={() => {
                  setChecked(false);
                  sText("");
                }}
                type="reset"
                className={
                  isMobile ? "button cancel ml-1" : "button cancel ml-5"
                }
              >
                <PickIcon name="reload" />
              </Button>
            </Tooltip>
          </div>
        </Form>
      </div>

      <Footer />

      <Helmet>
        <title>Reports - PricewaterhouseCoopers</title>
      </Helmet>
    </Container>
  );
}

type Key = keyof ReportFormValues;
interface Props {
  disabled?: boolean;
}
export const PwcRadioInput = styled(Input)<Props>`
  &:after {
    width: 16px;
    height: 16px;
    border-radius: 16px;
    top: -2px;
    left: -1px;
    position: relative;
    background-color: ${(p) => (p.disabled ? `var(--primary-grey)` : "white")};
    content: "";
    display: inline-block;
    visibility: visible;
    border: 5px solid var(--primary-grey);
  }
  &:checked:after {
    width: 16px;
    height: 16px;
    border-radius: 16px;
    top: -2px;
    left: -1px;
    position: relative;
    background-color: white;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 5px solid var(--tangerine);
  }
`;
interface ReportFormValues {
  report_risk?: string;
  report_risk_policy?: string;
  report_control_policy?: string;
  report_resource_rating?: string;
  unmapped_risk?: string;
  unmapped_control?: string;
}
