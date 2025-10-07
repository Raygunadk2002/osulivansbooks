'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Bed, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
}

interface DayStatus {
  isToday: boolean;
  isCurrentMonth: boolean;
  status: 'available' | 'booked' | 'pending' | 'blocked';
  booking?: Booking;
  bedroomCount?: number;
  isSelected?: boolean;
  isStartDate?: boolean;
  isEndDate?: boolean;
}

interface HouseCalendarProps {
  isAdmin?: boolean;
  onDateClick?: (date: Date) => void;
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
}

export function HouseCalendar({ 
  isAdmin = false, 
  onDateClick,
  selectedStartDate,
  selectedEndDate 
}: HouseCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
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
    // const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getDayStatus = (date: Date): DayStatus => {
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
    
    let status: 'available' | 'booked' | 'pending' | 'blocked' = 'available';
    let bedroomCount = 0;
    
    if (booking) {
      bedroomCount = booking.bedroom_count;
      if (booking.status === 'APPROVED' || booking.status === 'HOLD') {
        status = 'booked';
      } else if (booking.status === 'PENDING') {
        status = 'pending';
      } else if (booking.status === 'BLOCKED') {
        status = 'blocked';
      }
    }
    
    return {
      isToday,
      isCurrentMonth,
      status,
      booking,
      bedroomCount,
      isSelected,
      isStartDate,
      isEndDate
    };
  };

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
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
      } else {
        const error = await response.json();
        toast.error(`Failed to delete booking: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-green-100 text-green-900 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'blocked':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-white text-gray-900 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'booked':
        return <Calendar className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'blocked':
        return <Calendar className="h-3 w-3" />;
      default:
        return null;
    }
  };

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
            bgColor = 'bg-green-100 hover:bg-green-200';
            textColor = 'text-green-900';
            borderColor = 'border-green-300';
          } else if (dayStatus.status === 'pending') {
            bgColor = 'bg-yellow-100 hover:bg-yellow-200';
            textColor = 'text-yellow-900';
            borderColor = 'border-yellow-300';
          } else if (dayStatus.status === 'blocked') {
            bgColor = 'bg-red-100 hover:bg-red-200';
            textColor = 'text-red-900';
            borderColor = 'border-red-300';
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
                min-h-[60px] flex flex-col items-center justify-center
                ${dayStatus.status === 'available' ? 'hover:bg-gray-100' : ''}
              `}
              onClick={() => handleDateClick(date)}
            >
              <div className="font-medium">{dayNumber}</div>
              {dayStatus.booking && (
                <div className="mt-1 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(dayStatus.status)}
                    <span className="text-xs font-medium">
                      {dayStatus.bedroomCount} bed{dayStatus.bedroomCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {dayStatus.booking.title && (
                    <div className="text-xs truncate max-w-full" title={dayStatus.booking.title}>
                      {dayStatus.booking.title}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Booked (Approved/Hold)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span>Today</span>
        </div>
      </div>

      {/* Current Bookings Summary */}
      {isAdmin && bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Bookings</CardTitle>
            <CardDescription>Overview of all bookings for this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bookings
                .filter(booking => {
                  const bookingStart = new Date(booking.start_ts);
                  const bookingEnd = new Date(booking.end_ts);
                  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                  return (bookingStart <= monthEnd && bookingEnd >= monthStart);
                })
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className="text-sm font-medium">{booking.title || 'Untitled Booking'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Bed className="h-3 w-3" />
                        <span>{booking.bedroom_count} bed{booking.bedroom_count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(booking.start_ts), 'MMM dd')} - {format(new Date(booking.end_ts), 'MMM dd')}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBooking(booking.id, booking.title || 'Untitled Booking')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 ml-2"
                        title="Permanently delete this booking"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
