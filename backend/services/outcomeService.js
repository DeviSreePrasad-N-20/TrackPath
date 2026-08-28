// AI-READY SERVICE: Replace these deterministic calculations with an LLM/ML
// model later for anomaly detection and richer scheme narratives. Routes do
// not need to change because all insight logic is kept behind this module.
const wageMidpoint = {
  "Below ₹10k": 8000,
  "₹10k–15k": 12500,
  "₹15k–20k": 17500,
  "₹20k–30k": 25000,
  "Above ₹30k": 35000,
};
const employed = (status) =>
  ["employed", "self-employed", "apprenticeship"].includes(status);
const insightFor = (scheme, stats) => {
  if (stats.placementRate < 55)
    return `${scheme.trade} needs placement-partnership support; fewer than 55% of consented trainees report work.`;
  if (stats.retention6 < 60)
    return `${scheme.trade} is placing trainees, but six-month retention needs attention.`;
  return `${scheme.trade} shows a resilient employment trajectory. Focus on wage progression and progression pathways.`;
};
module.exports = { wageMidpoint, employed, insightFor };
