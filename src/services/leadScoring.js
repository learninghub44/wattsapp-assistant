/**
 * Score a lead based on budget and timeline
 * Returns: { score, tier: 'hot' | 'warm' | 'cold' }
 */
function scoreLead({ budget, timeline, isHotLead }) {
  let score = 0;

  // Budget scoring
  if (budget) {
    const b = budget.toLowerCase();
    if (b.includes("above 50") || b.includes("50,000+") || b.includes("100") || b.includes("150")) {
      score += 50;
    } else if (b.includes("20") || b.includes("30") || b.includes("40")) {
      score += 30;
    } else {
      score += 10;
    }
  }

  // Timeline scoring
  if (timeline) {
    const t = timeline.toLowerCase();
    if (t.includes("urgent") || t.includes("week") || t.includes("asap") || t.includes("immediately")) {
      score += 40;
    } else if (t.includes("month") || t.includes("30 days")) {
      score += 20;
    } else {
      score += 5;
    }
  }

  // AI-detected hot lead
  if (isHotLead) score = Math.max(score, 90);

  let tier;
  if (score >= 80) tier = "hot";
  else if (score >= 50) tier = "warm";
  else tier = "cold";

  return { score, tier };
}

module.exports = { scoreLead };
