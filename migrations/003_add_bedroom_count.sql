-- Add bedroom_count column to bookings table
ALTER TABLE bookings ADD COLUMN bedroom_count INTEGER NOT NULL DEFAULT 1 CHECK (bedroom_count >= 1 AND bedroom_count <= 4);

-- Add bedroom_count column to visits table
ALTER TABLE visits ADD COLUMN bedroom_count INTEGER NOT NULL DEFAULT 1 CHECK (bedroom_count >= 1 AND bedroom_count <= 4);

-- Create an immutable function for creating timestamp ranges
CREATE OR REPLACE FUNCTION create_timestamp_range(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ)
RETURNS TSRANGE AS $$
BEGIN
  RETURN tsrange(start_ts::timestamp, end_ts::timestamp);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the existing constraint to include bedroom_count in the exclusion
-- First drop the existing constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;

-- Add new constraint that considers bedroom_count
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap 
EXCLUDE USING gist (
  create_timestamp_range(start_ts, end_ts) WITH &&,
  status WITH =
) WHERE (status IN ('APPROVED', 'HOLD', 'BLOCKED'));

-- Add a function to check total bedroom capacity
CREATE OR REPLACE FUNCTION check_bedroom_capacity(
  p_start_ts TIMESTAMPTZ,
  p_end_ts TIMESTAMPTZ,
  p_bedroom_count INTEGER,
  p_booking_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  total_bedrooms INTEGER;
BEGIN
  -- Get total bedrooms already booked for the time period
  SELECT COALESCE(SUM(bedroom_count), 0) INTO total_bedrooms
  FROM bookings 
  WHERE status IN ('APPROVED', 'HOLD', 'BLOCKED')
    AND create_timestamp_range(start_ts, end_ts) && create_timestamp_range(p_start_ts, p_end_ts)
    AND (p_booking_id IS NULL OR id != p_booking_id);
  
  -- Check if adding this booking would exceed 4 bedrooms
  RETURN (total_bedrooms + p_bedroom_count) <= 4;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to check bedroom capacity before insert/update
CREATE OR REPLACE FUNCTION trigger_check_bedroom_capacity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check for APPROVED, HOLD, and BLOCKED bookings
  IF NEW.status IN ('APPROVED', 'HOLD', 'BLOCKED') THEN
    IF NOT check_bedroom_capacity(NEW.start_ts, NEW.end_ts, NEW.bedroom_count, NEW.id) THEN
      RAISE EXCEPTION 'Booking would exceed maximum bedroom capacity of 4. Current total: %', 
        (SELECT COALESCE(SUM(bedroom_count), 0) FROM bookings 
         WHERE status IN ('APPROVED', 'HOLD', 'BLOCKED')
           AND create_timestamp_range(start_ts, end_ts) && create_timestamp_range(NEW.start_ts, NEW.end_ts)
           AND id != NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS check_bedroom_capacity_trigger ON bookings;
CREATE TRIGGER check_bedroom_capacity_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_bedroom_capacity();
