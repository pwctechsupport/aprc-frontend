export function formatPolicyChart(value: Input): Output[] {
  return [
    { label: "Sub-Policy", ...getPreparedReviewed(value.subCount) },
    { label: "Risk", ...getPreparedReviewed(value.riskCount) },
    { label: "Control", ...getPreparedReviewed(value.controlCount) },
  ];
}

const getPreparedReviewed = (
  obj: StatusCount
): {
  total: number;
  reviewed: number;
  prepared: number;
  addToPrepare: number;
} => ({
  reviewed: obj.release,
  addToPrepare: obj.waiting_for_review,
  prepared: obj.draft,
  total: obj.total,
});

interface StatusCount {
  total: number;
  draft: number;
  waiting_for_approval: number;
  release: number;
  ready_for_edit: number;
  waiting_for_review: number;
}

interface Input {
  controlCount: StatusCount;
  riskCount: StatusCount;
  subCount: StatusCount;
}

interface Output {
  label: string;
  total: number;
  reviewed: number;
  prepared: number;
  onClick?: () => void;
}
