'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, X, Calendar, BookOpen, MessageSquare, Users, Settings, Download, Wrench, Camera, Copy, ExternalLink, RefreshCw, List, User, Bed, Plus } from 'lucide-react';
import { UserManagement } from '@/components/admin/user-management';
import { Noticeboard } from '@/components/noticeboard/noticeboard';
import { LandingPage } from '@/components/auth/landing-page';
import { AdminActions } from '@/components/admin/admin-actions';
import { AdminBookingManagement } from '@/components/admin/admin-booking-management';
import { HouseCalendar } from '@/components/calendar/house-calendar';
import { PictureBoard } from '@/components/picture-board/picture-board';
import { useAuth } from '@/components/auth/auth-provider';

// ICS Feed Management Component
function ICSFeedManagement() {
  const [icsToken, setIcsToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    fetchIcsToken();
  }, []);

  const fetchIcsToken = async () => {
    try {
      const response = await fetch('/api/admin/ics-settings');
      if (response.ok) {
        const data = await response.json();
        setIcsToken(data.ics_token || null);
      }
    } catch (error) {
      console.error('Failed to fetch ICS token:', error);
    } finally {
      setLoading(false);
    }
  };

  const rotateToken = async () => {
    setRotating(true);
    try {
      const response = await fetch('/api/admin/rotate-ics', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setIcsToken(data.newToken);
        toast.success('ICS token rotated successfully! Share the new URL with members.');
      } else {
        toast.error('Failed to rotate token');
      }
    } catch (error) {
      toast.error('Failed to rotate token');
    } finally {
      setRotating(false);
    }
  };

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const icsUrl = icsToken ? `${getBaseUrl()}/ics?token=${icsToken}` : '';
  const webcalUrl = icsToken ? `webcal://${getBaseUrl().replace(/^https?:\/\//, '')}/ics?token=${icsToken}` : '';
  const googleCalUrl = icsToken ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icsUrl)}` : '';

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">ICS Feed Management</h2>
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ICS Feed Management</h2>
      
      {/* Google Calendar Subscription */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Calendar className="h-5 w-5" />
            Subscribe with Google Calendar
          </CardTitle>
          <CardDescription>One-click subscription to add bookings to your Google Calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => window.open(googleCalUrl, '_blank')}
              disabled={!icsToken}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Add to Google Calendar
            </Button>
            <p className="text-xs text-green-700">
              This will open Google Calendar and prompt you to subscribe. The calendar will auto-update when bookings change.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Manual Subscription URLs */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Subscription URLs</CardTitle>
          <CardDescription>Use these URLs to subscribe from any calendar app (Apple Calendar, Outlook, etc.)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Webcal URL (recommended for subscriptions) */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Subscription URL (Recommended)
              </h3>
              <p className="text-sm text-gray-600 mb-2">Use this for Apple Calendar, Outlook, and most calendar apps:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={webcalUrl || 'No token available'} 
                  readOnly 
                  className="flex-1 p-2 border rounded bg-gray-50 text-sm font-mono"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(webcalUrl, 'Webcal URL')}
                  disabled={!icsToken}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* HTTPS URL (fallback) */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">HTTPS URL (Fallback)</h3>
              <p className="text-sm text-gray-600 mb-2">If webcal doesn&apos;t work, use this HTTPS URL:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={icsUrl || 'No token available'} 
                  readOnly 
                  className="flex-1 p-2 border rounded bg-gray-50 text-sm font-mono"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(icsUrl, 'ICS URL')}
                  disabled={!icsToken}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Subscribe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-green-700">📱 Google Calendar (Mobile/Web)</h4>
              <ol className="list-decimal list-inside ml-2 text-gray-600 space-y-1">
                <li>Click the &quot;Add to Google Calendar&quot; button above</li>
                <li>Confirm the subscription in the popup</li>
                <li>The calendar will appear in &quot;Other calendars&quot;</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700">🍎 Apple Calendar (iPhone/Mac)</h4>
              <ol className="list-decimal list-inside ml-2 text-gray-600 space-y-1">
                <li>Copy the Subscription URL above</li>
                <li>Open Calendar → File → New Calendar Subscription</li>
                <li>Paste the URL and click Subscribe</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700">📧 Outlook</h4>
              <ol className="list-decimal list-inside ml-2 text-gray-600 space-y-1">
                <li>Copy the HTTPS URL above</li>
                <li>Go to Calendar → Add Calendar → Subscribe from web</li>
                <li>Paste the URL and give it a name</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Management (Admin) */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Rotate the token if you need to invalidate old subscription links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current token: <code className="bg-gray-100 px-2 py-1 rounded">{icsToken ? icsToken.substring(0, 8) + '...' : 'None'}</code></p>
              <p className="text-xs text-gray-500 mt-1">Rotating will invalidate all existing subscription links</p>
            </div>
            <Button 
              variant="outline"
              onClick={rotateToken}
              disabled={rotating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${rotating ? 'animate-spin' : ''}`} />
              {rotating ? 'Rotating...' : 'Rotate Token'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
  updated_at: string;
  user?: {
    display_name: string | null;
    email: string;
  };
  profiles?: {
    display_name: string | null;
    email: string;
  };
}

