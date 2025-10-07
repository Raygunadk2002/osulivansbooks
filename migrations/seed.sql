-- Insert initial settings
INSERT INTO settings (join_code, admin_claim_code) 
VALUES ('OSULL-JOIN-2025', 'OSULL-ADMIN-2025')
ON CONFLICT (id) DO NOTHING;
