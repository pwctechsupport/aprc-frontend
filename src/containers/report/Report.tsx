import capitalize from "lodash/startCase";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { FaDownload, FaFile, FaUndo } from "react-icons/fa";
import { Container, Form, FormGroup, Input, Label } from "reactstrap";
import Button from "../../shared/components/Button";
import Table from "../../shared/components/Table";
import {
  DownloadPdfInput,
  downloadPdfs,
  previewPdfs,
} from "../../shared/utils/accessGeneratedPdf";
import { notifyError, notifyInfo } from "../../shared/utils/notif";
import Tooltip from "../../shared/components/Tooltip";
import Footer from "../../shared/components/Footer";
import styled from "styled-components";

const reportOptions = [
  {
    name: "Risk Without Policy",
    id: "report_risk",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
    description: "",
  },
  {
    name: "Risk Without Control",
    id: "report_risk_policy",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
    description: "",
  },
  {
    name: "Control Without Risk",
    id: "report_control_policy",
    formats: [
      { id: "jangan masuk", name: "PDF" },
      { id: "jangan masuk", name: "Excel" },
    ],
    description: "",
  },
  {
    name: "Resources with rating",
    id: "report_resource_rating",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
    description: "",
  },
  {
    name: "Unmapped Risk",
    id: "unmapped_risk",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
    description: "",
  },
  {
    name: "Unmapped Control",
    id: "unmapped_control",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
    description: "",
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
      <h4>Exception Report</h4>
      <div style={{ minHeight: "60vh" }}>
        <Form>
          <Table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Report Name</th>
                <th>Report Description</th>
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
                color="transparent"
                className="mr-3"
                loading={previewing}
              >
                <FaFile /> Preview
              </Button>
            ) : null}

            <Button
              color="secondary"
              onClick={handleSubmit(handleDownload)}
              loading={downloading}
            >
              <FaDownload /> Download
            </Button>
            <Tooltip description="Reset Selected Format">
              <Button
                onClick={() => {
                  setChecked(false);
                  sText("");
                }}
                type="reset"
                className="black ml-5"
              >
                <FaUndo />
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
    width: 15px;
    height: 15px;
    border-radius: 15px;
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
    width: 15px;
    height: 15px;
    border-radius: 15px;
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
