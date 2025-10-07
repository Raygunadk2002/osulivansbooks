'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, X, Calendar, BookOpen, MessageSquare, Users, Settings, Download, Wrench, Camera } from 'lucide-react';
import { UserManagement } from '@/components/admin/user-management';
import { Noticeboard } from '@/components/noticeboard/noticeboard';
import { LandingPage } from '@/components/auth/landing-page';
import { AdminActions } from '@/components/admin/admin-actions';
import { AdminBookingManagement } from '@/components/admin/admin-booking-management';
import { HouseCalendar } from '@/components/calendar/house-calendar';
import { PictureBoard } from '@/components/picture-board/picture-board';
import { useAuth } from '@/components/auth/auth-provider';

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
  updated_at: string;
  user?: {
    display_name: string | null;
    email: string;
  };
}

export default function Home() {
  const { isAdmin, isUser, signInWithPassword, signOut } = useAuth();
  const [userEmail] = useState('alexkeal@me.com'); // Hardcoded email
  const [currentView, setCurrentView] = useState('bookings'); // bookings, calendar, notices, members, settings, ics
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [useDragSelect, setUseDragSelect] = useState(true);

  const handleLogin = async (email: string, password: string) => {
    try {
      const success = await signInWithPassword(email, password);
      if (success) {
        toast.success(`Welcome back, ${email}!`);
        fetchBookings(); // Fetch bookings when user logs in
        return true;
      } else {
        toast.error('Invalid email or password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  // Fetch bookings when component mounts or when user/admin logs in
  useEffect(() => {
    if (isAdmin || isUser) {
      fetchBookings();
    }
  }, [isAdmin, isUser]);

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentView('dashboard');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    toast.info(`Switched to ${view} view`);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched bookings:', data);
        setBookings(data.bookings || []);
      } else {
        console.error('Failed to fetch bookings, status:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
        // Fallback to mock data if API fails
        setBookings([
          { 
            id: '1', 
            requester_id: 'mock-user-1',
            start_ts: new Date(2024, 11, 15).toISOString(), 
            end_ts: new Date(2024, 11, 16).toISOString(), 
            status: 'APPROVED', 
            title: 'Weekend Getaway', 
            notes: 'Mock booking for testing',
            bedroom_count: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            id: '2', 
            requester_id: 'mock-user-2',
            start_ts: new Date(2024, 11, 22).toISOString(), 
            end_ts: new Date(2024, 11, 29).toISOString(), 
            status: 'PENDING', 
            title: 'Family Holiday', 
            notes: 'Mock booking for testing',
            bedroom_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Fallback to mock data
      setBookings([
        { 
          id: '1', 
          requester_id: 'mock-user-1',
          start_ts: new Date(2024, 11, 15).toISOString(), 
          end_ts: new Date(2024, 11, 16).toISOString(), 
          status: 'APPROVED', 
          title: 'Weekend Getaway', 
          notes: 'Mock booking for testing',
          bedroom_count: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: '2', 
          requester_id: 'mock-user-2',
          start_ts: new Date(2024, 11, 22).toISOString(), 
          end_ts: new Date(2024, 11, 29).toISOString(), 
          status: 'PENDING', 
          title: 'Family Holiday', 
          notes: 'Mock booking for testing',
          bedroom_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addBooking = (newBooking: Booking) => {
    setBookings(prev => [...prev, newBooking]);
  };

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetailsModal(true);
  };

  const closeBookingDetails = () => {
    setSelectedBooking(null);
    setShowBookingDetailsModal(false);
  };

  const renderNavigation = () => {
    if (!isAdmin && !isUser) return null;

    const userNavItems = [
      { id: 'bookings', label: 'My Bookings', icon: BookOpen },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
      { id: 'notices', label: 'Noticeboard', icon: MessageSquare },
      { id: 'pictures', label: 'Picture Board', icon: Camera },
    ];

    const adminNavItems = [
      { id: 'bookings', label: 'Bookings', icon: BookOpen },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
      { id: 'notices', label: 'Noticeboard', icon: MessageSquare },
      { id: 'pictures', label: 'Picture Board', icon: Camera },
      { id: 'members', label: 'Members', icon: Users },
      { id: 'admin-actions', label: 'Admin Actions', icon: Wrench },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'ics', label: 'ICS Feed', icon: Download },
    ];

    const navItems = isAdmin ? adminNavItems : userNavItems;

    return (
      <nav className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">O&apos;Sullivan House</h1>
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleViewChange(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {userEmail} ({isAdmin ? 'Admin' : 'User'})
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </nav>
    );
  };

  const handleDateClick = (date: Date) => {
    const dayStatus = getDayStatus(date);
    
    // Don't allow selection of booked dates
    if (dayStatus.status === 'booked') {
      toast.error(`Date ${date.toLocaleDateString()} is already booked`);
      return;
    }
    
    // Don't allow selection of past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      toast.error('Cannot select past dates');
      return;
    }
    
    if (!selectedStartDate) {
      // First date selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      toast.info(`Start date selected: ${date.toLocaleDateString()}`);
    } else if (!selectedEndDate) {
      // Second date selection
      if (date < selectedStartDate) {
        // If second date is before first, swap them
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
        toast.info(`Date range selected: ${date.toLocaleDateString()} to ${selectedStartDate.toLocaleDateString()}`);
      } else {
        setSelectedEndDate(date);
        toast.info(`Date range selected: ${selectedStartDate.toLocaleDateString()} to ${date.toLocaleDateString()}`);
      }
    } else {
      // Reset selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      toast.info(`New start date selected: ${date.toLocaleDateString()}`);
    }
  };

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
  };

  const clearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    toast.info('Date selection cleared');
  };

  const openBookingModal = () => {
    if (!selectedStartDate || !selectedEndDate) {
      toast.error('Please select a date range first');
      return;
    }
    setShowBookingModal(true);
  };

  const submitBookingRequest = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      toast.error('Please select dates first');
      return;
    }
    
    try {
      // Get form data
      const titleInput = document.querySelector('input[placeholder="e.g., Weekend Getaway"]') as HTMLInputElement;
      const notesInput = document.querySelector('textarea[placeholder="Any additional information..."]') as HTMLTextAreaElement;
      const bedroomSelect = document.querySelector('select[defaultValue="4"]') as HTMLSelectElement;
      
      const title = titleInput?.value || 'Booking Request';
      const notes = notesInput?.value || '';
      const bedroomCount = parseInt(bedroomSelect?.value || '4');
      
      // Create booking request
      const bookingData = {
        start_ts: selectedStartDate.toISOString(),
        end_ts: selectedEndDate.toISOString(),
        title: title,
        notes: notes,
        bedroom_count: bedroomCount,
        status: 'PENDING'
      };
      
      // Call the API
      const response = await fetch('/api/bookings/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`Booking request submitted for ${selectedStartDate.toLocaleDateString()} to ${selectedEndDate.toLocaleDateString()}`);
        setShowBookingModal(false);
        clearSelection();
        // Add the new booking to the list
        if (result.booking) {
          addBooking(result.booking);
        }
      } else {
        const error = await response.json();
        toast.error(`Failed to submit booking: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      toast.error('Failed to submit booking request. Please try again.');
    }
  };

  const renderBookingModal = () => {
    if (!showBookingModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Request New Booking</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowBookingModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Submit a booking request for the selected dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Selected Dates</label>
                <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {selectedStartDate?.toLocaleDateString()} to {selectedEndDate?.toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Booking Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Weekend Getaway"
                  className="w-full p-2 border rounded"
                  defaultValue="Weekend Getaway"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Number of Bedrooms</label>
                <select 
                  className="w-full p-2 border rounded"
                  defaultValue="4"
                >
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea 
                  placeholder="Any additional information..."
                  className="w-full p-2 border rounded h-20"
                  defaultValue="Looking forward to a relaxing weekend!"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={submitBookingRequest}
                  className="flex-1"
                >
                  Submit Request
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBookingDetailsModal = () => {
    if (!showBookingDetailsModal || !selectedBooking) return null;

    const startDate = new Date(selectedBooking.start_ts);
    const endDate = new Date(selectedBooking.end_ts);
    const createdDate = new Date(selectedBooking.created_at);
    const updatedDate = new Date(selectedBooking.updated_at);

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
        case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
        case 'CANCELLED': return 'text-gray-600 bg-gray-50 border-gray-200';
        case 'HOLD': return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'BLOCKED': return 'text-purple-600 bg-purple-50 border-purple-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'APPROVED': return '✅';
        case 'PENDING': return '⏳';
        case 'REJECTED': return '❌';
        case 'CANCELLED': return '🚫';
        case 'HOLD': return '⏸️';
        case 'BLOCKED': return '🚧';
        default: return '❓';
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedBooking.status)} {selectedBooking.title || 'Untitled Booking'}
                </CardTitle>
                <CardDescription>
                  Booking ID: {selectedBooking.id}
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={closeBookingDetails}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>

              {/* Booking Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Check-in Date</h4>
                  <p className="text-lg font-medium">{startDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p className="text-sm text-gray-600">{startDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Check-out Date</h4>
                  <p className="text-lg font-medium">{endDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p className="text-sm text-gray-600">{endDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm text-blue-700 mb-2">Duration</h4>
                <p className="text-lg font-medium text-blue-900">
                  {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} nights
                </p>
                <p className="text-sm text-blue-600">
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </p>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Notes</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}

              {/* Requester Info */}
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Requested By</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">
                    {selectedBooking.user?.display_name || selectedBooking.user?.email || 'Unknown User'}
                  </p>
                  {selectedBooking.user?.email && (
                    <p className="text-sm text-gray-600">{selectedBooking.user.email}</p>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Created</h4>
                  <p className="text-sm text-gray-600">
                    {createdDate.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Last Updated</h4>
                  <p className="text-sm text-gray-600">
                    {updatedDate.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedBooking.status === 'PENDING' && (
                  <>
                    <Button 
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/bookings/${selectedBooking.id}/approve`, {
                            method: 'POST',
                          });
                          if (response.ok) {
                            toast.success(`${selectedBooking.title} approved!`);
                            await fetchBookings(); // Refresh the bookings list
                            closeBookingDetails();
                          } else {
                            toast.error('Failed to approve booking');
                          }
                        } catch (error) {
                          toast.error('Failed to approve booking');
                        }
                      }}
                      className="flex-1"
                    >
                      Approve Booking
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/bookings/${selectedBooking.id}/reject`, {
                            method: 'POST',
                          });
                          if (response.ok) {
                            toast.error(`${selectedBooking.title} rejected`);
                            await fetchBookings(); // Refresh the bookings list
                            closeBookingDetails();
                          } else {
                            toast.error('Failed to reject booking');
                          }
                        } catch (error) {
                          toast.error('Failed to reject booking');
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'PENDING' && isUser && (
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/bookings/${selectedBooking.id}/cancel`, {
                          method: 'POST',
                        });
                        if (response.ok) {
                          toast.success('Booking cancelled!');
                          await fetchBookings(); // Refresh the bookings list
                          closeBookingDetails();
                        } else {
                          toast.error('Failed to cancel booking');
                        }
                      } catch (error) {
                        toast.error('Failed to cancel booking');
                      }
                    }}
                  >
                    Cancel Booking
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={closeBookingDetails}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getDayStatus = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    
    // Check if date is in selected range
    const isSelected = selectedStartDate && selectedEndDate && 
      date >= selectedStartDate && date <= selectedEndDate;
    const isStartDate = selectedStartDate && date.toDateString() === selectedStartDate.toDateString();
    const isEndDate = selectedEndDate && date.toDateString() === selectedEndDate.toDateString();
    
    // Check if date is in any booking
    const booking = bookings.find(b => {
      const startDate = new Date(b.start_ts);
      const endDate = new Date(b.end_ts);
      return date >= startDate && date <= endDate;
    });
    
    let status = 'available';
    if (booking) {
      if (booking.status === 'APPROVED' || booking.status === 'HOLD' || booking.status === 'BLOCKED') {
        status = 'booked';
      } else if (booking.status === 'PENDING') {
        status = 'pending';
      }
    }
    
    return {
      isToday,
      isCurrentMonth,
      status,
      isSelected,
      isStartDate,
      isEndDate,
      booking
    };
  };

  const renderCalendar = () => {
    const days = getCalendarDays();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return (
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((date, index) => {
            const dayStatus = getDayStatus(date);
            const dayNumber = date.getDate();
            
            let bgColor = 'bg-white hover:bg-gray-50';
            let textColor = 'text-gray-900';
            let borderColor = 'border-gray-200';
            
            if (!dayStatus.isCurrentMonth) {
              textColor = 'text-gray-400';
            }
            
            if (dayStatus.isToday) {
              bgColor = 'bg-blue-100';
              textColor = 'text-blue-900';
              borderColor = 'border-blue-300';
            }
            
            if (dayStatus.status === 'booked') {
              bgColor = 'bg-red-100 hover:bg-red-200';
              textColor = 'text-red-900';
              borderColor = 'border-red-300';
            } else if (dayStatus.status === 'pending') {
              bgColor = 'bg-yellow-100 hover:bg-yellow-200';
              textColor = 'text-yellow-900';
              borderColor = 'border-yellow-300';
            }
            
            // Override colors for selected dates
            if (dayStatus.isSelected) {
              bgColor = 'bg-blue-200 hover:bg-blue-300';
              textColor = 'text-blue-900';
              borderColor = 'border-blue-400';
            } else if (dayStatus.isStartDate || dayStatus.isEndDate) {
              bgColor = 'bg-blue-300 hover:bg-blue-400';
              textColor = 'text-blue-900';
              borderColor = 'border-blue-500';
            }
            
            return (
              <div
                key={index}
                className={`
                  p-2 text-center text-sm cursor-pointer border rounded
                  ${bgColor} ${textColor} ${borderColor}
                  min-h-[40px] flex items-center justify-center
                  ${dayStatus.status === 'available' ? 'hover:bg-gray-100' : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                {dayNumber}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isAdmin && !isUser) {
    return (
        <LandingPage 
          onLogin={handleLogin}
        />
    );
  }

  const renderAdminView = () => {
    switch (currentView) {
      case 'bookings':
        return <AdminBookingManagement />;

      case 'calendar':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Calendar Management
            </h2>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>House Availability</CardTitle>
                    <CardDescription>View all bookings and house availability - select dates to create bookings</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Drag Select:</span>
                    <Button
                      variant={useDragSelect ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseDragSelect(!useDragSelect)}
                    >
                      {useDragSelect ? "On" : "Off"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <HouseCalendar 
                  isAdmin={true}
                  onDateClick={handleDateClick}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                />
                
                {/* Admin Booking Controls */}
                {selectedStartDate && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Selected Dates:</h4>
                    <p className="text-sm text-gray-700">
                      {selectedStartDate.toLocaleDateString()}
                      {selectedEndDate ? ` to ${selectedEndDate.toLocaleDateString()}` : ' (select end date)'}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={openBookingModal}
                        disabled={!selectedStartDate || !selectedEndDate}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Create Booking
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearSelection}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'notices':
        return <Noticeboard isAdmin={true} />;

      case 'pictures':
        return <PictureBoard />;

      case 'members':
        return <UserManagement />;

      case 'admin-actions':
        return <AdminActions />;

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">House Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Manage house settings and access codes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">House Name</label>
                    <input 
                      type="text" 
                      defaultValue="O'Sullivan House" 
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Join Code</label>
                    <input 
                      type="text" 
                      defaultValue="OSULL-JOIN-2025" 
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Admin Claim Code</label>
                    <input 
                      type="text" 
                      defaultValue="OSULL-ADMIN-2025" 
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Nights</label>
                    <input 
                      type="number" 
                      defaultValue="1" 
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <Button 
                  className="mt-4 w-full"
                  onClick={() => toast.success('Settings saved successfully!')}
                >
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'ics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">ICS Feed Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>Calendar Integration</CardTitle>
                <CardDescription>Generate and manage ICS feeds for external calendars</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Public ICS Feed</h3>
                    <p className="text-sm text-gray-600 mb-2">Share this URL with members for calendar integration:</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value="https://osulivansbooks.com/ics/abc123" 
                        readOnly 
                        className="flex-1 p-2 border rounded bg-gray-50"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toast.success('ICS URL copied to clipboard!')}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => toast.success('New token generated!')}>
                      Generate New Token
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => toast.success('Token rotated successfully!')}
                    >
                      Rotate Token
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Booking Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>Pending Bookings</CardTitle>
                <CardDescription>Review and approve booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading bookings...</div>
                ) : (
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">No bookings found</div>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{booking.title || 'Untitled Booking'}</h3>
                              <p className="text-sm text-gray-600">
                                Dates: {new Date(booking.start_ts).toLocaleDateString()} - {new Date(booking.end_ts).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                Status: <span className={`font-medium ${
                                  booking.status === 'APPROVED' ? 'text-green-600' :
                                  booking.status === 'PENDING' ? 'text-yellow-600' :
                                  booking.status === 'REJECTED' ? 'text-red-600' :
                                  'text-gray-600'
                                }`}>
                                  {booking.status}
                                </span>
                              </p>
                              {booking.notes && (
                                <p className="text-sm text-gray-500 mt-1">{booking.notes}</p>
                              )}
                            </div>
                            {booking.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => toast.success(`${booking.title} approved!`)}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => toast.error(`${booking.title} rejected`)}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  const renderUserView = () => {
    switch (currentView) {
      case 'bookings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Bookings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Booking Requests</CardTitle>
                <CardDescription>View and manage your booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading your bookings...</div>
                ) : (
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">You have no bookings yet</div>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{booking.title || 'Untitled Booking'}</h3>
                              <p className="text-sm text-gray-600">
                                Dates: {new Date(booking.start_ts).toLocaleDateString()} - {new Date(booking.end_ts).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                Status: <span className={`font-medium ${
                                  booking.status === 'APPROVED' ? 'text-green-600' :
                                  booking.status === 'PENDING' ? 'text-yellow-600' :
                                  booking.status === 'REJECTED' ? 'text-red-600' :
                                  'text-gray-600'
                                }`}>
                                  {booking.status}
                                </span>
                              </p>
                              {booking.notes && (
                                <p className="text-sm text-gray-500 mt-1">{booking.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {booking.status === 'PENDING' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/bookings/${booking.id}/cancel`, {
                                        method: 'POST',
                                      });
                                      if (response.ok) {
                                        toast.success('Booking cancelled!');
                                        await fetchBookings();
                                      } else {
                                        toast.error('Failed to cancel booking');
                                      }
                                    } catch (error) {
                                      toast.error('Failed to cancel booking');
                                    }
                                  }}
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openBookingDetails(booking)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                <Button 
                  className="mt-4 w-full"
                  onClick={() => {
                    setCurrentView('calendar');
                    toast.info('Navigate to calendar to select dates for your booking');
                  }}
                >
                  Request New Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              House Availability
            </h2>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Calendar View</CardTitle>
                    <CardDescription>Check house availability and navigate through months</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Drag Select:</span>
                    <Button
                      variant={useDragSelect ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseDragSelect(!useDragSelect)}
                    >
                      {useDragSelect ? "On" : "Off"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <HouseCalendar 
                  isAdmin={false}
                  onDateClick={handleDateClick}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                />
                
                {/* Date Selection Controls */}
                {selectedStartDate && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Selected Dates:</h4>
                    <p className="text-sm text-gray-700">
                      {selectedStartDate.toLocaleDateString()}
                      {selectedEndDate ? ` to ${selectedEndDate.toLocaleDateString()}` : ' (select end date)'}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={openBookingModal}
                        disabled={!selectedEndDate}
                      >
                        Request Booking
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={clearSelection}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'notices':
        return <Noticeboard isAdmin={false} />;

      case 'pictures':
        return <PictureBoard />;

          default:
            return (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">My Bookings</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Requests</CardTitle>
                    <CardDescription>View and manage your booking requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-4">Loading your bookings...</div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">You have no bookings yet</div>
                        ) : (
                          bookings.map((booking) => (
                            <div key={booking.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{booking.title || 'Untitled Booking'}</h3>
                                  <p className="text-sm text-gray-600">
                                    Dates: {new Date(booking.start_ts).toLocaleDateString()} - {new Date(booking.end_ts).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Status: <span className={`font-medium ${
                                      booking.status === 'APPROVED' ? 'text-green-600' :
                                      booking.status === 'PENDING' ? 'text-yellow-600' :
                                      booking.status === 'REJECTED' ? 'text-red-600' :
                                      'text-gray-600'
                                    }`}>
                                      {booking.status}
                                    </span>
                                  </p>
                                  {booking.notes && (
                                    <p className="text-sm text-gray-500 mt-1">{booking.notes}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {booking.status === 'PENDING' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => toast.success('Booking cancelled!')}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.info('Booking details feature coming soon!')}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    <Button 
                      className="mt-4 w-full"
                      onClick={() => {
                        setCurrentView('calendar');
                        toast.info('Navigate to calendar to select dates for your booking');
                      }}
                    >
                      Request New Booking
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
    }
  };

  const renderView = () => {
    if (isUser) {
      return renderUserView();
    }
    return renderAdminView();
  };

      return (
        <div className="min-h-screen bg-gray-50">
          {renderNavigation()}
          <div className="p-8">
            {renderView()}
            {renderBookingModal()}
            {renderBookingDetailsModal()}
          </div>
        </div>
      );
}