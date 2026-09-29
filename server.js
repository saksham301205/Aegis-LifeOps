import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

try {
  const dotenv = await import('dotenv');
  dotenv.default?.config() || dotenv.config?.();
} catch (e) {
  // Environment variables loaded from environment or Node --env-file
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MySQL Connection Config (Defaults for MySQL Workbench / local MySQL)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'aegis_lifeops',
  multipleStatements: true
};

let pool = null;

async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log(`✅ Connected to MySQL Database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS obligations (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) DEFAULT 'user_local',
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        provider VARCHAR(255),
        amount DECIMAL(12, 2) DEFAULT 0.00,
        due_date DATE,
        status VARCHAR(50) DEFAULT 'Pending',
        consequence_severity VARCHAR(50) DEFAULT 'medium',
        consequence_note TEXT,
        prerequisite_id VARCHAR(64),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS proofs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) DEFAULT 'user_local',
        obligation_id VARCHAR(64) NOT NULL,
        type VARCHAR(50) DEFAULT 'reference_note',
        reference_number VARCHAR(100),
        file_name VARCHAR(255),
        file_path VARCHAR(512),
        note TEXT,
        attached_at DATE,
        is_self_reported BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    connection.release();
  } catch (err) {
    console.error('⚠️ MySQL Connection Warning:', err.message);
    console.log('👉 Tip: Ensure MySQL service is running in MySQL Workbench and your DB_PASSWORD in .env is correct.');
  }
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MySQL', connected: Boolean(pool) });
});

// GET all obligations from MySQL
app.get('/api/obligations', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'MySQL Database not connected' });
  try {
    const [rows] = await pool.query(`
      SELECT o.*, 
             p.type as proof_type, p.reference_number as proof_ref, p.file_name as proof_file, p.note as proof_note, p.attached_at as proof_attached_at
      FROM obligations o
      LEFT JOIN proofs p ON o.id = p.obligation_id
      ORDER BY o.created_at DESC
    `);

    const mapped = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      category: r.category,
      provider: r.provider || '',
      amount: r.amount ? Number(r.amount) : 0,
      dueDate: r.due_date ? new Date(r.due_date).toISOString().split('T')[0] : '',
      status: r.status || 'Pending',
      consequenceSeverity: r.consequence_severity || 'medium',
      consequenceNote: r.consequence_note || '',
      prerequisiteId: r.prerequisite_id || null,
      notes: r.notes || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      proof: r.proof_type ? {
        type: r.proof_type,
        referenceNumber: r.proof_ref,
        fileName: r.proof_file,
        note: r.proof_note,
        attachedAt: r.proof_attached_at ? new Date(r.proof_attached_at).toISOString().split('T')[0] : '',
        isSelfReported: true
      } : null
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save / update obligation in MySQL
app.post('/api/obligations', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'MySQL Database not connected' });
  const ob = req.body;
  const id = ob.id || 'ob-in-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

  try {
    const sql = `
      INSERT INTO obligations (id, title, category, provider, amount, due_date, status, consequence_severity, consequence_note, prerequisite_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        category = VALUES(category),
        provider = VALUES(provider),
        amount = VALUES(amount),
        due_date = VALUES(due_date),
        status = VALUES(status),
        consequence_severity = VALUES(consequence_severity),
        consequence_note = VALUES(consequence_note),
        prerequisite_id = VALUES(prerequisite_id),
        notes = VALUES(notes);
    `;

    await pool.query(sql, [
      id,
      ob.title,
      ob.category,
      ob.provider || '',
      ob.amount || 0,
      ob.dueDate || null,
      ob.status || 'Pending',
      ob.consequenceSeverity || 'medium',
      ob.consequenceNote || '',
      ob.prerequisiteId || null,
      ob.notes || ''
    ]);

    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE obligation from MySQL
app.delete('/api/obligations/:id', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'MySQL Database not connected' });
  try {
    await pool.query('DELETE FROM obligations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST status update & proof attach in MySQL
app.post('/api/obligations/:id/status', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'MySQL Database not connected' });
  const { status, proof } = req.body;
  const { id } = req.params;

  try {
    await pool.query('UPDATE obligations SET status = ? WHERE id = ?', [status, id]);

    if (proof) {
      const proofId = 'prf-' + Date.now();
      await pool.query(`
        INSERT INTO proofs (id, obligation_id, type, reference_number, file_name, note, attached_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          type = VALUES(type),
          reference_number = VALUES(reference_number),
          file_name = VALUES(file_name),
          note = VALUES(note),
          attached_at = VALUES(attached_at);
      `, [
        proofId,
        id,
        proof.type || 'reference_note',
        proof.referenceNumber || '',
        proof.fileName || '',
        proof.note || '',
        proof.attachedAt || new Date().toISOString().split('T')[0]
      ]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Aegis LifeOps Express Server running on http://localhost:${PORT}`);
  });
});