export default function Home() {
  const { user, isAdmin, isUser, signInWithPassword, signOut } = useAuth();
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
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    title: 'Weekend Getaway',
    notes: '',
    bedroomCount: 4
  });
  
  // Calendar refresh trigger - increment to force calendar to refetch bookings
  const [calendarRefresh, setCalendarRefresh] = useState(0);
  
  // Agenda view state
  const [calendarViewMode, setCalendarViewMode] = useState<'calendar' | 'agenda'>('calendar');
  const [agendaFilter, setAgendaFilter] = useState<'mine' | 'everyone'>('everyone');

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
    console.log('Page: handleDateClick called with date:', date.toISOString());
    const dayStatus = getDayStatus(date);
    console.log('Page: dayStatus:', dayStatus);
    
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
    
    console.log('Page: Current selection - start:', selectedStartDate, 'end:', selectedEndDate);
    
    if (!selectedStartDate) {
      // First date selection
      console.log('Page: Setting start date');
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      toast.info(`Start date selected: ${date.toLocaleDateString()}`);
    } else if (!selectedEndDate) {
      // Second date selection
      if (date < selectedStartDate) {
        // If second date is before first, swap them
        console.log('Page: Setting end date (swapped)');
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
        toast.info(`Date range selected: ${date.toLocaleDateString()} to ${selectedStartDate.toLocaleDateString()}`);
      } else {
        console.log('Page: Setting end date');
        setSelectedEndDate(date);
        toast.info(`Date range selected: ${selectedStartDate.toLocaleDateString()} to ${date.toLocaleDateString()}`);
      }
    } else {
      // Reset selection
      console.log('Page: Resetting selection with new start date');
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
    
    setLoading(true);
    try {
      // Create booking request using form state
      const bookingData = {
        start_ts: selectedStartDate.toISOString(),
        end_ts: selectedEndDate.toISOString(),
        title: bookingForm.title || 'Booking Request',
        notes: bookingForm.notes || '',
        bedroom_count: bookingForm.bedroomCount,
        status: 'PENDING'
      };
      
      console.log('Submitting booking:', bookingData);
      
      // Call the API
      const response = await fetch('/api/bookings/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success(`Booking request submitted for ${selectedStartDate.toLocaleDateString()} to ${selectedEndDate.toLocaleDateString()}`);
        setShowBookingModal(false);
        // Reset form
        setBookingForm({ title: 'Weekend Getaway', notes: '', bedroomCount: 4 });
        clearSelection();
        // Refresh bookings to show the new pending request
        await fetchBookings();
        // Trigger calendar refresh to show new booking
        setCalendarRefresh(prev => prev + 1);
      } else {
        console.error('Booking error:', result);
        toast.error(`Failed to submit booking: ${result.error || result.details || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      toast.error('Failed to submit booking request. Please try again.');
    } finally {
      setLoading(false);
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
                  value={bookingForm.title}
                  onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Number of Bedrooms</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={bookingForm.bedroomCount}
                  onChange={(e) => setBookingForm({ ...bookingForm, bedroomCount: parseInt(e.target.value) })}
                >
                  <option value={1}>1 Bedroom</option>
                  <option value={2}>2 Bedrooms</option>
                  <option value={3}>3 Bedrooms</option>
                  <option value={4}>4 Bedrooms</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea 
                  placeholder="Any additional information..."
                  className="w-full p-2 border rounded h-20"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={submitBookingRequest}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                  disabled={loading}
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
    
    // Check if date is in any booking (compare dates only, ignore time)
    const dateStr = date.toISOString().split('T')[0];
    const booking = bookings.find(b => {
      const startStr = new Date(b.start_ts).toISOString().split('T')[0];
      const endStr = new Date(b.end_ts).toISOString().split('T')[0];
      return dateStr >= startStr && dateStr <= endStr;
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
        return <AdminBookingManagement onBookingChange={() => setCalendarRefresh(prev => prev + 1)} />;

      case 'calendar':
        // Get future bookings for admin agenda view (exclude cancelled/rejected)
        const adminToday = new Date();
        adminToday.setHours(0, 0, 0, 0);
        
        const adminFutureBookings = bookings
          .filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED')
          .filter(b => new Date(b.end_ts) >= adminToday)
          .sort((a, b) => new Date(a.start_ts).getTime() - new Date(b.start_ts).getTime());
        
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Calendar Management
            </h2>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{calendarViewMode === 'calendar' ? 'House Availability' : 'Upcoming Bookings'}</CardTitle>
                    <CardDescription>
                      {calendarViewMode === 'calendar' 
                        ? 'View all bookings and house availability - select dates to create bookings' 
                        : 'List of all future bookings'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={calendarViewMode === 'calendar' ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCalendarViewMode('calendar')}
                        className="h-8"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Calendar
                      </Button>
                      <Button
                        variant={calendarViewMode === 'agenda' ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCalendarViewMode('agenda')}
                        className="h-8"
                      >
                        <List className="h-4 w-4 mr-1" />
                        Agenda
                      </Button>
                    </div>
                    
                    {/* Drag Select (only in calendar mode) */}
                    {calendarViewMode === 'calendar' && (
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
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {calendarViewMode === 'calendar' ? (
                  <>
                    <HouseCalendar 
                      isAdmin={true}
                      onDateClick={handleDateClick}
                      selectedStartDate={selectedStartDate}
                      selectedEndDate={selectedEndDate}
                      refreshTrigger={calendarRefresh}
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
                  </>
                ) : (
                  /* Admin Agenda View */
                  <div className="space-y-3">
                    {adminFutureBookings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No upcoming bookings</p>
                      </div>
                    ) : (
                      adminFutureBookings.map((booking) => {
                        const startDate = new Date(booking.start_ts);
                        const endDate = new Date(booking.end_ts);
                        const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                        const isOngoing = startDate <= adminToday;
                        
                        return (
                          <div 
                            key={booking.id} 
                            className={`p-4 border rounded-lg transition-colors ${
                              booking.status === 'APPROVED' ? 'bg-green-50 border-green-200 hover:bg-green-100' :
                              booking.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' :
                              booking.status === 'HOLD' ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' :
                              'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-lg">{booking.title || 'Untitled Booking'}</h3>
                                  {isOngoing && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                      Ongoing
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    booking.status === 'HOLD' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">
                                    {startDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                  </span>
                                  {' → '}
                                  <span className="font-medium">
                                    {endDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                  </span>
                                  <span className="text-gray-400 ml-2">({nights} night{nights !== 1 ? 's' : ''})</span>
                                </div>
                                {booking.profiles && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    <User className="h-3 w-3 inline mr-1" />
                                    {booking.profiles.display_name || booking.profiles.email}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Bed className="h-4 w-4" />
                                  <span>{booking.bedroom_count} bed{booking.bedroom_count !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                            {booking.notes && (
                              <p className="text-sm text-gray-500 mt-2 border-t pt-2">{booking.notes}</p>
                            )}
                          </div>
                        );
                      })
                    )}
                    
                    {/* Quick action to book */}
                    <div className="pt-4 border-t mt-4">
                      <Button 
                        onClick={() => setCalendarViewMode('calendar')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Booking
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
        return <ICSFeedManagement />;

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
                    {bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED').length === 0 ? (
                      <div className="text-center py-4 text-gray-500">You have no active bookings</div>
                    ) : (
                      bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED').map((booking) => (
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
        // Get future bookings for agenda view (exclude cancelled/rejected)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureBookings = bookings
          .filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED')
          .filter(b => new Date(b.end_ts) >= today)
          .filter(b => agendaFilter === 'everyone' || b.requester_id === user?.id)
          .sort((a, b) => new Date(a.start_ts).getTime() - new Date(b.start_ts).getTime());
        
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              House Availability
            </h2>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{calendarViewMode === 'calendar' ? 'Calendar View' : 'Upcoming Bookings'}</CardTitle>
                    <CardDescription>
                      {calendarViewMode === 'calendar' 
                        ? 'Check house availability and navigate through months' 
                        : 'List of future bookings'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={calendarViewMode === 'calendar' ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCalendarViewMode('calendar')}
                        className="h-8"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Calendar
                      </Button>
                      <Button
                        variant={calendarViewMode === 'agenda' ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCalendarViewMode('agenda')}
                        className="h-8"
                      >
                        <List className="h-4 w-4 mr-1" />
                        Agenda
                      </Button>
                    </div>
                    
                    {/* Drag Select (only in calendar mode) */}
                    {calendarViewMode === 'calendar' && (
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
                    )}
                    
                    {/* Filter Toggle (only in agenda mode) */}
                    {calendarViewMode === 'agenda' && (
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <Button
                          variant={agendaFilter === 'everyone' ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setAgendaFilter('everyone')}
                          className="h-8"
                        >
                          Everyone
                        </Button>
                        <Button
                          variant={agendaFilter === 'mine' ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setAgendaFilter('mine')}
                          className="h-8"
                        >
                          Mine
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {calendarViewMode === 'calendar' ? (
                  <>
                    <HouseCalendar 
                      isAdmin={false}
                      onDateClick={handleDateClick}
                      selectedStartDate={selectedStartDate}
                      selectedEndDate={selectedEndDate}
                      refreshTrigger={calendarRefresh}
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
                  </>
                ) : (
                  /* Agenda View */
                  <div className="space-y-3">
                    {futureBookings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>{agendaFilter === 'mine' ? 'You have no upcoming bookings' : 'No upcoming bookings'}</p>
                      </div>
                    ) : (
                      futureBookings.map((booking) => {
                        const startDate = new Date(booking.start_ts);
                        const endDate = new Date(booking.end_ts);
                        const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                        const isOngoing = startDate <= today;
                        
                        return (
                          <div 
                            key={booking.id} 
                            className={`p-4 border rounded-lg transition-colors ${
                              booking.status === 'APPROVED' ? 'bg-green-50 border-green-200 hover:bg-green-100' :
                              booking.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' :
                              booking.status === 'HOLD' ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' :
                              'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-lg">{booking.title || 'Untitled Booking'}</h3>
                                  {isOngoing && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                      Ongoing
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    booking.status === 'HOLD' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">
                                    {startDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                  </span>
                                  {' → '}
                                  <span className="font-medium">
                                    {endDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                  </span>
                                  <span className="text-gray-400 ml-2">({nights} night{nights !== 1 ? 's' : ''})</span>
                                </div>
                                {booking.profiles && agendaFilter === 'everyone' && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    <User className="h-3 w-3 inline mr-1" />
                                    {booking.profiles.display_name || booking.profiles.email}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Bed className="h-4 w-4" />
                                  <span>{booking.bedroom_count} bed{booking.bedroom_count !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                            {booking.notes && (
                              <p className="text-sm text-gray-500 mt-2 border-t pt-2">{booking.notes}</p>
                            )}
                          </div>
                        );
                      })
                    )}
                    
                    {/* Quick action to book */}
                    <div className="pt-4 border-t mt-4">
                      <Button 
                        onClick={() => setCalendarViewMode('calendar')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Book Your Stay
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
                        {bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED').length === 0 ? (
                          <div className="text-center py-4 text-gray-500">You have no active bookings</div>
                        ) : (
                          bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED').map((booking) => (
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