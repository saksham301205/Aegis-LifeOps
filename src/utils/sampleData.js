/**
 * Fictional Indian Sample Obligations Dataset for Aegis LifeOps Demo
 * Includes Indian utilities, RTO/PUC vehicle dependencies, Indian insurance,
 * and INR (₹) pricing with fictional sample consequences.
 */

function getRelativeDateISO(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const INITIAL_OBLIGATIONS = [
  {
    id: 'ob-in-101',
    title: 'RTO Pollution Under Control (PUC) Test',
    category: 'Vehicles',
    provider: 'Authorized RTO Emission Testing Station',
    amount: 150.00,
    dueDate: getRelativeDateISO(2), // Due in 2 days
    status: 'In progress',
    consequenceSeverity: 'high',
    consequenceNote: 'Fictional sample penalty: ₹2,000 late charge & blocks annual RTO tax renewal.',
    notes: 'Visit Green-Zone PUC Center on MG Road. Carry vehicle RC book.',
    prerequisiteId: null,
    proof: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'ob-in-102',
    title: 'RTO Vehicle Road Tax & Registration Renewal',
    category: 'Vehicles',
    provider: 'State Regional Transport Office (RTO)',
    amount: 2200.00,
    dueDate: getRelativeDateISO(6), // Due in 6 days
    status: 'Pending',
    consequenceSeverity: 'critical',
    consequenceNote: 'Fictional sample penalty: ₹5,000 late surcharge & registration hold.',
    notes: 'Requires valid PUC certificate before submitting renewal online via Parivahan portal.',
    prerequisiteId: 'ob-in-101', // Depends on PUC Certificate!
    proof: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'ob-in-103',
    title: 'BESCOM Electricity & Power Monthly Utility Bill',
    category: 'Electricity',
    provider: 'Bangalore Electricity Supply Co. (BESCOM)',
    amount: 2450.00,
    dueDate: getRelativeDateISO(1), // Due tomorrow!
    status: 'Pending',
    consequenceSeverity: 'critical',
    consequenceNote: 'Fictional sample penalty: ₹250 late surcharge & power disconnection warning after 7 days.',
    notes: 'Consumer ID: 4492-0193. Meter reading verified.',
    prerequisiteId: null,
    proof: null,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'ob-in-104',
    title: 'Mahanagar Piped Natural Gas Utility Bill',
    category: 'Gas',
    provider: 'Mahanagar Gas Limited (MGL)',
    amount: 1120.00,
    dueDate: getRelativeDateISO(8), // Due in 8 days
    status: 'Pending',
    consequenceSeverity: 'medium',
    consequenceNote: 'Fictional sample penalty: ₹150 penalty fee & PNG supply throttle.',
    notes: 'Bi-monthly billing cycle. Customer #PNG-88319.',
    prerequisiteId: null,
    proof: null,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'ob-in-105',
    title: 'BWSSB Municipal Water Supply Statement',
    category: 'Water',
    provider: 'Water Supply & Sewerage Board',
    amount: 650.00,
    dueDate: getRelativeDateISO(14), // Due in 14 days
    status: 'Pending',
    consequenceSeverity: 'medium',
    consequenceNote: 'Fictional sample penalty: 10% late surcharge added to next monthly statement.',
    notes: 'RR Number: W-99381. Usage 12,000 Liters.',
    prerequisiteId: null,
    proof: null,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'ob-in-106',
    title: 'Star Health Family Optima Insurance Renewal',
    category: 'Insurance',
    provider: 'Star Health & Allied Insurance',
    amount: 14500.00,
    dueDate: getRelativeDateISO(5), // Due in 5 days
    status: 'Pending',
    consequenceSeverity: 'high',
    consequenceNote: 'Fictional sample penalty: Coverage lapse & loss of accumulated No-Claim Bonus.',
    notes: 'Policy #SH-99201-B. Online renewal discount applicable.',
    prerequisiteId: null,
    proof: null,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  {
    id: 'ob-in-107',
    title: 'Passport Sewa Kendra Re-issue Application',
    category: 'Documents',
    provider: 'Passport Seva - Ministry of External Affairs',
    amount: 1500.00,
    dueDate: getRelativeDateISO(20), // Due in 20 days
    status: 'In progress',
    consequenceSeverity: 'high',
    consequenceNote: 'Fictional sample penalty: Expired passport travel delay & ₹2,000 urgent reissue surcharge.',
    notes: 'ARN #26-0091823. Appointment scheduled at Koramangala PSK.',
    prerequisiteId: null,
    proof: null,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: 'ob-in-108',
    title: 'AWS Cloud Infrastructure Hosting (Mumbai Region)',
    category: 'Subscriptions',
    provider: 'Amazon Web Services India',
    amount: 6800.00,
    dueDate: getRelativeDateISO(11), // Due in 11 days
    status: 'Pending',
    consequenceSeverity: 'medium',
    consequenceNote: 'Fictional sample penalty: Server resource pause & API gateway delay after 14-day grace.',
    notes: 'Monthly AWS GST invoice #IN-2026-991.',
    prerequisiteId: null,
    proof: null,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: 'ob-in-109',
    title: 'Dr. Mehta Dental Health Checkup & Cleaning',
    category: 'Appointments',
    provider: 'Mehta Dental Care Clinic',
    amount: 800.00,
    dueDate: getRelativeDateISO(-2), // 2 days ago
    status: 'Completed',
    consequenceSeverity: 'low',
    consequenceNote: 'Fictional sample penalty: ₹500 rescheduling fee without 24h notice.',
    notes: 'Routine dental scaling & checkup completed successfully.',
    prerequisiteId: null,
    proof: {
      type: 'receipt',
      referenceNumber: 'REC-IN-8821',
      note: 'Payment made via UPI (GPay). Digital receipt stored for insurance claim.',
      fileName: 'dental_receipt_sep2026.pdf',
      attachedAt: getRelativeDateISO(-2),
      isSelfReported: true
    },
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];
