import React, { useState } from "react";
import Helmet from "react-helmet";
import Switch from "react-switch";
import { Col, Row } from "reactstrap";
import { useDebouncedCallback } from "use-debounce/lib";
import { useNotifBadgesMutation } from "../../generated/graphql";

const NotificationSettings = () => {
  const settings = [{ name: "iconBadges", label: "Notifications Icon Badges" }];
  const [show, setShow] = useState(false);

  const [notifBadgesMutation] = useNotifBadgesMutation({
    awaitRefetchQueries: true,
    refetchQueries: ["notificationsCount"]
  });
  async function handleSwitch(notifShow: boolean) {
    notifBadgesMutation({ variables: { input: { notifShow } } });
  }

  const [debouncedHandleSwitch] = useDebouncedCallback(handleSwitch, 900);
  const handleClick = (a: boolean) => {
    setShow(a);
    debouncedHandleSwitch(a);
  };

  return (
    <div>
      <Helmet>
        <title>Notification - Settings - PricewaterhouseCoopers</title>
      </Helmet>
      <div>
        <h4>Notifications</h4>
        <br />
        <Row>
          <Col md={6}>
            {settings.map(s => (
              <div key={s.name} className="d-flex justify-content-between">
                <h6>{s.label}</h6>
                <Switch
                  checked={show}
                  height={25}
                  width={50}
                  onChange={handleClick}
                />
              </div>
            ))}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default NotificationSettings;
