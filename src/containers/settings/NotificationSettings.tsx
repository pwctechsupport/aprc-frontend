import React, { Fragment } from "react";
import { Form, FormGroup, Input, Label, Col } from "reactstrap";
import Button from "../../shared/components/Button";

const settings = [
  { name: "autoForward", label: "Auto Forward Notifications" },
  { name: "iconBadges", label: "Notifications Icon Badges" },
  { name: "doNotDisturb", label: "Do not Disturb" }
];

const NotificationSettings = () => {
  return (
    <div>
      <h4>Notifications</h4>
      <Col md={6}>
        <Form>
          {settings.map(s => (
            <Fragment key={s.name}>
              <FormGroup check className="py-3">
                <Input
                  type="checkbox"
                  name={s.name}
                  id={s.name + "Checkbox"}
                  // innerRef={register}
                />
                <Label for={s.name + "Checkbox"} check className="pl-2">
                  {s.label}
                </Label>
              </FormGroup>
              <div className="divider" />
            </Fragment>
          ))}
          <div className="d-flex justify-content-end mt-3">
            <Button type="submit" className="pwc">
              Save Settings
            </Button>
          </div>
        </Form>
      </Col>
    </div>
  );
};

export default NotificationSettings;
