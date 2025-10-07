'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { 
  CalendarPlus, 
  CalendarX, 
  CalendarIcon,
  Plus,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function AdminActions() {
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [showBlockDates, setShowBlockDates] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add Visit Form State
  const [visitForm, setVisitForm] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    title: '',
    notes: '',
    bedroomCount: 1
  });

  // Block Dates Form State
  const [blockForm, setBlockForm] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    title: '',
    notes: '',
    bedroomCount: 1
  });

  const handleAddVisit = async () => {
    if (!visitForm.startDate || !visitForm.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_ts: visitForm.startDate.toISOString(),
          end_ts: visitForm.endDate.toISOString(),
          title: visitForm.title || 'House Visit',
          notes: visitForm.notes || null,
          bedroom_count: visitForm.bedroomCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule visit');
      }

      toast.success('Visit scheduled successfully');
      setShowAddVisit(false);
      setVisitForm({
        startDate: undefined,
        endDate: undefined,
        title: '',
        notes: '',
        bedroomCount: 1
      });
    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast.error('Failed to schedule visit');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDates = async () => {
    if (!blockForm.startDate || !blockForm.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/block-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_ts: blockForm.startDate.toISOString(),
          end_ts: blockForm.endDate.toISOString(),
          title: blockForm.title || 'Blocked Dates',
          notes: blockForm.notes || 'Admin blocked these dates',
          bedroom_count: blockForm.bedroomCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to block dates');
      }

      toast.success('Dates blocked successfully');
      setShowBlockDates(false);
      setBlockForm({
        startDate: undefined,
        endDate: undefined,
        title: '',
        notes: '',
        bedroomCount: 1
      });
    } catch (error) {
      console.error('Error blocking dates:', error);
      toast.error('Failed to block dates');
    } finally {
      setLoading(false);
    }
  };

  const resetVisitForm = () => {
    setVisitForm({
      startDate: undefined,
      endDate: undefined,
      title: '',
      notes: '',
      bedroomCount: 1
    });
  };

  const resetBlockForm = () => {
    setBlockForm({
      startDate: undefined,
      endDate: undefined,
      title: '',
      notes: '',
      bedroomCount: 1
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Actions
        </h2>
        <p className="text-gray-600 mt-1">Manage house visits and block unavailable dates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Visit Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-green-600" />
              Schedule House Visit
            </CardTitle>
            <CardDescription>
              Schedule a visit to the house for maintenance, cleaning, or inspection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={showAddVisit} onOpenChange={setShowAddVisit}>
              <DialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Visit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Schedule House Visit</DialogTitle>
                  <DialogDescription>
                    Schedule a visit to the house for maintenance or inspection
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !visitForm.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {visitForm.startDate ? format(visitForm.startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={visitForm.startDate}
                            onSelect={(date) => setVisitForm({ ...visitForm, startDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !visitForm.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {visitForm.endDate ? format(visitForm.endDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={visitForm.endDate}
                            onSelect={(date) => setVisitForm({ ...visitForm, endDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="visit-title">Title</Label>
                    <Input
                      id="visit-title"
                      value={visitForm.title}
                      onChange={(e) => setVisitForm({ ...visitForm, title: e.target.value })}
                      placeholder="e.g., Maintenance Visit"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="visit-bedrooms">Bedrooms to Use</Label>
                    <Select 
                      value={visitForm.bedroomCount.toString()} 
                      onValueChange={(value) => setVisitForm({ ...visitForm, bedroomCount: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3 Bedrooms</SelectItem>
                        <SelectItem value="4">4 Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="visit-notes">Notes</Label>
                    <Textarea
                      id="visit-notes"
                      value={visitForm.notes}
                      onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                      placeholder="Additional details about the visit..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleAddVisit}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? 'Scheduling...' : 'Schedule Visit'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddVisit(false);
                        resetVisitForm();
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Block Dates Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarX className="h-5 w-5 text-red-600" />
              Block Dates
            </CardTitle>
            <CardDescription>
              Block dates when the house is unavailable for bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={showBlockDates} onOpenChange={setShowBlockDates}>
              <DialogTrigger asChild>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <X className="h-4 w-4 mr-2" />
                  Block Dates
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Block Dates</DialogTitle>
                  <DialogDescription>
                    Block dates when the house is unavailable for bookings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !blockForm.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {blockForm.startDate ? format(blockForm.startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={blockForm.startDate}
                            onSelect={(date) => setBlockForm({ ...blockForm, startDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !blockForm.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {blockForm.endDate ? format(blockForm.endDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={blockForm.endDate}
                            onSelect={(date) => setBlockForm({ ...blockForm, endDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="block-title">Title</Label>
                    <Input
                      id="block-title"
                      value={blockForm.title}
                      onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
                      placeholder="e.g., Maintenance Period"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="block-bedrooms">Bedrooms to Block</Label>
                    <Select 
                      value={blockForm.bedroomCount.toString()} 
                      onValueChange={(value) => setBlockForm({ ...blockForm, bedroomCount: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3 Bedrooms</SelectItem>
                        <SelectItem value="4">4 Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="block-notes">Notes</Label>
                    <Textarea
                      id="block-notes"
                      value={blockForm.notes}
                      onChange={(e) => setBlockForm({ ...blockForm, notes: e.target.value })}
                      placeholder="Reason for blocking these dates..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleBlockDates}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      disabled={loading}
                    >
                      {loading ? 'Blocking...' : 'Block Dates'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowBlockDates(false);
                        resetBlockForm();
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
