import { NetworkStatus } from "apollo-boost";
import { get } from "lodash";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { Col, Container, Input, Row } from "reactstrap";
import { oc } from "ts-optchain";
import { useBookmarksQuery } from "../../generated/graphql";
import Table from "../../shared/components/Table";
import { date } from "../../shared/formatter";
import { useDebounce } from "use-debounce/lib";

const Bookmark = () => {
  const [search, setSearch] = useState("");
  const [debounceSearch] = useDebounce(search, 800);
  const { data, networkStatus } = useBookmarksQuery({
    variables: {
      filter: {
        originator_of_Policy_type_title_or_originator_of_BusinessProcess_type_name_or_originator_of_Control_type_description_or_originator_of_Risk_type_name_cont: debounceSearch
        // originator_of_Policy_type_title_or_originator_of_BusinessProcess_type_name_or_originator_of_Control_type_description_or_originator_of_Risk_type_name_or_originator_of_User_type_name_cont: debounceSearch
      }
    }
  });

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  return (
    <div>
      <Helmet>
        <title>Bookmarks - PricewaterhouseCoopers</title>
      </Helmet>

      <Container>
        <h2>Bookmarks Manager</h2>

        <Row>
          <Col lg={4}>
            <Input placeholder="Search..." onChange={handleSearch} />
          </Col>
        </Row>

        <div className="table-responsive mt-5">
          <Table
            loading={networkStatus === NetworkStatus.loading}
            reloading={networkStatus === NetworkStatus.setVariables}
          >
            <thead>
              <tr>
                <th>Bookmarks Category</th>
                <th>Title</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {oc(data)
                .bookmarks.collection([])
                .map(bookmark => {
                  return (
                    <tr key={bookmark.id}>
                      <td>{bookmark.originatorType}</td>
                      <td>
                        <Title
                          title={
                            get(bookmark, "originator.name") ||
                            get(bookmark, "originator.title")
                          }
                          id={bookmark.originatorId}
                          type={bookmark.originatorType as OriginatorType}
                        />
                      </td>
                      <td>{date(bookmark.createdAt)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </div>
      </Container>
    </div>
  );
};

type OriginatorType =
  | "Policy"
  | "BusinessProcess"
  | "Control"
  | "Risk"
  | "User";

const Title = ({
  title,
  id,
  type
}: {
  title: string;
  id?: string | null;
  type: OriginatorType;
}) => {
  let link: string = "/";

  if (type) {
    if (type === "Policy") {
      link = `/business-process/${id}`;
    } else if (type === "BusinessProcess") {
      link = `/business-process/${id}`;
    } else if (type === "Control") {
      link = `/control/${id}`;
    } else if (type === "Risk") {
      link = `/risk-and-control/${id}`;
    } else if (type === "User") {
      link = `/user/${id}`;
    }
  }

  return <Link to={link}>{title}</Link>;
};

export default Bookmark;
