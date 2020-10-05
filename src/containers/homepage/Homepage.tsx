import get from "lodash/get";
import React from "react";
import { Col, Container, Row } from "reactstrap";
import styled from "styled-components";
import backgroundImage from "../../assets/images/background-homepage.jpg";
import { useHomepageQuery, useUserPVisitQuery } from "../../generated/graphql";
import { toLabelValue } from "../../shared/formatter";
import { useSelector } from "../../shared/hooks/useSelector";
import HomepageBox from "./HomepageBox";
import HomepageSearch from "./HomepageSearch";
import Helmet from "react-helmet";
import Footer from "../../shared/components/Footer";
import useWindowSize from "../../shared/hooks/useWindowSize";

export default function Homepage() {
  const colors = {
    tangerine: "#eb8c00",
    orange: "#d04a02",
    yellow: "#ffb600",
    pink: "#db536a",
    softPink: "#d93954",
  };
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
  const { width } = useWindowSize();
  const recentlyVisitedPolicies = dataRP?.userPolicyVisits?.collection || [];
  const isLaptop = width > 991;
  const popularResources = data?.popularResources?.collection || [];
  const savedPolicies = data?.bookmarks?.collection || [];
  return (
    <Background style={{ position: "relative", top: isLaptop ? 0 : -50 }}>
      <Helmet>
        <title>Home - PricewaterhouseCoopers</title>
      </Helmet>
      <BackgroundImage>
        <div style={{ height: isLaptop ? "25vh" : 0 }}></div>

        {isLaptop ? (
          <>
            <Row style={{ width: "100vw" }}>
              <Col lg={4}>
                <h3
                  style={{
                    backgroundColor: "rgba(54, 48, 60, 0.6)",
                    padding: " 2rem 1rem",
                    color: "white",
                    fontSize: "23px",
                  }}
                >
                  Welcome, {username}
                </h3>
              </Col>
            </Row>
            <Row style={{ width: "80vw" }}>
              <Col lg={9}>
                <ContentBox>
                  <HomepageSearch inputStyle={{ height: 50 }} />
                </ContentBox>
              </Col>
              <Col lg={3}></Col>
            </Row>
          </>
        ) : (
          <>
            <h3
              style={{
                backgroundColor: "rgba(54, 48, 60, 0.6)",
                padding: " 2rem 1rem",
                color: "white",
                fontSize: "23px",
              }}
            >
              Welcome, {username}
            </h3>
            <Centerer>
              <Container>
                <ContentBox>
                  <HomepageSearch inputStyle={{ height: 50 }} />
                </ContentBox>
              </Container>
            </Centerer>
          </>
        )}
      </BackgroundImage>

      {isLaptop ? (
        <Container
          className="mt-5 pb-5"
          style={{
            minHeight: "50vh",
            minWidth: "95vw",
          }}
        >
          <Row>
            <Col>
              <HomepageBox
                list={modifiedRecentlyAddedPol.map(toLabelValue)}
                basePath="policy"
                title="Recently added policies"
                themeColor={colors.tangerine}
                fontColor="black"
              />
            </Col>
            <Col>
              <HomepageBox
                list={popularPolicies.map(toLabelValue)}
                basePath="policy"
                title="Most popular policies"
                themeColor={colors.orange}
              />
            </Col>
            <Col>
              <HomepageBox
                list={savedPolicies.map((a) => {
                  return {
                    label: get(a, "originator.title"),
                    value: get(a, "originator.id"),
                  };
                })}
                basePath="policy"
                title="My saved policies"
                fontColor="black"
                themeColor={colors.yellow}
              />
            </Col>
            <Col>
              <HomepageBox
                list={popularResources.map(toLabelValue)}
                basePath="resources"
                title="Most popular resources"
                themeColor={colors.pink}
              />
            </Col>
            <Col>
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
                themeColor={colors.softPink}
              />
            </Col>
          </Row>
        </Container>
      ) : (
        <Container
          className="mt-5 pb-5"
          style={{ minHeight: "50vh", minWidth: "90vw" }}
        >
          <Row>
            <Col xs={12} md={6} lg={2}>
              <HomepageBox
                list={modifiedRecentlyAddedPol.map(toLabelValue)}
                basePath="policy"
                title="Recently added policies"
                themeColor={colors.tangerine}
              />
            </Col>
            <Col xs={12} md={6} lg={2}>
              <HomepageBox
                list={popularPolicies.map(toLabelValue)}
                basePath="policy"
                themeColor={colors.orange}
                title="Most popular policies"
              />
            </Col>
            <Col xs={12} md={6} lg={2}>
              <HomepageBox
                list={savedPolicies.map((a) => {
                  return {
                    label: get(a, "originator.title"),
                    value: get(a, "originator.id"),
                  };
                })}
                basePath="policy"
                themeColor={colors.yellow}
                title="My saved policies"
              />
            </Col>
            <Col xs={12} md={6} lg={2}>
              <HomepageBox
                list={popularResources.map(toLabelValue)}
                basePath="resources"
                themeColor={colors.pink}
                title="Most popular resources"
              />
            </Col>
            <Col xs={12} md={6} lg={2}>
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
                themeColor={colors.softPink}
                title="My recently visited policies"
              />
            </Col>
          </Row>
        </Container>
      )}

      <Footer />
    </Background>
  );
}

const Background = styled.div`
  background: #ffffff;
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

// const Greet = styled.h3`
//   margin-bottom: 1.5rem;
//   color: white;
// `;

const ContentBox = styled.div`
  padding: 2rem 1rem;
  margin-bottom: 2rem;
  background-color: rgba(54, 48, 60, 0.6);
  border-radius: 3px;
`;
