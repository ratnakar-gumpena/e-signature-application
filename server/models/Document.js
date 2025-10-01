const { query, getClient } = require('../config/database');

class Document {
  static async create({ templateId, senderId, title, originalFileUrl, message, expirationDate }) {
    const result = await query(
      'INSERT INTO documents (template_id, sender_id, title, original_file_url, message, expiration_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [templateId, senderId, title, originalFileUrl, message, expirationDate, 'draft']
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM documents WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let queryText = `
      SELECT d.*,
        u.name as sender_name,
        u.email as sender_email,
        COUNT(DISTINCT dr.id) as total_recipients,
        COUNT(DISTINCT CASE WHEN dr.status = 'completed' THEN dr.id END) as signed_recipients
      FROM documents d
      LEFT JOIN users u ON d.sender_id = u.id
      LEFT JOIN document_recipients dr ON d.id = dr.document_id
      WHERE d.sender_id = $1
    `;
    const params = [userId];
    let paramCount = 1;

    if (filters.status) {
      paramCount++;
      queryText += ` AND d.status = $${paramCount}`;
      params.push(filters.status);
    }

    queryText += ' GROUP BY d.id, u.name, u.email ORDER BY d.created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async findReceivedByEmail(email, filters = {}) {
    let queryText = `
      SELECT d.*, dr.id as recipient_id, dr.name as recipient_name, dr.email as recipient_email,
        dr.status as recipient_status, dr.access_token, dr.viewed_at, dr.signed_at,
        u.name as sender_name, u.email as sender_email
      FROM documents d
      INNER JOIN document_recipients dr ON d.id = dr.document_id
      LEFT JOIN users u ON d.sender_id = u.id
      WHERE dr.email = $1
    `;
    const params = [email];
    let paramCount = 1;

    if (filters.status) {
      paramCount++;
      queryText += ` AND dr.status = $${paramCount}`;
      params.push(filters.status);
    }

    queryText += ' ORDER BY d.created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const updates = { status, updated_at: 'NOW()' };

    if (status === 'sent') {
      updates.sent_at = 'NOW()';
    } else if (status === 'completed') {
      updates.completed_at = 'NOW()';
    }

    const result = await query(
      `UPDATE documents SET status = $1, ${status === 'sent' ? 'sent_at = NOW(),' : ''} ${status === 'completed' ? 'completed_at = NOW(),' : ''} updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }

  static async updateSignedFileUrl(id, signedFileUrl) {
    const result = await query(
      'UPDATE documents SET signed_file_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [signedFileUrl, id]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    await query('DELETE FROM documents WHERE id = $1 AND sender_id = $2', [id, userId]);
  }

  static async addRecipients(documentId, recipients) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const insertedRecipients = [];

      for (const recipient of recipients) {
        const result = await client.query(
          'INSERT INTO document_recipients (document_id, name, email, role, signing_order, access_token) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [documentId, recipient.name, recipient.email, recipient.role, recipient.signing_order, recipient.access_token]
        );
        insertedRecipients.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return insertedRecipients;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getRecipients(documentId) {
    const result = await query(
      'SELECT * FROM document_recipients WHERE document_id = $1 ORDER BY signing_order ASC',
      [documentId]
    );
    return result.rows;
  }

  static async getRecipientByToken(token) {
    const result = await query(
      'SELECT dr.*, d.* FROM document_recipients dr INNER JOIN documents d ON dr.document_id = d.id WHERE dr.access_token = $1',
      [token]
    );
    return result.rows[0];
  }

  static async updateRecipientStatus(recipientId, status, ipAddress = null) {
    let queryText = 'UPDATE document_recipients SET status = $1';
    const params = [status, recipientId];
    let paramCount = 2;

    if (status === 'viewed' || status === 'completed') {
      paramCount++;
      queryText += status === 'viewed' ? `, viewed_at = NOW()` : `, signed_at = NOW()`;
    }

    if (ipAddress) {
      paramCount++;
      queryText += `, ip_address = $${paramCount}`;
      params.splice(2, 0, ipAddress);
    }

    queryText += ` WHERE id = $${paramCount} RETURNING *`;

    const result = await query(queryText, params);
    return result.rows[0];
  }
}

module.exports = Document;
