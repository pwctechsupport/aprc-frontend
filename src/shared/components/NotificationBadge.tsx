import React from "react";
import styled from "styled-components";

const NotificationBadge = ({
  count = 0
}: {
  count?: number | string | null;
}) => {
  if (count) {
    return (
      <NotifWrapper>
        <NotifBadge>
          <NotifNumber>{count}</NotifNumber>
        </NotifBadge>
      </NotifWrapper>
    );
  }
  return null;
};

export default NotificationBadge;

const NotifWrapper = styled.div`
  position: relative;
`;

const NotifBadge = styled.div`
  position: absolute;
  width: 19px;
  height: 19px;
  left: 12px;
  top: -10px;

  background: #f51709;
  border-radius: 3px;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotifNumber = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 11px;
  line-height: 12px;

  color: #ffffff;
`;
