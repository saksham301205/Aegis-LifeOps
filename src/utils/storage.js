/**
 * LocalStorage Persistence & Data Manager for Aegis LifeOps (India Region)
 * Manages persistence, dependency validation, cycle detection, and demo resets.
 */

import { INITIAL_OBLIGATIONS } from './sampleData';

const STORAGE_KEY = 'aegis_lifeops_obligations_v1';

export function getObligations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAllObligations(INITIAL_OBLIGATIONS);
      return INITIAL_OBLIGATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_OBLIGATIONS;
  } catch (err) {
    console.error('Error reading Aegis obligations from localStorage:', err);
    return INITIAL_OBLIGATIONS;
  }
}

export function saveAllObligations(obligations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obligations));
    window.dispatchEvent(new CustomEvent('aegis-storage-update'));
  } catch (err) {
    console.error('Error saving Aegis obligations to localStorage:', err);
  }
}

/**
 * Checks if setting proposedPrereqId as prerequisite for targetId creates a cycle (e.g. A -> B -> A)
 */
export function wouldCreateDependencyCycle(targetId, proposedPrereqId, allObligations) {
  if (!proposedPrereqId || !targetId) return false;
  if (targetId === proposedPrereqId) return true; // Direct self-dependency!

  let currentId = proposedPrereqId;
  const visited = new Set();

  while (currentId) {
    if (currentId === targetId) {
      return true; // Encountered targetId in ancestor chain -> Cycle detected!
    }
    if (visited.has(currentId)) {
      break; // Already checked this branch
    }
    visited.add(currentId);

    const ancestor = allObligations.find(o => o.id === currentId);
    currentId = ancestor ? ancestor.prerequisiteId : null;
  }

  return false;
}

/**
 * Checks if an obligation can be marked as Completed.
 * PREVENT completing an obligation while its prerequisite is incomplete!
 */
export function canCompleteObligation(targetId, allObligations) {
  const item = allObligations.find(o => o.id === targetId);
  if (!item) return { allowed: true };

  if (item.prerequisiteId) {
    const prereq = allObligations.find(o => o.id === item.prerequisiteId);
    if (prereq && prereq.status !== 'Completed') {
      return {
        allowed: false,
        reason: `Cannot complete "${item.title}" because prerequisite "${prereq.title}" is incomplete!`
      };
    }
  }

  return { allowed: true };
}

export function saveObligation(item) {
  const current = getObligations();

  // Validate cycle if prerequisite is set
  if (item.prerequisiteId) {
    const targetId = item.id || 'NEW_TEMP';
    if (wouldCreateDependencyCycle(targetId, item.prerequisiteId, current)) {
      throw new Error(`Dependency Cycle Error: Choosing that prerequisite creates a circular dependency loop!`);
    }
  }

  let updated;
  if (item.id) {
    // Edit existing
    updated = current.map(o => (o.id === item.id ? { ...o, ...item, updatedAt: new Date().toISOString() } : o));
  } else {
    // Create new
    const newItem = {
      ...item,
      id: 'ob-in-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      status: item.status || 'Pending',
      createdAt: new Date().toISOString()
    };
    updated = [newItem, ...current];
  }

  saveAllObligations(updated);
  return updated;
}

export function deleteObligation(id) {
  const current = getObligations();
  const updated = current
    .filter(o => o.id !== id)
    .map(o => (o.prerequisiteId === id ? { ...o, prerequisiteId: null } : o));

  saveAllObligations(updated);
  return updated;
}

export function updateObligationStatus(id, newStatus, proof = null) {
  const current = getObligations();

  if (newStatus === 'Completed') {
    const check = canCompleteObligation(id, current);
    if (!check.allowed) {
      alert(check.reason);
      return current;
    }
  }

  const updated = current.map(o => {
    if (o.id === id) {
      return {
        ...o,
        status: newStatus,
        proof: proof !== null ? proof : o.proof,
        updatedAt: new Date().toISOString()
      };
    }
    return o;
  });

  saveAllObligations(updated);
  return updated;
}

export function resetDemoData() {
  saveAllObligations(INITIAL_OBLIGATIONS);
  return INITIAL_OBLIGATIONS;
}
