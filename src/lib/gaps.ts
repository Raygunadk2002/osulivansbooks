export interface TimeRange {
  start: Date;
  end: Date;
}

export interface Gap {
  start: Date;
  end: Date;
  nights: number;
}

/**
 * Calculate available gaps between booked periods
 * @param bookedRanges Array of booked time ranges (APPROVED, HOLD, BLOCKED)
 * @param from Start date for gap calculation
 * @param to End date for gap calculation
 * @param minNights Minimum nights required for a gap
 * @param bufferDays Buffer days between stays
 * @returns Array of available gaps
 */
export function calculateGaps(
  bookedRanges: TimeRange[],
  from: Date,
  to: Date,
  minNights: number = 1,
  bufferDays: number = 0
): Gap[] {
  // Sort booked ranges by start date
  const sortedBooked = [...bookedRanges].sort((a, b) => a.start.getTime() - b.start.getTime());
  
  const gaps: Gap[] = [];
  let currentDate = new Date(from);
  
  // Add buffer to the end date to account for buffer days
  const endDate = new Date(to);
  endDate.setDate(endDate.getDate() + bufferDays);
  
  for (const booked of sortedBooked) {
    // If current date is before this booking starts
    if (currentDate < booked.start) {
      const gapEnd = new Date(booked.start);
      gapEnd.setDate(gapEnd.getDate() - bufferDays);
      
      // Check if this gap is long enough
      const nights = Math.ceil((gapEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights >= minNights) {
        gaps.push({
          start: new Date(currentDate),
          end: gapEnd,
          nights
        });
      }
    }
    
    // Move current date to after this booking (with buffer)
    currentDate = new Date(booked.end);
    currentDate.setDate(currentDate.getDate() + bufferDays);
    
    // If we've passed the end date, stop
    if (currentDate >= endDate) {
      break;
    }
  }
  
  // Check for gap after last booking
  if (currentDate < endDate) {
    const nights = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights >= minNights) {
      gaps.push({
        start: new Date(currentDate),
        end: new Date(to),
        nights
      });
    }
  }
  
  return gaps;
}

/**
 * Check if two time ranges overlap
 * @param range1 First time range
 * @param range2 Second time range
 * @returns True if ranges overlap
 */
export function rangesOverlap(range1: TimeRange, range2: TimeRange): boolean {
  return range1.start < range2.end && range2.start < range1.end;
}

/**
 * Convert date-only string to UTC timestamp at 15:00 local time
 * This avoids DST edge cases by normalizing to a consistent time
 * @param dateOnly Date string in YYYY-MM-DD format
 * @param timezone Target timezone (default: Europe/London)
 * @returns UTC Date object
 */
export function toInstant(dateOnly: string, timezone: string = 'Europe/London'): Date {
  // Create date at 15:00 local time to avoid DST issues
  const localDate = new Date(`${dateOnly}T15:00:00`);
  
  // For now, we'll use a simple approach since we're focusing on Europe/London
  // In production, you might want to use a library like date-fns-tz
  return localDate;
}

/**
 * Format date for display in Europe/London timezone
 * @param date UTC date
 * @returns Formatted date string
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date range for display
 * @param start Start date
 * @param end End date
 * @returns Formatted date range string
 */
export function formatDateRange(start: Date, end: Date): string {
  const startStr = formatDateForDisplay(start);
  const endStr = formatDateForDisplay(end);
  
  if (startStr === endStr) {
    return startStr;
  }
  
  return `${startStr} - ${endStr}`;
}
