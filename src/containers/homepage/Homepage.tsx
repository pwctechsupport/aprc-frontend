import get from "lodash/get";
import React from "react";
import { Col, Container, Row } from "reactstrap";
import styled from "styled-components";
import backgroundImage from "../../assets/images/homepage-background.jpg";
import { useHomepageQuery } from "../../generated/graphql";
import { toLabelValue } from "../../shared/formatter";
import { useSelector } from "../../shared/hooks/useSelector";
import HomepageBox from "./HomepageBox";
import HomepageSearch from "./HomepageSearch";

export default function Homepage() {
  const username = useSelector(state => state.auth.user?.name);
  const { data } = useHomepageQuery({ fetchPolicy: "network-only" });
  const popularPolicies = data?.popularPolicies?.collection || [];
  const recentlyAddedPolicies = data?.recentlyAddedPolicies?.collection || [];
  const recentlyVisitedPolicies =
    data?.recentlyVisitedPolicies?.collection || [];
  const popularResources = data?.popularResources?.collection || [];
  const savedPolicies = data?.bookmarks?.collection || [];
  return (
    <Background>
      <BackgroundImage>
        <Centerer>
          <Container>
            <ContentBox>
              <Greet>Welcome, {username}</Greet>
              <HomepageSearch />
            </ContentBox>
          </Container>
        </Centerer>
      </BackgroundImage>
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

const Centerer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const Greet = styled.h3`
  margin-bottom: 1.5rem;
  color: white;
`;

const ContentBox = styled.div`
  padding: 2rem 1rem;
  margin-bottom: 2rem;
  background-color: rgba(54, 48, 60, 0.6);
  border-radius: 0.3rem;
`;
