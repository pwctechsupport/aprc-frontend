import get from "lodash/get";
import capitalize from "lodash/startCase";
import React from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { FaDownload, FaFile } from "react-icons/fa";
import { toast } from "react-toastify";
import { Container, Form, FormGroup, Input, Label } from "reactstrap";
import Button from "../../shared/components/Button";
import Table from "../../shared/components/Table";
import {
  downloadPdfs,
  previewPdfs,
  DownloadPdfInput
} from "../../shared/utils/accessGeneratedPdf";
// import BreadCrumb from "../../shared/components/BreadCrumb";

const options = [
  {
    name: "Risk",
    id: "report_risk",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" }
    ]
  },
  {
    name: "Risk Without Control",
    id: "report_risk_policy",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" }
    ]
  },
  {
    name: "Control Without Risk",
    id: "report_control_policy",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" }
    ]
  },
  {
    name: "Resources with rating",
    id: "report_resource_rating",
    formats: [
      { id: "pdf", name: "PDF" },
      { id: "xlsx", name: "Excel" }
    ]
  }
];

const Report = () => {
  const { register, handleSubmit, getValues, watch } = useForm<
    ReportFormValues
  >();

  const constructDataFromForm = (values: any): DownloadPdfInput[] => {
    return Object.keys(values)
      .map(key => ({
        name: key,
        ...values[key]
      }))
      .filter(item => item.print)
      .map(({ name, format }) => ({
        url: `/prints/${name}.${format}`,
        options: {
          onStart: () => toast.info("Preparing File"),
          fileType: format
        }
      }));
  };

  const values = getValues({ nest: true });

  function onPreview(values: any) {
    previewPdfs(constructDataFromForm(values));
  }

  function onDownload() {
    downloadPdfs(constructDataFromForm(values));
  }

  return (
    <Container fluid className="p-0 pt-5 px-2">
      <h4>Reports</h4>
      <Form onSubmit={handleSubmit(onDownload)}>
        <Table>
          <thead>
            <tr>
              <th>Nomor</th>
              <th>Report Name</th>
              <th>Report Description</th>
              <th>Report Category</th>
              <th>Select</th>
              <th>Format</th>
            </tr>
          </thead>
          <tbody>
            {options.map((option, index) => {
              const value = watch(option.id as keyof ReportFormValues);

              return (
                <tr key={option.id}>
                  <td>{index + 1}</td>
                  <td>{capitalize(option.name)}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>
                    <input
                      name={`${option.id}.print`}
                      type="checkbox"
                      className="text-center"
                      ref={register}
                    />
                  </td>
                  <td>
                    <FormGroup tag="fieldset">
                      {option.formats.map(format => (
                        <FormGroup check>
                          <Label check>
                            <Input
                              disabled={!get(value, "print")}
                              type="radio"
                              name={`${option.id}.format`}
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

        <div className="text-center mt-5">
          <Button
            onClick={handleSubmit(onPreview)}
            type="button"
            color="transparent"
            className="mr-3"
          >
            <FaFile /> Preview
          </Button>
          <Button color="secondary">
            <FaDownload /> Download
          </Button>
        </div>
      </Form>
      <Helmet>
        <title>Reports - PricewaterhouseCoopers</title>
      </Helmet>
    </Container>
  );
};

export default Report;

interface ReportFormValues {
  report_risk?: {
    print: boolean;
    format: string;
  };
}
