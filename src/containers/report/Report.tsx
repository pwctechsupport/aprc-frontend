import React from "react";
import Button from "../../shared/components/Button";
import { FaFile, FaDownload } from "react-icons/fa";
import Helmet from "react-helmet";

const Report = () => {
  return (
    <div>
      <Helmet>
        <title>Reports - PricewaterhouseCoopers</title>
      </Helmet>
      <h1>Reports</h1>
      <table className="w-100">
        <thead>
          <tr>
            <th>Nomor</th>
            <th>Report Name</th>
            <th>Report Description</th>
            <th>Report Category</th>
            <th>Select</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Risk without Policy</td>
            <td>-</td>
            <td>-</td>
            <td>
              <input type="checkbox" className="text-center" />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-center mt-5">
        <Button color="transparent" className="mr-3">
          <FaFile /> Preview
        </Button>
        <Button color="secondary">
          <FaDownload /> Download
        </Button>
      </div>
    </div>
  );
};

export default Report;
