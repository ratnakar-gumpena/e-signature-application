const { query, getClient } = require('../config/database');

class Signature {
  static async create({ documentId, recipientId, placementId, signatureData, value }) {
    const result = await query(
      'INSERT INTO signatures (document_id, recipient_id, placement_id, signature_data, value) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [documentId, recipientId, placementId, signatureData, value]
    );
    return result.rows[0];
  }

  static async createMultiple(signatures) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const insertedSignatures = [];

      for (const sig of signatures) {
        const result = await client.query(
          'INSERT INTO signatures (document_id, recipient_id, placement_id, signature_data, value) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [sig.documentId, sig.recipientId, sig.placementId, sig.signatureData, sig.value]
        );
        insertedSignatures.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return insertedSignatures;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByDocumentId(documentId) {
    const result = await query(
      `SELECT s.*, sp.field_type, sp.page_number, sp.x_position, sp.y_position, sp.width, sp.height,
        dr.name as recipient_name, dr.email as recipient_email
       FROM signatures s
       LEFT JOIN signature_placements sp ON s.placement_id = sp.id
       LEFT JOIN document_recipients dr ON s.recipient_id = dr.id
       WHERE s.document_id = $1
       ORDER BY sp.page_number ASC, sp.y_position ASC`,
      [documentId]
    );
    return result.rows;
  }

  static async findByRecipientId(recipientId) {
    const result = await query(
      'SELECT s.*, sp.field_type, sp.field_label FROM signatures s LEFT JOIN signature_placements sp ON s.placement_id = sp.id WHERE s.recipient_id = $1',
      [recipientId]
    );
    return result.rows;
  }

  static async delete(id) {
    await query('DELETE FROM signatures WHERE id = $1', [id]);
  }
}

module.exports = Signature;
