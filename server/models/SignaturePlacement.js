const { query, getClient } = require('../config/database');

class SignaturePlacement {
  static async create(data) {
    const { templateId, fieldType, pageNumber, xPosition, yPosition, width, height, recipientRole, isRequired, fieldLabel } = data;

    const result = await query(
      'INSERT INTO signature_placements (template_id, field_type, page_number, x_position, y_position, width, height, recipient_role, is_required, field_label) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [templateId, fieldType, pageNumber, xPosition, yPosition, width, height, recipientRole, isRequired, fieldLabel]
    );
    return result.rows[0];
  }

  static async createMultiple(templateId, placements) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const insertedPlacements = [];

      for (const placement of placements) {
        const result = await client.query(
          'INSERT INTO signature_placements (template_id, field_type, page_number, x_position, y_position, width, height, recipient_role, is_required, field_label) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
          [
            templateId,
            placement.fieldType,
            placement.pageNumber,
            placement.xPosition,
            placement.yPosition,
            placement.width,
            placement.height,
            placement.recipientRole,
            placement.isRequired !== undefined ? placement.isRequired : true,
            placement.fieldLabel
          ]
        );
        insertedPlacements.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return insertedPlacements;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByTemplateId(templateId) {
    const result = await query(
      'SELECT * FROM signature_placements WHERE template_id = $1 ORDER BY page_number ASC, y_position ASC',
      [templateId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM signature_placements WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const { fieldType, pageNumber, xPosition, yPosition, width, height, recipientRole, isRequired, fieldLabel } = data;

    const result = await query(
      'UPDATE signature_placements SET field_type = $1, page_number = $2, x_position = $3, y_position = $4, width = $5, height = $6, recipient_role = $7, is_required = $8, field_label = $9 WHERE id = $10 RETURNING *',
      [fieldType, pageNumber, xPosition, yPosition, width, height, recipientRole, isRequired, fieldLabel, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await query('DELETE FROM signature_placements WHERE id = $1', [id]);
  }

  static async deleteByTemplateId(templateId) {
    await query('DELETE FROM signature_placements WHERE template_id = $1', [templateId]);
  }
}

module.exports = SignaturePlacement;
