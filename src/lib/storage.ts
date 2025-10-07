// Simple in-memory storage for development
// This provides persistence between API calls but not between server restarts

interface Booking {
  id: string;
  requester_id: string;
  status: string;
  start_ts: string;
  end_ts: string;
  title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Profile {
  display_name: string;
  email: string;
}

interface BookingWithProfile extends Booking {
  profiles: Profile;
}

// In-memory storage
const bookings: BookingWithProfile[] = [
  {
    id: '1',
    start_ts: new Date(2024, 11, 15).toISOString(),
    end_ts: new Date(2024, 11, 16).toISOString(),
    status: 'APPROVED',
    title: 'Weekend Getaway',
    notes: 'Looking forward to a relaxing weekend!',
    requester_id: 'mock-user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'Alex Keal',
      email: 'alexkeal@me.com'
    }
  },
  {
    id: '2',
    start_ts: new Date(2024, 11, 22).toISOString(),
    end_ts: new Date(2024, 11, 29).toISOString(),
    status: 'PENDING',
    title: 'Family Holiday',
    notes: 'Christmas family gathering',
    requester_id: 'mock-user-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'John Doe',
      email: 'john@example.com'
    }
  }
];

export function getAllBookings(): BookingWithProfile[] {
  return bookings.sort((a, b) => new Date(a.start_ts).getTime() - new Date(b.start_ts).getTime());
}

export function createBooking(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): BookingWithProfile {
  const newBooking: BookingWithProfile = {
    ...bookingData,
    id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'Alex Keal',
      email: 'alexkeal@me.com'
    }
  };
  
  bookings.push(newBooking);
  return newBooking;
}

export function updateBooking(id: string, updates: Partial<Booking>): BookingWithProfile | null {
  const index = bookings.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  bookings[index] = {
    ...bookings[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  return bookings[index];
}

export function deleteBooking(id: string): boolean {
  const index = bookings.findIndex(b => b.id === id);
  if (index === -1) return false;
  
  bookings.splice(index, 1);
  return true;
}
