import React, { Fragment } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";

type PathType = string;
type LabelType = string;
type CrumbItem = [PathType, LabelType];

interface BreadCrumbProps {
  crumbs: CrumbItem[];
}

const BreadCrumb = ({ crumbs }: BreadCrumbProps) => {
  const params: any = useParams();

  function transform(crumb: CrumbItem) {
    const path = crumb[0].includes(":")
      ? params[crumb[0].replace(":", "")]
      : crumb[0];
    const label = crumb[1].includes(":")
      ? params[crumb[1].replace(":", "")]
      : crumb[1];

    return [path, label];
  }

  return (
    <Breadcrumb>
      {crumbs.map(transform).map((crumb, i) => {
        return (
          <Fragment key={i}>
            {i !== crumbs.length - 1 ? (
              <BreadcrumbItem>
                <Link to={crumb[0]}>{crumb[1]}</Link>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem>{crumb[1]}</BreadcrumbItem>
            )}
          </Fragment>
        );
      })}
    </Breadcrumb>
  );
};

export default BreadCrumb;
