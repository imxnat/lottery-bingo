-- Create the 'purchases' table
CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    tickets JSONB NOT NULL,
    total_cost NUMERIC(10, 2) NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference_id TEXT UNIQUE NOT NULL,
    payment_status JSONB DEFAULT '{}'::jsonb,
    hold_expiry TIMESTAMP WITH TIME ZONE
);

-- Create the 'held_tickets' table
CREATE TABLE IF NOT EXISTS held_tickets (
    ticket_number INTEGER PRIMARY KEY,
    hold_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reference_id TEXT NOT NULL,
    is_confirmed BOOLEAN DEFAULT FALSE,
    hold_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (reference_id) REFERENCES purchases(reference_id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_reference_id ON purchases (reference_id);
CREATE INDEX IF NOT EXISTS idx_held_tickets_hold_expiry ON held_tickets (hold_expiry);
CREATE INDEX IF NOT EXISTS idx_held_tickets_reference_id ON held_tickets (reference_id);
