-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES templates(id),
    sender_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    original_file_url TEXT NOT NULL,
    signed_file_url TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    message TEXT,
    expiration_date DATE,
    sent_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON documents(template_id);
CREATE INDEX IF NOT EXISTS idx_documents_sender_id ON documents(sender_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Create document recipients table
CREATE TABLE IF NOT EXISTS document_recipients (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    signing_order INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending',
    access_token VARCHAR(255) UNIQUE NOT NULL,
    viewed_at TIMESTAMP,
    signed_at TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recipients_document_id ON document_recipients(document_id);
CREATE INDEX IF NOT EXISTS idx_recipients_access_token ON document_recipients(access_token);
CREATE INDEX IF NOT EXISTS idx_recipients_status ON document_recipients(status);
