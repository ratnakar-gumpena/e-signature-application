-- Create signature placements table
CREATE TABLE IF NOT EXISTS signature_placements (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
    field_type VARCHAR(50) NOT NULL,
    page_number INTEGER NOT NULL,
    x_position DECIMAL(10,2) NOT NULL,
    y_position DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    height DECIMAL(10,2) NOT NULL,
    recipient_role VARCHAR(100),
    is_required BOOLEAN DEFAULT true,
    field_label VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on template_id
CREATE INDEX IF NOT EXISTS idx_placements_template_id ON signature_placements(template_id);
