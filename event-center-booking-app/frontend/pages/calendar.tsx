// pages/calendar.tsx
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  ToolbarProps,
} from 'react-big-calendar';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
// Use the correct CSS path based on your version/folder structure
// e.g. 'react-big-calendar/dist/react-big-calendar.css' or 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/css/react-big-calendar.css';

/*
  For better user experience, we now add "selectable", "onSelectSlot", and "onSelectEvent".
  This lets the user click free slots to create a booking, or see details for a booked slot, etc.
*/

// Define our custom event type
interface MyEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  isBooked: boolean;
}

// Minimal custom toolbar, typed for MyEvent
const CustomToolbar: React.FC<ToolbarProps<MyEvent, object>> = (props) => {
  // RBC uses string-based navigation: 'PREV', 'NEXT', 'TODAY', 'DATE'
  const goToBack = () => props.onNavigate('PREV');
  const goToNext = () => props.onNavigate('NEXT');
  const goToToday = () => props.onNavigate('TODAY');

  // RBC's onView expects 'month', 'week', 'day', or 'agenda'
  const handleViewChange = (view: string) => {
    // We'll only support "week" in this sample
    if (view === 'week') {
      props.onView(view);
    }
  };

  return (
    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
      {/* Left: current label for date range */}
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
        {props.label}
      </div>

      {/* Right: nav buttons, 'Create Booking' button */}
      <div>
        <button onClick={goToBack} style={{ marginRight: 5 }}>←</button>
        <button onClick={goToToday} style={{ marginRight: 5 }}>Today</button>
        <button onClick={goToNext} style={{ marginRight: 15 }}>→</button>

        <button onClick={() => handleViewChange('week')} style={{ marginRight: 15 }}>
          Week
        </button>

        <button
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            padding: '0.5rem 1rem',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => {
            // In Next.js, you'd typically use a router push
            // For simplicity:
            window.location.href = '/new-booking';
          }}
        >
          Create Booking
        </button>
      </div>
    </div>
  );
};

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [freeSlotsToday, setFreeSlotsToday] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1) Fetch bookings from your API
      const res = await fetch('/api/bookings');
      if (!res.ok) {
        console.error('Failed to fetch bookings');
        return;
      }
      const data = await res.json();
      // Suppose it returns array of { startTime, endTime } objects

      // 2) Build "booked" events
      const bookedEvents: MyEvent[] = data.map((b: any) => ({
        title: 'Booked',
        start: new Date(b.startTime),
        end: new Date(b.endTime),
        isBooked: true,
      }));

      // We'll define a ~2 week range around today
      const now = new Date();
      const rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      const rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

      const allEvents: MyEvent[] = [...bookedEvents];

      const todayKey = format(now, 'yyyy-MM-dd');
      const freeHoursToday: string[] = [];

      // For each day/hour in [rangeStart..rangeEnd], create "free" events if no overlap
      let curDate = new Date(rangeStart);
      while (curDate <= rangeEnd) {
        for (let hour = 0; hour < 24; hour++) {
          const slotStart = new Date(curDate);
          slotStart.setHours(hour, 0, 0, 0);
          const slotEnd = new Date(slotStart);
          slotEnd.setHours(hour + 1);

          const isWithinRange = slotStart >= rangeStart && slotEnd <= rangeEnd;
          if (!isWithinRange) continue;

          // Check for overlap with a booked event
          const overlap = bookedEvents.some(ev => ev.start < slotEnd && ev.end > slotStart);
          if (!overlap) {
            allEvents.push({
              title: 'Free',
              start: slotStart,
              end: slotEnd,
              isBooked: false,
            });

            const dateKey = format(slotStart, 'yyyy-MM-dd');
            if (dateKey === todayKey) {
              const label = `${format(slotStart, 'HH:mm')} - ${format(slotEnd, 'HH:mm')}`;
              freeHoursToday.push(label);
            }
          }
        }
        curDate.setDate(curDate.getDate() + 1);
      }

      setEvents(allEvents);
      setFreeSlotsToday(freeHoursToday);
    };

    fetchData();
  }, []);

  // eventStyling: red for booked, green for free
  const eventStyleGetter = (event: MyEvent) => {
    const backgroundColor = event.isBooked ? 'red' : 'green';
    return {
      style: {
        backgroundColor,
        color: '#fff',
      },
    };
  };

  // onSelectSlot: user clicks on an empty timeslot
  const handleSelectSlot = (slotInfo: {
    start: Date;
    end: Date;
    slots: Date[]; // or string[] depending on RBC version
    action: 'select' | 'click' | 'doubleClick';
  }) => {
    // For example, see if it's "free" or if you'd prefer to forcibly create a booking
    alert(
      `You selected from ${format(slotInfo.start, 'PPpp')} to ${format(
        slotInfo.end,
        'PPpp'
      )}\nSlots included: ${slotInfo.slots.length}`
    );
    // You might open a modal or navigate to a form with those times.
  };

  // onSelectEvent: user clicks on an existing event (booked or free)
  const handleSelectEvent = (event: MyEvent) => {
    if (event.isBooked) {
      alert(`This slot is already booked!\nStart: ${format(event.start, 'PPpp')}\nEnd: ${format(event.end, 'PPpp')}`);
      // Possibly show details of who booked it, etc.
    } else {
      // It's a free event
      alert(`Free slot:\n${format(event.start, 'PPpp')} - ${format(event.end, 'PPpp')}`);
      // Possibly prompt user to create a booking
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Let us help you find the best date for your event!</h2>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        views={{ week: true }}
        style={{ height: 700 }}
        eventPropGetter={eventStyleGetter}
        toolbar
        components={{
          toolbar: CustomToolbar,
        }}
        selectable // Enable slot selection
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      <div style={{ marginTop: '2rem' }}>
        <h3>Free Slots Today</h3>
        {freeSlotsToday.length === 0 ? (
          <p>No free slots today.</p>
        ) : (
          <ul>
            {freeSlotsToday.map((slot, idx) => (
              <li key={idx}>{slot}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;

/*
  ================================
  Caveats & Performance Notes
  ================================
  1) Generating hour-by-hour "free" events for a 2-week range can produce many events. 
     If your data scale is bigger (like months or years), consider a more dynamic approach 
     that only generates free events for the currently visible date range 
     (using onRangeChange / onView).

  2) Partial hours:
     This approach uses 1-hour blocks. 
     If you need 30-min increments or custom slot durations, you can refine the iteration 
     or configure the calendar (step/timeslots).

  3) React version & react-big-calendar version:
     Ensure they're compatible. If you see peer dependency warnings but everything compiles 
     and runs, you can ignore them or switch to a stable React 18.2.0.

  4) Interactivity:
     - onSelectSlot: user clicks an empty timeslot (free block). 
       We pop up an alert, but you might open a booking modal.
     - onSelectEvent: user clicks an event (booked or free). 
       We show an alert. For real usage, open a detail view or booking form.

  5) The “Create Booking” button:
     - In Next.js, you'd normally do:
         import { useRouter } from 'next/router';
         const router = useRouter();
         router.push('/new-booking');
       Instead of using window.location.href = '/new-booking'.

  6) No Monthly/Aggregator logic:
     This snippet focuses solely on weekly hour-by-hour detail. 
     "Free" blocks appear in green, "Booked" in red. 
     There's no monthly aggregator or aggregator events.
*/
