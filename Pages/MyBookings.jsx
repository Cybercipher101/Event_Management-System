
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Calendar, MapPin, Hash, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function MyBookings() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const getCurrencySymbol = (currency) => {
    return currency === "INR" ? "₹" : "$";
  };

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['myBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ created_by: user.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list(),
    enabled: bookings.length > 0,
  });

  const getEventForBooking = (booking) => {
    return events.find(e => e.id === booking.event_id);
  };

  const statusColors = {
    confirmed: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-gray-600">
            View and manage your event tickets
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-xl border-purple-100">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">
                Start exploring events and book your first ticket!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, index) => {
              const event = getEventForBooking(booking);
              
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-xl border-purple-100 hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {booking.event_title}
                            </h3>
                            <Badge className={`${statusColors[booking.booking_status]} border`}>
                              {booking.booking_status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-purple-600">
                            <Hash className="w-4 h-4" />
                            <span className="font-mono font-semibold">
                              {booking.booking_reference}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                          <div className="flex items-center justify-end">
                            <span className="text-3xl font-bold text-gray-900">
                              ₹{booking.total_amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {event && (
                          <>
                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-purple-600 mt-1" />
                              <div>
                                <p className="text-sm text-gray-500">Event Date</p>
                                <p className="font-semibold text-gray-900">
                                  {format(new Date(event.start_date), "EEEE, MMMM d, yyyy")}
                                </p>
                                <p className="text-gray-600">
                                  {format(new Date(event.start_date), "h:mm a")}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-purple-600 mt-1" />
                              <div>
                                <p className="text-sm text-gray-500">Venue</p>
                                <p className="font-semibold text-gray-900">{event.venue_name}</p>
                                <p className="text-gray-600">{event.venue_city}</p>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-purple-600 mt-1" />
                          <div>
                            <p className="text-sm text-gray-500">Tickets</p>
                            <p className="font-semibold text-gray-900">
                              {booking.number_of_tickets} {booking.number_of_tickets === 1 ? 'ticket' : 'tickets'}
                            </p>
                            <p className="text-gray-600">{booking.attendee_name}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Ticket className="w-5 h-5 text-purple-600 mt-1" />
                          <div>
                            <p className="text-sm text-gray-500">Booked On</p>
                            <p className="font-semibold text-gray-900">
                              {format(new Date(booking.created_date), "MMM d, yyyy")}
                            </p>
                            <p className="text-gray-600">{booking.attendee_email}</p>
                          </div>
                        </div>
                      </div>

                      {booking.special_requirements && (
                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                          <p className="text-sm font-semibold text-purple-900 mb-1">
                            Special Requirements
                          </p>
                          <p className="text-sm text-gray-700">
                            {booking.special_requirements}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
