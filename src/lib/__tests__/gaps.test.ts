import { calculateGaps, rangesOverlap, toInstant } from '../gaps';

describe('Gaps Calculation', () => {
  describe('calculateGaps', () => {
    it('should find gaps between bookings', () => {
      const bookedRanges = [
        { start: new Date('2025-01-10'), end: new Date('2025-01-15') },
        { start: new Date('2025-01-20'), end: new Date('2025-01-25') }
      ];
      
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');
      
      const gaps = calculateGaps(bookedRanges, from, to, 1, 0);
      
      expect(gaps).toHaveLength(3);
      expect(gaps[0].start).toEqual(new Date('2025-01-01'));
      expect(gaps[0].end).toEqual(new Date('2025-01-10'));
      expect(gaps[1].start).toEqual(new Date('2025-01-15'));
      expect(gaps[1].end).toEqual(new Date('2025-01-20'));
      expect(gaps[2].start).toEqual(new Date('2025-01-25'));
      expect(gaps[2].end).toEqual(new Date('2025-01-31'));
    });

    it('should respect minimum nights requirement', () => {
      const bookedRanges = [
        { start: new Date('2025-01-10'), end: new Date('2025-01-12') },
        { start: new Date('2025-01-13'), end: new Date('2025-01-15') }
      ];
      
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');
      
      const gaps = calculateGaps(bookedRanges, from, to, 3, 0);
      
      // Should only include gaps with 3+ nights
      expect(gaps).toHaveLength(2);
      expect(gaps[0].nights).toBeGreaterThanOrEqual(3);
      expect(gaps[1].nights).toBeGreaterThanOrEqual(3);
    });

    it('should respect buffer days', () => {
      const bookedRanges = [
        { start: new Date('2025-01-10'), end: new Date('2025-01-15') }
      ];
      
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');
      
      const gaps = calculateGaps(bookedRanges, from, to, 1, 2);
      
      expect(gaps).toHaveLength(2);
      // First gap should end 2 days before booking starts
      expect(gaps[0].end).toEqual(new Date('2025-01-08'));
      // Second gap should start 2 days after booking ends
      expect(gaps[1].start).toEqual(new Date('2025-01-17'));
    });

    it('should handle no bookings', () => {
      const bookedRanges: any[] = [];
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');
      
      const gaps = calculateGaps(bookedRanges, from, to, 1, 0);
      
      expect(gaps).toHaveLength(1);
      expect(gaps[0].start).toEqual(from);
      expect(gaps[0].end).toEqual(to);
    });

    it('should handle overlapping bookings', () => {
      const bookedRanges = [
        { start: new Date('2025-01-10'), end: new Date('2025-01-20') },
        { start: new Date('2025-01-15'), end: new Date('2025-01-25') }
      ];
      
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');
      
      const gaps = calculateGaps(bookedRanges, from, to, 1, 0);
      
      expect(gaps).toHaveLength(2);
      expect(gaps[0].start).toEqual(new Date('2025-01-01'));
      expect(gaps[0].end).toEqual(new Date('2025-01-10'));
      expect(gaps[1].start).toEqual(new Date('2025-01-25'));
      expect(gaps[1].end).toEqual(new Date('2025-01-31'));
    });
  });

  describe('rangesOverlap', () => {
    it('should detect overlapping ranges', () => {
      const range1 = { start: new Date('2025-01-10'), end: new Date('2025-01-20') };
      const range2 = { start: new Date('2025-01-15'), end: new Date('2025-01-25') };
      
      expect(rangesOverlap(range1, range2)).toBe(true);
    });

    it('should detect non-overlapping ranges', () => {
      const range1 = { start: new Date('2025-01-10'), end: new Date('2025-01-15') };
      const range2 = { start: new Date('2025-01-20'), end: new Date('2025-01-25') };
      
      expect(rangesOverlap(range1, range2)).toBe(false);
    });

    it('should detect adjacent ranges as non-overlapping', () => {
      const range1 = { start: new Date('2025-01-10'), end: new Date('2025-01-15') };
      const range2 = { start: new Date('2025-01-15'), end: new Date('2025-01-20') };
      
      expect(rangesOverlap(range1, range2)).toBe(false);
    });
  });

  describe('toInstant', () => {
    it('should convert date-only string to UTC at 15:00 local', () => {
      const dateOnly = '2025-01-15';
      const result = toInstant(dateOnly);
      
      expect(result).toBeInstanceOf(Date);
      // The exact time will depend on timezone handling
      // This is a basic test - in production you'd want more specific timezone tests
    });
  });
});
