import React from "react";
import styled from "styled-components";

const NotificationBadge = ({
  count = 0
}: {
  count?: number | string | null;
}) => {
  if (!count) return null;
  const displayCount = count > 99 ? "99+" : String(count);
  if (count) {
    return (
      <NotifWrapper>
        <NotifBadge>
          <NotifNumber count={displayCount}>{displayCount}</NotifNumber>
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
  width: 22px;
  height: 19px;
  left: 12px;
  top: -10px;

  background: #f51709;
  border-radius: 3px;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2px;
`;

const NotifNumber = styled.div<{ count: string }>`
  font-style: normal;
  font-weight: 600;
  font-size: ${p => (p.count.length >= 3 ? "9" : "11")}px;
  line-height: 12px;
  color: #ffffff;
`;
