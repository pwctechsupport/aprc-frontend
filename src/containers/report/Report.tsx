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

const reportOptions = [
  {
    name: "Risk Without Policy",
    id: "report_risk",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
  },
  {
    name: "Risk Without Control",
    id: "report_risk_policy",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
  },
  {
    name: "Control Without Risk",
    id: "report_control_policy",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
  },
  {
    name: "Resources with rating",
    id: "report_resource_rating",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
  },
  {
    name: "Unmapped Risk",
    id: "unmapped_risk",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
  },
  {
    name: "Unmapped Control",
    id: "unmapped_control",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" },
    ],
  },
];

export default function Report() {
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const { register, handleSubmit } = useForm<ReportFormValues>();

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
    notifyInfo("Preparing file to preview");
    setPreviewing(true);
    await previewPdfs(constructDataFromForm(values));
    setPreviewing(false);
  }

  async function handleDownload(values: ReportFormValues) {
    notifyInfo("Preparing file to download");
    setDownloading(true);
    await downloadPdfs(constructDataFromForm(values));
    setDownloading(false);
  }

  return (
    <Container fluid className="p-0 pt-3 px-4">
      <h4>Exception Report</h4>

      <Form>
        <Table>
          <thead>
            <tr>
              <th>Nomor</th>
              <th>Report Name</th>
              <th>Report Description</th>
              <th>Report Category</th>
              <th>Format</th>
            </tr>
          </thead>
          <tbody>
            {reportOptions.map((option, index) => {
              return (
                <tr key={option.id}>
                  <td>{index + 1}</td>
                  <td>{capitalize(option.name)}</td>
                  <td>-</td>
                  <td>-</td>

                  <td>
                    <FormGroup tag="fieldset">
                      {option.formats.map((format) => (
                        <FormGroup key={format.id} check>
                          <Label check>
                            <Input
                              type="radio"
                              name={option.id}
                              value={format.id}
                              innerRef={register}
                            />{" "}
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
          <Button
            onClick={handleSubmit(handlePreview)}
            type="button"
            color="transparent"
            className="mr-3"
            loading={previewing}
          >
            <FaFile /> Preview
          </Button>
          <Button
            color="secondary"
            onClick={handleSubmit(handleDownload)}
            loading={downloading}
          >
            <FaDownload /> Download
          </Button>
          <Tooltip description="Reset Selected Format">
            <Button type="reset" className="black ml-5">
              <FaUndo />
            </Button>
          </Tooltip>
        </div>
      </Form>
      <Helmet>
        <title>Reports - PricewaterhouseCoopers</title>
      </Helmet>
    </Container>
  );
}

type Key = keyof ReportFormValues;

interface ReportFormValues {
  report_risk?: string;
  report_risk_policy?: string;
  report_control_policy?: string;
  report_resource_rating?: string;
  unmapped_risk?: string;
  unmapped_control?: string;
}
