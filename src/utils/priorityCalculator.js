/**
 * Explainable Priority Score Calculator for Aegis LifeOps (India Region)
 * Evaluates obligations based on Deadline Proximity, Consequence Severity,
 * INR (₹) Amount Impact, and Dependency Blocking Status.
 */

export function calculatePriorityScore(obligation, allObligations = []) {
  if (!obligation) return { score: 0, level: 'Low', breakdown: [] };

  // If already completed, score is 0
  if (obligation.status === 'Completed') {
    return {
      score: 0,
      level: 'Completed',
      breakdown: ['Obligation has been completed with verified self-reported status.']
    };
  }

  let totalScore = 0;
  const breakdown = [];

  // 1. Deadline Proximity Evaluation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(obligation.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let deadlineScore = 0;
  if (isNaN(diffDays)) {
    deadlineScore = 15;
    breakdown.push(`⚠️ Undated obligation require manual date review (+15 pts)`);
  } else if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    deadlineScore = Math.min(40 + daysOverdue * 3, 55);
    breakdown.push(`⚠️ OVERDUE by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} (+${deadlineScore} pts)`);
  } else if (diffDays === 0) {
    deadlineScore = 45;
    breakdown.push(`🚨 DUE TODAY (+45 pts)`);
  } else if (diffDays <= 3) {
    deadlineScore = 35;
    breakdown.push(`⏳ Due in ${diffDays} day${diffDays > 1 ? 's' : ''} (+35 pts)`);
  } else if (diffDays <= 7) {
    deadlineScore = 25;
    breakdown.push(`📅 Due within this week (${diffDays} days) (+25 pts)`);
  } else if (diffDays <= 14) {
    deadlineScore = 15;
    breakdown.push(`🗓️ Due in ${diffDays} days (+15 pts)`);
  } else if (diffDays <= 30) {
    deadlineScore = 8;
    breakdown.push(`🗓️ Due in ${diffDays} days (+8 pts)`);
  } else {
    deadlineScore = 3;
    breakdown.push(`🗓️ Due in ${diffDays} days (+3 pts)`);
  }
  totalScore += deadlineScore;

  // 2. Consequence Severity Evaluation
  const severity = (obligation.consequenceSeverity || 'medium').toLowerCase();
  let severityScore = 0;

  switch (severity) {
    case 'critical':
      severityScore = 25;
      breakdown.push(`💥 Critical Consequence: ${obligation.consequenceNote || 'Severe penalty or suspension'} (+25 pts)`);
      break;
    case 'high':
      severityScore = 18;
      breakdown.push(`⚠️ High Consequence: ${obligation.consequenceNote || 'Significant late fee or credit risk'} (+18 pts)`);
      break;
    case 'medium':
      severityScore = 10;
      breakdown.push(`⚡ Medium Consequence: ${obligation.consequenceNote || 'Standard late charge or disruption'} (+10 pts)`);
      break;
    case 'low':
    default:
      severityScore = 4;
      breakdown.push(`ℹ️ Low Consequence: Minor penalty (+4 pts)`);
      break;
  }
  totalScore += severityScore;

  // 3. Amount Financial Impact (INR ₹)
  const amount = Number(obligation.amount) || 0;
  let amountScore = 0;
  if (amount >= 10000) {
    amountScore = 12;
    breakdown.push(`💰 High Financial Impact (₹${amount.toLocaleString('en-IN')}) (+12 pts)`);
  } else if (amount >= 3000) {
    amountScore = 8;
    breakdown.push(`💵 Moderate Financial Impact (₹${amount.toLocaleString('en-IN')}) (+8 pts)`);
  } else if (amount >= 500) {
    amountScore = 4;
    breakdown.push(`💲 Standard Payment (₹${amount.toLocaleString('en-IN')}) (+4 pts)`);
  } else if (amount > 0) {
    amountScore = 2;
    breakdown.push(`🪙 Low Financial Impact (₹${amount.toLocaleString('en-IN')}) (+2 pts)`);
  }
  totalScore += amountScore;

  // 4. Dependency Analysis (Is this item blocking others?)
  const dependentItems = allObligations.filter(
    item => item.prerequisiteId === obligation.id && item.status !== 'Completed'
  );
  if (dependentItems.length > 0) {
    const boost = Math.min(dependentItems.length * 8, 16);
    totalScore += boost;
    const names = dependentItems.map(i => `"${i.title}"`).join(', ');
    breakdown.push(`🔓 Prerequisite Blocker: Unblocks ${dependentItems.length} active downstream item(s): ${names} (+${boost} pts)`);
  }

  // Check if THIS item is blocked by an uncompleted prerequisite
  let isBlocked = false;
  let blockedByTitle = '';
  if (obligation.prerequisiteId) {
    const prereq = allObligations.find(item => item.id === obligation.prerequisiteId);
    if (prereq && prereq.status !== 'Completed') {
      isBlocked = true;
      blockedByTitle = prereq.title;
      breakdown.push(`🛑 Action Blocked: Must complete prerequisite "${blockedByTitle}" first!`);
    }
  }

  // Cap score between 1 and 100
  const finalScore = Math.min(Math.max(Math.round(totalScore), 1), 100);

  let level = 'Low';
  if (finalScore >= 75) level = 'Critical';
  else if (finalScore >= 50) level = 'High';
  else if (finalScore >= 25) level = 'Medium';

  return {
    score: finalScore,
    level,
    breakdown,
    isBlocked,
    blockedByTitle,
    daysRemaining: isNaN(diffDays) ? 999 : diffDays
  };
}

