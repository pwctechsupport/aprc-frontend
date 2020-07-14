import React, { Fragment } from "react";
import styled, { css } from "styled-components";

const mockupData = [
  { label: "Policy", total: 10, reviewed: 8, prepared: 2, addToPrepare: 0 },
  { label: "Risk", total: 10, reviewed: 5, prepared: 5, addToPrepare: 0 },
  { label: "Control", total: 5, reviewed: 2, prepared: 3, addToPrepare: 0 },
];

const PolicyChart = ({ data = mockupData, policies }: PolicyChartProps) => {
  const maxCount = Math.max(
    ...data.map((item) => Math.max(item.total, item.reviewed)),
    1
  );

  return (
    <PolicyChartContainer>
      {data.map((item) => {
        const colors = getColors(item.total, item.label);
        return (
          <PolicyChartItemWrapper key={item.label}>
            {policies ? (
              <Fragment>
                <PolicyChartItemPolicies
                  onClick={item.onClick}
                  height={(item.total / maxCount) * 400}
                  color={colors[2]}
                />
                <PolicyChartItemPolicies
                  onClick={item.onClick}
                  height={(item.reviewed / maxCount) * 400}
                  color={colors[1]}
                  inner
                />
              </Fragment>
            ) : (
              <Fragment>
                <PolicyChartItem
                  onClick={item.onClick}
                  height={(item.total / maxCount) * 400}
                  color={colors[2]}
                />
                <PolicyChartItem
                  onClick={item.onClick}
                  height={(item.reviewed / maxCount) * 400}
                  color={colors[1]}
                  inner
                />
              </Fragment>
            )}

            <ChartLabelValueWrapper>
              <ChartValue color={colors[0]}>{item.total}</ChartValue>
              <ChartLabel color={colors[0]}>{item.label}</ChartLabel>
            </ChartLabelValueWrapper>
          </PolicyChartItemWrapper>
        );
      })}
    </PolicyChartContainer>
  );
};

export default PolicyChart;

const getColors = (total: number, label: string): [string, string, string] => {
  if (label.match(/risk/gi) && total)
    return [colors.risk, colors.lightrisk, colors.palerisk];
  if (label.match(/polic/gi) && total)
    return [colors.policy, colors.lightpolicy, colors.palepolicy];
  if (label.match(/control/gi) && total)
    return [colors.control, colors.lightcontrol, colors.palecontrol];
  if (label.match(/risk/gi))
    return [colors.riskText, colors.lightrisk, colors.palerisk];
  if (label.match(/polic/gi))
    return [colors.policyText, colors.lightpolicy, colors.palepolicy];
  if (label.match(/control/gi))
    return [colors.controlText, colors.lightcontrol, colors.palecontrol];
  return [colors.red, colors.lightRed, colors.paleRed];
};

const colors = {
  policy: "white",
  lightpolicy: "#D04A02",
  palepolicy: "#E45C2B ",
  risk: "white ",
  lightrisk: "#EB8C00",
  palerisk: "#EFA333",
  control: "white",
  lightcontrol: "#FFB600",
  palecontrol: "#FFBD26 ",
  red: "#F56476",
  lightRed: "#BC072B",
  paleRed: "#D86179",
  policyText: "#D04A02",
  riskText: "#EB8C00",
  controlText: "#FFB600",
};

const PolicyChartContainer = styled.div`
  display: flex;
`;

const PolicyChartItemWrapper = styled.div`
  position: relative;
  flex: 1;
  height: 400px;
  margin-right: 20px;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  &:last-child {
    margin-right: 0;
  }
`;

const PolicyChartItem = styled.div<PolicyChartItemProps>`
  height: ${(p: PolicyChartItemProps) => p.height + "px"};
  position: absolute;
  width: 100%;
  bottom: 0;
  background: ${(props) => props.color};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  border-width: 0px;
  border-color: blueviolet;
  border-style: solid;
  cursor: pointer;
  &:hover {
    border-width: 2px;
  }
  ${(p: PolicyChartItemProps) =>
    p.inner &&
    css`
      width: 98%;
      bottom: 3px;
      height: ${(p: PolicyChartItemProps) => p.height - 6 + "px"};
    `};
`;
const PolicyChartItemPolicies = styled.div<PolicyChartItemProps>`
height: ${(p: PolicyChartItemProps) => p.height + "px"};
position: absolute;
width: 100%;
bottom: 0;
background: ${(props) => props.color};
display: flex;
justify-content: center;
align-items: center;
border-radius: 3px;
border-width: 0px;
border-color: blueviolet;
border-style: solid;
/* cursor: pointer;
&:hover {
  border-width: 2px;
}
${(p: PolicyChartItemProps) =>
  p.inner &&
  css`
    width: 98%;
    bottom: 3px;
    height: ${(p: PolicyChartItemProps) => p.height - 6 + "px"};
  `}; */
`;
const ChartValue = styled.div<ChartLabelProps>`
  color: ${(props) => props.color};
  font-weight: bold;
  font-size: 24px;
  line-height: 27px;
  text-align: center;
`;
const ChartLabel = styled.div<ChartLabelProps>`
  color: ${(props) => props.color};
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  text-align: center;
`;

const ChartLabelValueWrapper = styled.div`
  position: absolute;
  bottom: 20px;
`;

// ---------------------------------------------------
// Type Definitions
// ---------------------------------------------------
export interface PolicyChartProps {
  data: Array<ChartData>;
  policies?: boolean;
}

interface ChartData {
  label: string;
  total: number;
  prepared: number;
  addToPrepare?: number;
  reviewed: number;
  onClick?: () => void;
}

interface PolicyChartItemProps {
  height: number;
  color: string;
  inner?: boolean;
}

interface ChartLabelProps {
  color: string;
}
