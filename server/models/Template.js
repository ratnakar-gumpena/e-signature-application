const { query } = require('../config/database');

class Template {
  static async create({ userId, name, description, fileUrl, thumbnailUrl, status = 'draft' }) {
    const result = await query(
      'INSERT INTO templates (user_id, name, description, file_url, thumbnail_url, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, name, description, fileUrl, thumbnailUrl, status]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM templates WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let queryText = 'SELECT * FROM templates WHERE user_id = $1';
    const params = [userId];
    let paramCount = 1;

    if (filters.status) {
      paramCount++;
      queryText += ` AND status = $${paramCount}`;
      params.push(filters.status);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async update(id, userId, data) {
    const { name, description, status } = data;
    const result = await query(
      'UPDATE templates SET name = $1, description = $2, status = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, description, status, id, userId]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    await query('DELETE FROM templates WHERE id = $1 AND user_id = $2', [id, userId]);
  }

  static async updateFileUrl(id, fileUrl, thumbnailUrl) {
    const result = await query(
      'UPDATE templates SET file_url = $1, thumbnail_url = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [fileUrl, thumbnailUrl, id]
    );
    return result.rows[0];
  }
}

module.exports = Template;
