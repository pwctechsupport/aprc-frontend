import React, { useState } from "react";
import Helmet from "react-helmet";
import Switch from "react-switch";
import { Col, Row } from "reactstrap";
import { toast } from "react-toastify";
import { useNotifBadgesMutation } from "../../generated/graphql";
import { useDebouncedCallback } from "use-debounce/lib";

const NotificationSettings = () => {
  const settings = [{ name: "iconBadges", label: "Notifications Icon Badges" }];

  const [notifBadgesMutation] = useNotifBadgesMutation({
    onCompleted: () => {
      toast.success("Notification Disabled");
    },
    onError: () => toast.error("Disable Notification Failed")
  });

  const handleSwitch = (notifShow: boolean) => {
    notifBadgesMutation({ variables: { input: { notifShow } } });
  };
  const [show, setShow] = useState(false);

  const firstPhase = (a: boolean) => {
    setShow(a);
    handleSwitch(a);
  };
  const [debouncedCallback] = useDebouncedCallback(firstPhase, 400);
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
                  onChange={e => debouncedCallback(e)}
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
