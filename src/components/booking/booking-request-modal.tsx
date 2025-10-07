'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatDateForDisplay } from '@/lib/gaps';
import { Bed } from 'lucide-react';

interface BookingRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate?: Date;
  endDate?: Date;
  onSuccess?: () => void;
}

export function BookingRequestModal({ 
  open, 
  onOpenChange, 
  startDate, 
  endDate, 
  onSuccess 
}: BookingRequestModalProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [bedroomCount, setBedroomCount] = useState(4);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateStr = startDate?.toISOString().split('T')[0];
      const endDateStr = endDate?.toISOString().split('T')[0];

      if (!startDateStr || !endDateStr) {
        throw new Error('Invalid date selection');
      }

      const response = await fetch('/api/bookings/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_ts: startDateStr,
          end_ts: endDateStr,
          title: title || null,
          notes: notes || null,
          bedroom_count: bedroomCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking request');
      }

      toast.success('Booking request submitted successfully!');
      setTitle('');
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit booking request');
      console.error('Booking request error:', error);
    } finally {
      setLoading(false);
    }
  };

  const nights = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Booking</DialogTitle>
          <DialogDescription>
            Request a booking for {startDate && endDate && (
              <>
                {formatDateForDisplay(startDate)} to {formatDateForDisplay(endDate)}
                {nights > 0 && ` (${nights} night${nights !== 1 ? 's' : ''})`}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Family vacation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedroom_count">Number of Bedrooms</Label>
            <Select value={bedroomCount.toString()} onValueChange={(value) => setBedroomCount(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4">4 Bedrooms</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              <Bed className="inline h-3 w-3 mr-1" />
              Choose fewer bedrooms to allow others to book simultaneously. Maximum 4 bedrooms total in the house.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
