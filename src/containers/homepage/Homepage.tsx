import React from "react";
import styled from "styled-components";
import backgroundImage from "../../assets/images/homepage-background.jpg";
import HomepageBox from "./HomepageBox";
import { Container, Row, Col } from "reactstrap";
import { useHomepageQuery } from "../../generated/graphql";
import { toLabelValue } from "../../shared/formatter";
import get from "lodash/get";

export default function Homepage() {
  const { data } = useHomepageQuery();
  const popularPolicies = data?.popularPolicies?.collection || [];
  const recentlyAddedPolicies = data?.recentlyAddedPolicies?.collection || [];
  const recentlyVisitedPolicies =
    data?.recentlyVisitedPolicies?.collection || [];
  const popularResources = data?.popularResources?.collection || [];
  const savedPolicies = data?.bookmarks?.collection || [];
  return (
    <Background>
      <BackgroundImage />
      <Container className="mt-5 pb-5">
        <Row>
          <Col xs={12} md={6} lg={4}>
            <HomepageBox
              list={popularPolicies.map(toLabelValue)}
              basePath="policy"
              title="Popular Policies"
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <HomepageBox
              list={recentlyAddedPolicies.map(toLabelValue)}
              basePath="policy"
              title="Recently Added Policies"
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <HomepageBox
              list={recentlyVisitedPolicies.map(toLabelValue)}
              basePath="policy"
              title="Recently Visited Policies"
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <HomepageBox
              list={popularResources.map(toLabelValue)}
              basePath="policy"
              title="Popular Resources"
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <HomepageBox
              list={savedPolicies.map(a => {
                return {
                  label: get(a, "originator.title"),
                  value: get(a, "originator.id")
                };
              })}
              basePath="policy"
              title="Saved Policies"
            />
          </Col>
        </Row>
      </Container>
    </Background>
  );
}

const Background = styled.div`
  background: #efefef;
`;

const BackgroundImage = styled.div`
  height: calc(70vh - 63px);
  background: url(${backgroundImage});
`;
