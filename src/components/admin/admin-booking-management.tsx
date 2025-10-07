'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  CalendarPlus, 
  CalendarIcon,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface User {
  user_id: string;
  email: string;
  display_name: string | null;
}

interface Booking {
  id: string;
  requester_id: string;
  status: string;
  start_ts: string;
  end_ts: string;
  title: string | null;
  notes: string | null;
  bedroom_count: number;
  created_at: string;
  user?: {
    display_name: string | null;
    email: string;
  };
  profiles?: {
    display_name: string | null;
    email: string;
  };
}

export function AdminBookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    title: '',
    notes: '',
    bedroomCount: 4,
    userId: '',
    status: 'APPROVED'
  });
  const [capacityInfo, setCapacityInfo] = useState<{
    activeBedrooms: number;
    maxBedrooms: number;
    availableBedrooms: number;
    totalBookings: number;
  } | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      await fetchUsers();
      await fetchBookings();
      await fetchCapacityInfo();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      fetchBookings();
      // Set default user to the first user if none selected
      if (!createForm.userId && users[0]) {
        setCreateForm(prev => ({
          ...prev,
          userId: users[0].user_id
        }));
      }
    }
  }, [users]);

  const fetchCapacityInfo = async () => {
    try {
      const response = await fetch('/api/admin/capacity');
      if (response.ok) {
        const data = await response.json();
        setCapacityInfo({
          activeBedrooms: data.activeBedrooms,
          maxBedrooms: data.maxBedrooms,
          availableBedrooms: data.availableBedrooms,
          totalBookings: data.totalBookings
        });
      }
    } catch (error) {
      console.error('Error fetching capacity info:', error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        // Enrich bookings with user data
        const enrichedBookings = data.bookings.map((booking: Booking) => {
          const user = users.find(u => u.user_id === booking.requester_id);
          return {
            ...booking,
            user: user ? {
              display_name: user.display_name,
              email: user.email
            } : null
          };
        });
        setBookings(enrichedBookings);
      } else {
        toast.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateBooking = async () => {
    if (!createForm.startDate || !createForm.endDate || !createForm.userId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_ts: createForm.startDate.toISOString(),
          end_ts: createForm.endDate.toISOString(),
          title: createForm.title || 'Admin Created Booking',
          notes: createForm.notes || null,
          bedroom_count: createForm.bedroomCount,
          user_id: createForm.userId,
          status: createForm.status
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show more detailed error message
        const errorMessage = data.details || data.error || 'Failed to create booking';
        throw new Error(errorMessage);
      }

      toast.success('Booking created successfully');
      setShowCreateDialog(false);
      setCreateForm({
        startDate: undefined,
        endDate: undefined,
        title: '',
        notes: '',
        bedroomCount: 4,
        userId: users[0]?.user_id || '',
        status: 'APPROVED'
      });
      fetchBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Booking approved successfully');
        fetchBookings();
      } else {
        const error = await response.json();
        // Show more detailed error message for bedroom capacity issues
        if (error.error && error.error.includes('bedroom capacity')) {
          toast.error(`Cannot approve: ${error.error}. Check bedroom allocation.`);
        } else {
          toast.error(`Failed to approve booking: ${error.error}`);
        }
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Booking rejected successfully');
        fetchBookings();
      } else {
        const error = await response.json();
        toast.error(`Failed to reject booking: ${error.error}`);
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    }
  };

  const handleDeleteBooking = async (bookingId: string, bookingTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to PERMANENTLY DELETE the booking "${bookingTitle}"?\n\nThis action cannot be undone and will remove all booking data from the database.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchBookings();
        fetchCapacityInfo(); // Refresh capacity info
      } else {
        const error = await response.json();
        toast.error(`Failed to delete booking: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'HOLD':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'BLOCKED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'HOLD':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Booking Management
          </h2>
          <p className="text-gray-600 mt-1">Manage all bookings and create new ones for users</p>
          {capacityInfo && (
            <div className="mt-2 space-y-2">
              {/* Current Status */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                capacityInfo.availableBedrooms > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  capacityInfo.availableBedrooms > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {capacityInfo.availableBedrooms > 0 
                  ? `${capacityInfo.availableBedrooms} bedroom${capacityInfo.availableBedrooms !== 1 ? 's' : ''} free today`
                  : 'No bedrooms available today'
                }
              </div>
              
              {/* Detailed Info */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>
                    {capacityInfo.activeBedrooms}/{capacityInfo.maxBedrooms} bedrooms in use today
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>
                    {capacityInfo.totalBookings} total bookings
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4" />
              Create Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Booking for User</DialogTitle>
              <DialogDescription>
                Create a new booking and assign it to a user
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-select">Assign to User</Label>
                <Select value={createForm.userId} onValueChange={(value) => setCreateForm({ ...createForm, userId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.display_name || user.email} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !createForm.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {createForm.startDate ? format(createForm.startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={createForm.startDate}
                        onSelect={(date) => setCreateForm({ ...createForm, startDate: date })}
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
                          !createForm.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {createForm.endDate ? format(createForm.endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={createForm.endDate}
                        onSelect={(date) => setCreateForm({ ...createForm, endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g., Family Vacation"
                />
              </div>

              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Select value={createForm.bedroomCount.toString()} onValueChange={(value) => setCreateForm({ ...createForm, bedroomCount: parseInt(value) })}>
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
                <Label htmlFor="status">Status</Label>
                <Select value={createForm.status} onValueChange={(value) => setCreateForm({ ...createForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="HOLD">Hold</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateBooking}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Booking'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Requests - Prominent Section */}
      {bookings.filter(b => b.status === 'PENDING').length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Pending Booking Requests ({bookings.filter(b => b.status === 'PENDING').length})
            </CardTitle>
            <CardDescription className="text-yellow-700">
              These booking requests need your review and approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.filter(b => b.status === 'PENDING').map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-white">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.title || 'Untitled Booking'}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <User className="h-3 w-3" />
                        <span>{booking.profiles?.display_name || booking.profiles?.email || booking.user?.display_name || booking.user?.email || 'Unknown User'}</span>
                        <span>•</span>
                        <span>{format(new Date(booking.start_ts), 'MMM dd')} - {format(new Date(booking.end_ts), 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span>{booking.bedroom_count} bedroom{booking.bedroom_count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveBooking(booking.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectBooking(booking.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            All Bookings
          </CardTitle>
          <CardDescription>
            Manage all booking requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarPlus className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No bookings found</h3>
              <p className="text-gray-500">Create your first booking to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(booking.status)}
                    <div>
                      <h3 className="font-semibold">
                        {booking.title || 'Untitled Booking'}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <User className="h-3 w-3" />
                        <span>{booking.profiles?.display_name || booking.profiles?.email || booking.user?.display_name || booking.user?.email || 'Unknown User'}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(new Date(booking.start_ts), 'MMM dd')} - {format(new Date(booking.end_ts), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.bedroom_count} bedroom{booking.bedroom_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveBooking(booking.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectBooking(booking.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBooking(booking.id, booking.title || 'Untitled Booking')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        title="Permanently delete this booking"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
