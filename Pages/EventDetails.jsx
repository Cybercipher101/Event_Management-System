
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Clock, Building, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import BookingModal from "../components/events/BookingModal";

export default function EventDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [user, setUser] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const getCurrencySymbol = (currency) => {
    return currency === "INR" ? "₹" : "$";
  };

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const events = await base44.entities.Event.filter({ id: eventId });
      return events[0];
    },
    enabled: !!eventId,
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const booking = await base44.entities.Booking.create(bookingData);
      await base44.entities.Event.update(eventId, {
        tickets_sold: event.tickets_sold + bookingData.number_of_tickets
      });
      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      setShowBookingModal(false);
    },
  });

  const handleBooking = async (bookingData) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname + window.location.search);
      return;
    }

    const bookingReference = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    await bookingMutation.mutateAsync({
      ...bookingData,
      event_id: eventId,
      event_title: event.title,
      booking_reference: bookingReference,
      booking_status: "confirmed",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-96 w-full rounded-2xl mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <Button onClick={() => navigate(createPageUrl("Events"))}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const availableTickets = event.total_capacity - event.tickets_sold;
  const isSoldOut = availableTickets <= 0;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Events"))}
          className="mb-6 hover:bg-purple-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        {/* Hero Image */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl">
          {event.image_url ? (
            <img 
              src={event.image_url} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Calendar className="w-32 h-32 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 mb-4">
              {event.event_type}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {event.title}
            </h1>
            <p className="text-white/90 text-lg">
              Organized by {event.organizer_name || "Event Organizer"}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-xl border-purple-100">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description || "No description available for this event."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-purple-100">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(event.start_date), "EEEE, MMMM d, yyyy")}
                      </p>
                      <p className="text-gray-600">
                        {format(new Date(event.start_date), "h:mm a")} - {format(new Date(event.end_date), "h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{event.venue_name}</p>
                      <p className="text-gray-600">{event.venue_address}</p>
                      <p className="text-gray-600">{event.venue_city}, {event.venue_country}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-semibold text-gray-900">
                        {event.tickets_sold} / {event.total_capacity} Attendees
                      </p>
                      <p className="text-gray-600">
                        {availableTickets} tickets available
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Organizer</p>
                      <p className="font-semibold text-gray-900">{event.organizer_name}</p>
                      <p className="text-gray-600">{event.organizer_email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div>
            <Card className="sticky top-6 bg-white/80 backdrop-blur-xl border-purple-100 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-6 pb-6 border-b border-purple-100">
                  <p className="text-sm text-gray-500 mb-2">Ticket Price</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      {getCurrencySymbol(event.currency)}{event.ticket_price}
                    </span>
                  </div>
                </div>

                {isSoldOut ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Sold Out</h3>
                    <p className="text-gray-600">
                      This event has reached maximum capacity
                    </p>
                  </div>
                ) : (
                  <>
                    {availableTickets < 20 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-700 text-sm font-medium text-center">
                          ⚡ Only {availableTickets} tickets left!
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
                      disabled={bookingMutation.isPending}
                    >
                      {bookingMutation.isPending ? "Processing..." : "Book Tickets"}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      Instant confirmation • Secure booking
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          event={event}
          user={user}
          availableTickets={availableTickets}
          onClose={() => setShowBookingModal(false)}
          onBook={handleBooking}
          isProcessing={bookingMutation.isPending}
        />
      )}
    </div>
  );
}
