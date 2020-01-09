import React from "react";
import styled, { css } from "styled-components";

const mockupData = [
  { label: "Policy", total: 10, reviewed: 8 },
  { label: "Risk", total: 10, reviewed: 5 },
  { label: "Control", total: 5, reviewed: 2 }
];

const PolicyChart = ({ data = mockupData }: PolicyChartProps) => {
  const maxCount = Math.max(
    ...data.map(item => Math.max(item.total, item.reviewed)),
    1
  );

  return (
    <PolicyChartContainer>
      {data.map(item => {
        const colors = getColors(item.label);
        return (
          <PolicyChartItemWrapper key={item.label}>
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

const getColors = (label: string): [string, string, string] => {
  if (label === "Risk")
    return [colors.green, colors.lightGreen, colors.paleGreen];
  if (label.toUpperCase().includes("POLICY"))
    return [colors.orange, colors.lightOrange, colors.paleOrange];
  if (label === "Control")
    return [colors.blue, colors.lightBlue, colors.paleBlue];
  return [colors.red, colors.lightRed, colors.paleRed];
};

const colors = {
  orange: "#D85604",
  lightOrange: "#FFE3D1",
  paleOrange: "#FFEDE2",
  green: "#04C07C",
  lightGreen: "#D1FFD8",
  paleGreen: "#E3FFE7",
  blue: "#0459D8",
  lightBlue: "#D1E6FF",
  paleBlue: "#E3F0FF",
  red: "#F56476",
  lightRed: "#BC072B",
  paleRed: "#D86179"
};

const PolicyChartContainer = styled.div`
  display: flex;
`;

const PolicyChartItemWrapper = styled.div`
  position: relative;
  flex: 1;
  height: 400px;
  margin-right: 20px;
  border-radius: 10px;
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
  background: ${props => props.color};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 10px;
  border-width: 0px;
  border-color: blueviolet;
  border-style: solid;
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
const ChartValue = styled.div<ChartLabelProps>`
  color: ${props => props.color};
  font-weight: bold;
  font-size: 24px;
  line-height: 27px;
  text-align: center;
`;
const ChartLabel = styled.div<ChartLabelProps>`
  color: ${props => props.color};
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
}

interface ChartData {
  label: string;
  total: number;
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
