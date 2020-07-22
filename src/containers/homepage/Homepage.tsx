import get from "lodash/get";
import React from "react";
import { Col, Container, Row } from "reactstrap";
import styled from "styled-components";
import backgroundImage from "../../assets/images/SignInBackground.png";
import { useHomepageQuery, useUserPVisitQuery } from "../../generated/graphql";
import { toLabelValue } from "../../shared/formatter";
import { useSelector } from "../../shared/hooks/useSelector";
import HomepageBox from "./HomepageBox";
import HomepageSearch from "./HomepageSearch";
import Helmet from "react-helmet";
import Footer from "../../shared/components/Footer";

export default function Homepage() {
  const username = useSelector((state) => state.auth.user?.name);
  const { data } = useHomepageQuery({ fetchPolicy: "network-only" });
  const { data: dataRP } = useUserPVisitQuery({ fetchPolicy: "network-only" });
  const popularPolicies = data?.popularPolicies?.collection || [];
  const recentlyAddedPolicies = data?.recentlyAddedPolicies?.collection || [];
  const modifiedRecentlyAddedPol = recentlyAddedPolicies
    .filter((a) => a.draft === null)
    .slice(0, 5);

  const customModifier = (data: any) => {
    const safetyNet = data
      ? { label: data.title, value: data.id }
      : { label: "", value: "" };
    return safetyNet;
  };
  const recentlyVisitedPolicies = dataRP?.userPolicyVisits?.collection || [];

  const popularResources = data?.popularResources?.collection || [];
  const savedPolicies = data?.bookmarks?.collection || [];
  return (
    <Background>
      <Helmet>
        <title>Home - PricewaterhouseCoopers</title>
      </Helmet>
      <BackgroundImage>
        <Greet style={{ position: "relative", top: "0.5vw", left: "2vw" }}>
          <Row>
            <Col lg={3}>
              <ContentBox>Welcome, {username}</ContentBox>
            </Col>
            <Col></Col>
          </Row>
        </Greet>
        <Centerer>
          <Container>
            <ContentBox>
              <HomepageSearch />
            </ContentBox>
          </Container>
        </Centerer>
      </BackgroundImage>
      <Container className="mt-5 pb-5" style={{ minHeight: "50vh" }}>
        <Row>
          <Col xs={12} md={6} lg={4}>
            <HomepageBox
              list={modifiedRecentlyAddedPol.map(toLabelValue)}
              basePath="policy"
              title="Recently added policies"
              boldColor="rgb(255, 180, 105)"
              // lineColor="rgba(231, 155, 86,0.4)"
              // softColor="rgb(254, 204, 148)"
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <HomepageBox
              list={popularPolicies.map(toLabelValue)}
              basePath="policy"
              title="Most popular policies"
              // boldColor="rgb(255, 196, 79)"
              // lineColor="rgba(255, 172, 90,0.4)"
              // softColor="rgb(255, 219, 147)"
            />
          </Col>{" "}
          <Col xs={12} md={6} lg={4}>
            <HomepageBox
              list={savedPolicies.map((a) => {
                return {
                  label: get(a, "originator.title"),
                  value: get(a, "originator.id"),
                };
              })}
              basePath="policy"
              title="My saved policies"
              // boldColor="rgb(255, 126, 169)"
              // lineColor="rgba(255, 126, 169,0.4)"
              // softColor="rgb(251, 189, 201)"
            />
          </Col>
        </Row>
        <Row className="mt-3">
          <Col xs={12} md={6} lg={4}></Col>

          <Col xs={12} md={6} lg={4}>
            <HomepageBox
              list={popularResources.map(toLabelValue)}
              basePath="resources"
              title="Most popular resources"
              // boldColor="rgb(255, 196, 79)"
              // lineColor="rgba(255, 172, 90,0.4)"
              // softColor="rgb(255, 219, 147)"
            />
          </Col>
          <Col xs={12} md={6} lg={4}>
            <HomepageBox
              list={
                recentlyVisitedPolicies.length
                  ? recentlyVisitedPolicies
                      .map((a) => a.policy)
                      .filter((b) => b !== null)
                      .map(customModifier)
                  : []
              }
              basePath="policy"
              title="My recently visited policies"
              // boldColor="rgb(255, 126, 169)"
              // lineColor="rgba(255, 126, 169,0.4)"
              // softColor="rgb(251, 189, 201)"
            />
          </Col>
        </Row>
      </Container>
      <Footer />
    </Background>
  );
}

const Background = styled.div`
  background: #efefef;
`;

const BackgroundImage = styled.div`
  height: calc(70vh - 63px);
  background: url(${backgroundImage});
  background-position: center;
  background-size: cover;
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
  border-radius: 3px;
`;