/**
 * Generates an explainable "What Should I Do Next?" master recommendation
 */
export function getWhatToDoNextPlan(obligations = []) {
  const activeObligations = obligations.filter(o => o.status !== 'Completed');

  if (activeObligations.length === 0) {
    return {
      topObligation: null,
      headline: "All clear! You're caught up on all life operations.",
      reasoning: "No pending bills, renewals, or appointments require immediate action right now.",
      nextSteps: ["Enjoy your peace of mind!", "Use Smart Inbox whenever a new notice arrives."]
    };
  }

  // Sort active obligations by priority score descending
  const scored = activeObligations.map(ob => ({
    ...ob,
    priority: calculatePriorityScore(ob, obligations)
  })).sort((a, b) => b.priority.score - a.priority.score);

  // Pick top actionable item (preferably not blocked)
  let topItem = scored.find(item => !item.priority.isBlocked) || scored[0];

  const p = topItem.priority;
  let headline = `Priority Action: ${topItem.title}`;
  if (topItem.provider) headline += ` (${topItem.provider})`;

  let actionVerb = "Pay";
  if (topItem.category === 'Appointments') actionVerb = "Attend / Confirm";
  else if (topItem.category === 'Documents' || topItem.category === 'Vehicles') actionVerb = "Renew / Complete";
  else if (topItem.category === 'Subscriptions') actionVerb = "Review / Renew";

  const dueDateFormatted = topItem.dueDate ? new Date(topItem.dueDate).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'Manual Review Required';

  let reasoning = `${actionVerb} by ${dueDateFormatted}. `;
  if (p.daysRemaining < 0) {
    reasoning += `This obligation is ${Math.abs(p.daysRemaining)} days OVERDUE. `;
  } else if (p.daysRemaining === 0) {
    reasoning += `This obligation is DUE TODAY. `;
  } else if (p.daysRemaining !== 999) {
    reasoning += `Due in ${p.daysRemaining} day(s). `;
  } else {
    reasoning += `Due date unassigned. `;
  }

  if (topItem.consequenceNote) {
    reasoning += `Delay risks: ${topItem.consequenceNote}.`;
  }

  const nextSteps = [
    `Gather reference details / account numbers for ${topItem.provider || topItem.title}.`,
    topItem.amount ? `Ensure funds (₹${Number(topItem.amount).toLocaleString('en-IN')}) are available.` : `Schedule exact time on calendar.`,
    `Click "Complete & Attach Proof" to close out this obligation.`
  ];

  if (p.isBlocked) {
    nextSteps.unshift(`⚠️ Note: Handle prerequisite "${p.blockedByTitle}" before finalizing.`);
  }

  return {
    topObligation: topItem,
    headline,
    reasoning,
    nextSteps,
    score: p.score,
    level: p.level
  };
}
