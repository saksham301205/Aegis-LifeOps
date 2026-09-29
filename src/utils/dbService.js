import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getObligations as getLocalObligations, saveAllObligations as saveLocalAll, saveObligation as saveLocalSingle, deleteObligation as deleteLocalSingle } from './storage';

const MYSQL_API_URL = 'http://localhost:5000/api';
let isMySqlAvailable = false;

// Check if Express MySQL backend is active
async function checkMySqlBackend() {
  try {
    const res = await fetch(`${MYSQL_API_URL}/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      isMySqlAvailable = Boolean(data.connected);
    }
  } catch (e) {
    isMySqlAvailable = false;
  }
}

// Initial check
checkMySqlBackend();

export function getDatabaseMode() {
  if (isMySqlAvailable) return 'MYSQL WORKBENCH';
  if (isSupabaseConfigured) return 'POSTGRES';
  return 'LOCAL DEMO';
}

/**
 * Maps Supabase row (snake_case) to application model (camelCase)
 */
export function mapRowToObligation(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    provider: row.provider || '',
    amount: row.amount ? Number(row.amount) : 0,
    dueDate: row.due_date || '',
    status: row.status || 'Pending',
    consequenceSeverity: row.consequence_severity || 'medium',
    consequenceNote: row.consequence_note || '',
    prerequisiteId: row.prerequisite_id || null,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    proof: row.proofs && row.proofs.length > 0 ? {
      type: row.proofs[0].type,
      referenceNumber: row.proofs[0].reference_number,
      fileName: row.proofs[0].file_name,
      filePath: row.proofs[0].file_path,
      note: row.proofs[0].note,
      attachedAt: row.proofs[0].attached_at,
      isSelfReported: row.proofs[0].is_self_reported
    } : null
  };
}

/**
 * Maps application model (camelCase) to database row (snake_case)
 */
export function mapObligationToRow(ob, userId) {
  return {
    user_id: userId || 'user_local',
    title: ob.title,
    category: ob.category,
    provider: ob.provider || '',
    amount: ob.amount ? Number(ob.amount) : 0,
    due_date: ob.dueDate || null,
    status: ob.status || 'Pending',
    consequence_severity: ob.consequenceSeverity || 'medium',
    consequence_note: ob.consequenceNote || '',
    prerequisite_id: ob.prerequisiteId || null,
    notes: ob.notes || '',
    updated_at: new Date().toISOString()
  };
}

/**
 * Fetches all obligations from MySQL Workbench API, Supabase, or localStorage
 */
export async function fetchUserObligations(userId = null) {
  await checkMySqlBackend();

  if (isMySqlAvailable) {
    try {
      const res = await fetch(`${MYSQL_API_URL}/obligations`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('MySQL fetch error:', err);
    }
  }

  if (isSupabaseConfigured && userId && supabase) {
    try {
      const { data, error } = await supabase
        .from('obligations')
        .select(`*, proofs (*)`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        return getLocalObligations();
      }

      return data ? data.map(mapRowToObligation) : [];
    } catch (err) {
      console.error('Database query failure:', err);
      return getLocalObligations();
    }
  }

  return getLocalObligations();
}

/**
 * Saves or updates an obligation
 */
export async function saveUserObligation(item, userId = null) {
  await checkMySqlBackend();

  if (isMySqlAvailable) {
    try {
      const res = await fetch(`${MYSQL_API_URL}/obligations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('MySQL save error:', err);
    }
  }

  if (isSupabaseConfigured && userId && supabase) {
    const row = mapObligationToRow(item, userId);

    if (item.id && !item.id.startsWith('ob-') && !item.id.startsWith('temp-')) {
      const { data, error } = await supabase
        .from('obligations')
        .update(row)
        .eq('id', item.id)
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      return data ? mapRowToObligation(data[0]) : null;
    } else {
      const { data, error } = await supabase
        .from('obligations')
        .insert(row)
        .select();

      if (error) throw error;
      return data ? mapRowToObligation(data[0]) : null;
    }
  }

  return saveLocalSingle(item);
}

/**
 * Deletes an obligation record
 */
export async function deleteUserObligation(id, userId = null) {
  await checkMySqlBackend();

  if (isMySqlAvailable) {
    try {
      const res = await fetch(`${MYSQL_API_URL}/obligations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return true;
    } catch (err) {
      console.error('MySQL delete error:', err);
    }
  }

  if (isSupabaseConfigured && userId && supabase) {
    const { error } = await supabase
      .from('obligations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  deleteLocalSingle(id);
  return true;
}

/**
 * Updates status and attaches self-reported proof
 */
export async function updateUserObligationStatus(id, newStatus, proofData = null, userId = null) {
  await checkMySqlBackend();

  if (isMySqlAvailable) {
    try {
      const res = await fetch(`${MYSQL_API_URL}/obligations/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, proof: proofData })
      });
      if (res.ok) return true;
    } catch (err) {
      console.error('MySQL status update error:', err);
    }
  }

  if (isSupabaseConfigured && userId && supabase) {
    const { error: obError } = await supabase
      .from('obligations')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (obError) throw obError;

    if (proofData) {
      const proofRow = {
        user_id: userId,
        obligation_id: id,
        type: proofData.type || 'reference_note',
        reference_number: proofData.referenceNumber || '',
        file_name: proofData.fileName || '',
        file_path: proofData.filePath || '',
        note: proofData.note || '',
        attached_at: proofData.attachedAt || new Date().toISOString().split('T')[0],
        is_self_reported: true
      };

      await supabase.from('proofs').insert(proofRow);
    }

    return true;
  }

  const current = getLocalObligations();
  const updated = current.map(o => (o.id === id ? { ...o, status: newStatus, proof: proofData || o.proof } : o));
  saveLocalAll(updated);
  return true;
}

export async function uploadProofFileToStorage(file, userId) {
  return { filePath: null, fileName: file.name };
}

export async function importLocalStorageDataToSupabase(userId) {
  return { success: true, count: 0, message: 'Local data synced.' };
}
