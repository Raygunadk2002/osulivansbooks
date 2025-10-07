'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  title: string;
  start_ts: string;
  end_ts: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'HOLD' | 'BLOCKED';
  bedroom_count: number;
  requester_id: string;
  created_at: string;
  updated_at: string;
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
  isInRange?: boolean;
}

interface DragSelectCalendarProps {
  isAdmin?: boolean;
  onDateSelect?: (startDate: Date, endDate: Date) => void;
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
  bookings?: Booking[];
}

export function DragSelectCalendar({ 
  isAdmin = false, 
  onDateSelect,
  selectedStartDate,
  selectedEndDate,
  bookings = []
}: DragSelectCalendarProps) {
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [dragEndDate, setDragEndDate] = useState<Date | null>(null);
  const [tempSelection, setTempSelection] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  
  const calendarRef = useRef<HTMLDivElement>(null);

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
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate the start date (go back to the beginning of the week)
    const startDate = new Date(year, month, 1 - firstDayOfWeek);
    
    const days = [];
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getDayStatus = (date: Date): DayStatus => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    
    // Check if date is in selected range (either permanent or temporary)
    const isSelected = selectedStartDate && selectedEndDate && 
      date >= selectedStartDate && date <= selectedEndDate;
    const isStartDate = selectedStartDate && date.toDateString() === selectedStartDate.toDateString();
    const isEndDate = selectedEndDate && date.toDateString() === selectedEndDate.toDateString();
    
    // Check if date is in temporary drag selection
    const isInTempRange = tempSelection.start && tempSelection.end && 
      date >= tempSelection.start && date <= tempSelection.end;
    const isTempStart = tempSelection.start && date.toDateString() === tempSelection.start.toDateString();
    const isTempEnd = tempSelection.end && date.toDateString() === tempSelection.end.toDateString();
    
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
      isSelected: Boolean(isSelected || isInTempRange),
      isStartDate: Boolean(isStartDate || isTempStart),
      isEndDate: Boolean(isEndDate || isTempEnd),
      isInRange: Boolean(isSelected || isInTempRange)
    };
  };

  const handleMouseDown = (date: Date, event: React.MouseEvent) => {
    event.preventDefault();
    
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

    console.log('Mouse down on date:', date.toLocaleDateString());
    setIsDragging(true);
    setDragStartDate(date);
    setDragEndDate(null);
    setTempSelection({ start: date, end: null });
  };

  const handleMouseEnter = (date: Date) => {
    if (!isDragging || !dragStartDate) return;

    console.log('Mouse enter on date:', date.toLocaleDateString());

    const dayStatus = getDayStatus(date);
    
    // Don't allow selection of booked dates
    if (dayStatus.status === 'booked') {
      return;
    }
    
    // Don't allow selection of past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return;
    }

    setDragEndDate(date);
    
    // Set temporary selection
    if (date < dragStartDate) {
      setTempSelection({ start: date, end: dragStartDate });
    } else {
      setTempSelection({ start: dragStartDate, end: date });
    }
  };

  const handleMouseUp = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    if (!isDragging) return;

    console.log('Mouse up, dragStartDate:', dragStartDate?.toLocaleDateString(), 'dragEndDate:', dragEndDate?.toLocaleDateString());

    setIsDragging(false);
    
    if (dragStartDate && dragEndDate && onDateSelect) {
      const startDate = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
      const endDate = dragStartDate < dragEndDate ? dragEndDate : dragStartDate;
      
      onDateSelect(startDate, endDate);
      toast.info(`Date range selected: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    } else if (dragStartDate && !dragEndDate && onDateSelect) {
      // Single date selection
      onDateSelect(dragStartDate, dragStartDate);
      toast.info(`Date selected: ${dragStartDate.toLocaleDateString()}`);
    }
    
    // Clear temporary selection
    setTempSelection({ start: null, end: null });
    setDragStartDate(null);
    setDragEndDate(null);
  };

  const handleClick = (date: Date) => {
    if (isDragging) return; // Let mouse up handle it
    
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

    if (onDateSelect) {
      onDateSelect(date, date);
      toast.info(`Date selected: ${date.toLocaleDateString()}`);
    }
  };

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, dragStartDate, dragEndDate]);

  const getDayClassName = (dayStatus: DayStatus) => {
    return cn(
      "relative h-12 w-12 flex items-center justify-center text-sm rounded-md cursor-pointer transition-colors",
      "hover:bg-blue-100 hover:text-blue-700",
      {
        // Current month styling
        "text-gray-900": dayStatus.isCurrentMonth,
        "text-gray-400": !dayStatus.isCurrentMonth,
        
        // Today styling
        "bg-blue-600 text-white hover:bg-blue-700": dayStatus.isToday,
        
        // Selection styling
        "bg-blue-500 text-white hover:bg-blue-600": dayStatus.isSelected && !dayStatus.isToday,
        "bg-blue-400 text-white": dayStatus.isInRange && !dayStatus.isStartDate && !dayStatus.isEndDate && !dayStatus.isToday,
        
        // Start/End date styling
        "bg-blue-600 text-white font-semibold": dayStatus.isStartDate || dayStatus.isEndDate,
        
        // Status styling
        "bg-red-100 text-red-700 hover:bg-red-200": dayStatus.status === 'booked',
        "bg-yellow-100 text-yellow-700 hover:bg-yellow-200": dayStatus.status === 'pending',
        "bg-gray-100 text-gray-700 hover:bg-gray-200": dayStatus.status === 'blocked',
        
        // Disabled styling
        "opacity-50 cursor-not-allowed": dayStatus.status === 'booked' || dayStatus.status === 'blocked',
      }
    );
  };

  const days = getCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dayStatus = getDayStatus(date);
          return (
            <div
              key={index}
              className={getDayClassName(dayStatus)}
              onMouseDown={(e) => handleMouseDown(date, e)}
              onMouseEnter={() => handleMouseEnter(date)}
              onMouseUp={(e) => handleMouseUp(e)}
              onClick={() => handleClick(date)}
            >
              {date.getDate()}
              
              {/* Bedroom count indicator */}
              {dayStatus.bedroomCount && dayStatus.bedroomCount > 0 && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-blue-600 rounded-full text-xs text-white flex items-center justify-center">
                  {dayStatus.bedroomCount}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Click or drag to select dates</p>
        {isDragging && (
          <p className="text-blue-600 font-medium">Dragging to select range...</p>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-100 rounded"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>Blocked</span>
        </div>
      </div>
    </div>
  );
}
