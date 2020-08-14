import React, { Fragment } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import styled from "styled-components";

type PathType = string;
type LabelType = string;
export type CrumbItem = [PathType, LabelType];

interface BreadCrumbProps {
  crumbs: CrumbItem[];
}

const BreadCrumb = ({ crumbs }: BreadCrumbProps) => {
  const params: any = useParams();

  function transform(crumb: CrumbItem) {
    const path = crumb[0].includes(":")
      ? params[crumb[0].replace(":", "")]
      : crumb[0];
    const label = crumb[1];

    return [path, label];
  }

  return (
    <Breadcrumb>
      {crumbs.map(transform).map((crumb, i) => {
        return (
          <Fragment key={i}>
            {i !== crumbs.length - 1 ? (
              <BreadcrumbItem>
                <StyledLink to={crumb[0]}>{crumb[1]}</StyledLink>
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
const StyledLink = styled(Link)`
  color: var(--tangerine);
  &:hover {
    color: var(--tangerine);
  }
`;
