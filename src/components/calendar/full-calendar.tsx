'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// Dynamically import FullCalendar to avoid SSR issues
const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });

// Import types
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';

// Import plugins
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  extendedProps: {
    status?: string;
    type: 'BOOKING' | 'VISIT';
    bookingId?: string;
    visitId?: string;
  };
}

interface BackgroundEvent {
  start: string;
  end: string;
  display: 'background';
  extendedProps: {
    status: string;
    type: 'BOOKING';
    bookingId: string;
    title: string;
  };
}

interface FullCalendarComponentProps {
  isAdmin?: boolean;
  onDateSelect?: (start: Date, end: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function FullCalendarComponent({ 
  isAdmin = false, 
  onDateSelect, 
  onEventClick 
}: FullCalendarComponentProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [backgroundEvents, setBackgroundEvents] = useState<BackgroundEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [eventsResponse, backgroundResponse] = await Promise.all([
        fetch('/api/fullcalendar/events'),
        fetch('/api/fullcalendar/background')
      ]);

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      }

      if (backgroundResponse.ok) {
        const backgroundData = await backgroundResponse.json();
        setBackgroundEvents(backgroundData);
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo.start, selectInfo.end);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (onEventClick) {
      const eventData: CalendarEvent = {
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.start?.toISOString() || '',
        end: clickInfo.event.end?.toISOString() || '',
        allDay: clickInfo.event.allDay || false,
        extendedProps: clickInfo.event.extendedProps as { status?: string; type: "BOOKING" | "VISIT"; bookingId?: string; visitId?: string }
      };
      onEventClick(eventData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          listPlugin,
        ]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listMonth'
        }}
        initialView="dayGridMonth"
        editable={isAdmin}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={[...events, ...backgroundEvents]}
        eventClick={handleEventClick}
        select={handleDateSelect}
        height="auto"
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={true}
        nowIndicator={true}
        scrollTime="08:00:00"
        eventColor="#3b82f6"
        eventBorderColor="#1d4ed8"
      />
    </div>
  );
}