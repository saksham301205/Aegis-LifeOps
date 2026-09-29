/**
 * Rule-Based Notice Extraction Engine for Aegis LifeOps (India Region)
 * Transparently extracts structured draft fields using deterministic regex,
 * keyword pattern matching, and heuristic parsing.
 * NO AI/LLM API calls are hidden or claimed.
 */

export function extractFromNotice(rawText) {
  if (!rawText || !rawText.trim()) {
    return createEmptyDraft();
  }

  const text = rawText.trim();
  const confidenceNotes = [];

  // 1. Amount Extraction (₹1,234.50, Rs 1234, INR 1234, etc.)
  let amount = '';
  const amountRegex = /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i;
  const amountMatch = text.match(amountRegex);
  if (amountMatch) {
    amount = amountMatch[1].replace(/,/g, '');
    confidenceNotes.push(`Extracted currency amount: ₹${amount}`);
  } else {
    // Try bare numbers near 'due', 'total', 'amount', 'pay', or 'rs'
    const flexAmountMatch = text.match(/(?:total|amount|pay|due|fee|charge|rs)[:\s]+(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{2})?)/i);
    if (flexAmountMatch) {
      amount = flexAmountMatch[1].replace(/,/g, '');
      confidenceNotes.push(`Extracted numeric amount from keyword context: ₹${amount}`);
    }
  }

  // 2. Category Detection via Indian Keyword Taxonomy
  let category = 'Utilities';
  const lowerText = text.toLowerCase();

  if (/\b(electric|electricity|power|grid|bescom|msedcl|tneb|cesc|tata power|kseb|uppcl|kw|kwh)\b/i.test(lowerText)) {
    category = 'Electricity';
  } else if (/\b(gas|mahanagar gas|mgl|igl|gail|gujarat gas|lpg|png|cylinder)\b/i.test(lowerText)) {
    category = 'Gas';
  } else if (/\b(water|bwssb|djb|mcgm|municipal water|sewerage|water bill)\b/i.test(lowerText)) {
    category = 'Water';
  } else if (/\b(insurance|lic|star health|hdfc ergo|icici lombard|baja allianz|policy|premium|coverage)\b/i.test(lowerText)) {
    category = 'Insurance';
  } else if (/\b(passport|visa|aadhaar|pan card|voter id|document|registration|title|psk|tatkaal)\b/i.test(lowerText)) {
    category = 'Documents';
  } else if (/\b(subscription|aws|cloud|netflix|spotify|saas|recurring|hosting|membership|domain|jio|airtel)\b/i.test(lowerText)) {
    category = 'Subscriptions';
  } else if (/\b(vehicle|car|rto|puc|pollution|fastag|auto|inspection|oil change|emissions|mechanic)\b/i.test(lowerText)) {
    category = 'Vehicles';
  } else if (/\b(dentist|doctor|appointment|checkup|clinic|hospital|physician|therapy|vet|consultation)\b/i.test(lowerText)) {
    category = 'Appointments';
  }
  confidenceNotes.push(`Classified category as "${category}" based on keyword taxonomy`);

  // 3. Due Date Extraction (Leave BLANK if no valid date found!)
  let dueDate = '';
  let dateFound = false;

  const MONTH_MAP = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
    apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
    aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
    nov: 10, november: 10, dec: 11, december: 11
  };

  /**
   * Validates a calendar date is real (rejects 31 Feb, 30 Feb, etc.)
   */
  function isValidDate(year, month, day) {
    const y = Number(year);
    const m = Number(month); // 1-indexed
    const d = Number(day);
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    // Create date and verify it round-trips (handles month overflow)
    const probe = new Date(y, m - 1, d);
    return probe.getFullYear() === y && probe.getMonth() === m - 1 && probe.getDate() === d;
  }

  function toISO(year, month, day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Format A: ISO  YYYY-MM-DD
  if (!dateFound) {
    const isoMatch = text.match(/\b(202[4-9])-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      if (isValidDate(y, m, d)) {
        dueDate = toISO(y, m, d);
        dateFound = true;
        confidenceNotes.push(`Parsed ISO date: ${dueDate}`);
      }
    }
  }

  // Format B: DD/MM/YYYY  (Indian standard — day first)
  if (!dateFound) {
    const slashMatch = text.match(/\b([0-3]?\d)\/([01]?\d)\/(202[4-9])\b/);
    if (slashMatch) {
      const [, rawDay, rawMonth, year] = slashMatch;
      const day = Number(rawDay);
      const month = Number(rawMonth);
      if (isValidDate(year, month, day)) {
        dueDate = toISO(year, month, day);
        dateFound = true;
        confidenceNotes.push(`Parsed DD/MM/YYYY date: ${dueDate}`);
      } else {
        confidenceNotes.push(`⚠️ Rejected impossible date ${rawDay}/${rawMonth}/${year}`);
      }
    }
  }

  // Format C: "15 October 2026" or "15th October 2026"  (day before month name)
  if (!dateFound) {
    const dmyMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?),?\s+(202[4-9])\b/i);
    if (dmyMatch) {
      const day = Number(dmyMatch[1]);
      const month = MONTH_MAP[dmyMatch[2].toLowerCase()] + 1; // 1-indexed
      const year = dmyMatch[3];
      if (isValidDate(year, month, day)) {
        dueDate = toISO(year, month, day);
        dateFound = true;
        confidenceNotes.push(`Parsed "DD Month YYYY" date: ${dueDate}`);
      } else {
        confidenceNotes.push(`⚠️ Rejected impossible date ${dmyMatch[0]}`);
      }
    }
  }

  // Format D: "October 15, 2026" or "Oct 15 2026"  (month name before day)
  if (!dateFound) {
    const mdyMatch = text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(202[4-9])\b/i);
    if (mdyMatch) {
      const month = MONTH_MAP[mdyMatch[1].toLowerCase()] + 1;
      const day = Number(mdyMatch[2]);
      const year = mdyMatch[3];
      if (isValidDate(year, month, day)) {
        dueDate = toISO(year, month, day);
        dateFound = true;
        confidenceNotes.push(`Parsed "Month DD, YYYY" date: ${dueDate}`);
      } else {
        confidenceNotes.push(`⚠️ Rejected impossible date ${mdyMatch[0]}`);
      }
    }
  }

  // If no valid date found → leave blank, require manual review
  if (!dateFound) {
    dueDate = '';
    confidenceNotes.push('⚠️ No valid date found in notice text — manual date selection required before saving.');
  }

  // 4. Provider / Issuer Extraction
  let provider = '';
  const providerRegex = /(?:from|issuer|provider|biller|company|service|vendor|organization|board)[:\s]+([A-Z0-9\s&.-]{2,30})/i;
  const providerMatch = text.match(providerRegex);
  if (providerMatch) {
    provider = providerMatch[1].trim();
  } else {
    // Try first line if short or capitalized
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length < 35 && !firstLine.includes('₹') && !firstLine.includes('Rs')) {
      provider = firstLine;
    }
  }

  // 5. Consequence & Penalty Detection
  let consequenceNote = '';
  let consequenceSeverity = 'medium';

  const penaltyRegex = /(?:penalty|consequence|avoid|risk|fine|disconnection|suspension|lapse|cutoff|surcharge)[:\s]*([^.\n]{5,100})/i;
  const penaltyMatch = text.match(penaltyRegex);
  if (penaltyMatch) {
    consequenceNote = penaltyMatch[0].trim();
  } else {
    if (/disconnection|shutoff|cutoff|impound|lapse|suspension|police fine/i.test(lowerText)) {
      consequenceNote = "Service disconnection warning, RTO impound, or regulatory fine.";
    } else if (/late fee|surcharge|penalty|interest|ncb loss/i.test(lowerText)) {
      consequenceNote = "Late payment surcharge and penalty fee added to account.";
    } else {
      consequenceNote = "Missed deadline may cause account lapse or service interruption.";
    }
  }

  if (/disconnection|shutoff|cutoff|impound|lapse|suspension/i.test(lowerText)) {
    consequenceSeverity = 'critical';
  } else if (/late fee|surcharge|fine|₹\d{3,}/i.test(lowerText)) {
    consequenceSeverity = 'high';
  } else {
    consequenceSeverity = 'medium';
  }

  // 6. Title Generation
  let title = `${category} Notice`;
  if (provider) {
    title = `${category} - ${provider}`;
  } else {
    const keyMatch = text.match(/(?:bill|invoice|renewal|appointment|payment|statement|expiry|puc|rto)/i);
    if (keyMatch) {
      title = `${category} ${keyMatch[0].charAt(0).toUpperCase() + keyMatch[0].slice(1)}`;
    }
  }

  return {
    title,
    category,
    provider: provider || 'Unspecified Biller',
    amount: amount || '0',
    dueDate, // Can be blank if not found!
    consequenceSeverity,
    consequenceNote,
    notes: `Extracted from notice snippet:\n"${text.slice(0, 150)}${text.length > 150 ? '...' : ''}"`,
    extractionMetadata: {
      isRuleExtracted: true,
      label: 'Rule-Based Pattern Extraction (Regex & Heuristics)',
      confidenceNotes,
      extractedAt: new Date().toISOString()
    }
  };
}

function createEmptyDraft() {
  return {
    title: '',
    category: 'Electricity',
    provider: '',
    amount: '',
    dueDate: '', // Blank by default requiring manual entry
    consequenceSeverity: 'medium',
    consequenceNote: '',
    notes: '',
    extractionMetadata: {
      isRuleExtracted: false,
      label: 'Manual Draft Entry',
      confidenceNotes: ['Manual entry - please select due date and title.'],
      extractedAt: new Date().toISOString()
    }
  };
}
