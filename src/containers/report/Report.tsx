import get from "lodash/get";
import React from "react";
import Helmet from "react-helmet";
import useForm from "react-hook-form";
import { FaDownload, FaFile } from "react-icons/fa";
import { Form, FormGroup, Input, Label } from "reactstrap";
import Button from "../../shared/components/Button";
import {
  downloadPdfs,
  previewPdfs
} from "../../shared/utils/accessGeneratedPdf";
import { toast } from "react-toastify";

const options = ["report_risk"];

const Report = () => {
  const { register, handleSubmit, getValues, watch } = useForm();

  const constructDataFromForm = (values: any) => {
    return Object.keys(values)
      .map(key => ({
        name: key,
        ...values[key]
      }))
      .filter(item => item.print)
      .map(({ name, format }) => ({
        url: `/prints/${name}.${format}`,
        options: { onStart: () => toast.info("Preparing File") }
      }));
  };

  function onPreview(values: any) {
    previewPdfs(constructDataFromForm(values));
  }

  function onDownload() {
    downloadPdfs(constructDataFromForm(values));
  }

  const values = getValues({ nest: true });

  return (
    <div>
      <Helmet>
        <title>Reports - PricewaterhouseCoopers</title>
      </Helmet>
      <h1>Reports</h1>
      <Form onSubmit={handleSubmit(onDownload)}>
        <table className="w-100">
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
            {options.map(option => {
              const value = watch(option);
              return (
                <tr key={option}>
                  <td>1</td>
                  <td>Risk without Policy</td>
                  <td>-</td>
                  <td>-</td>
                  <td>
                    <input
                      name="report_risk.print"
                      type="checkbox"
                      className="text-center"
                      ref={register}
                    />
                  </td>
                  <td>
                    <FormGroup tag="fieldset">
                      <FormGroup check>
                        <Label check>
                          <Input
                            disabled={!get(value, `print`)}
                            type="radio"
                            name="report_risk.format"
                            value="pdf"
                            innerRef={register}
                          />{" "}
                          PDF
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            disabled={!get(value, `print`)}
                            type="radio"
                            name="report_risk.format"
                            value="excel"
                            innerRef={register}
                          />{" "}
                          Excel
                        </Label>
                      </FormGroup>
                    </FormGroup>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

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
    </div>
  );
};

export default Report;
