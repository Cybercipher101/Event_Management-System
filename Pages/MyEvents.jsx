
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Users, DollarSign, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyEvents() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.user_role !== "organizer" && userData.user_role !== "admin") {
          navigate(createPageUrl("Events"));
          return;
        }
        setUser(userData);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['myEvents', user?.email],
    queryFn: () => base44.entities.Event.filter({ created_by: user.email }, "-created_date"),
    enabled: !!user,
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId) => base44.entities.Event.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
    },
  });

  const getCurrencySymbol = (currency) => {
    return currency === "INR" ? "₹" : "$";
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-800 border-gray-200",
    published: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              My Events
            </h1>
            <p className="text-gray-600">
              Manage your events and track bookings
            </p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("CreateEvent"))}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-xl border-purple-100">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first event to start managing bookings
              </p>
              <Button
                onClick={() => navigate(createPageUrl("CreateEvent"))}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event, index) => {
              const availableTickets = event.total_capacity - event.tickets_sold;
              const revenue = event.tickets_sold * event.ticket_price;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-xl border-purple-100 hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={`${statusColors[event.status]} border`}>
                          {event.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="hover:bg-purple-50">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="hover:bg-red-50 text-red-600"
                            onClick={() => deleteEventMutation.mutate(event.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {event.title}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span>{format(new Date(event.start_date), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-purple-500" />
                          <span>{event.venue_name}, {event.venue_city}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tickets Sold</p>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span className="font-bold text-gray-900">
                              {event.tickets_sold}/{event.total_capacity}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Price</p>
                          <div className="flex items-center">
                            <span className="font-bold text-gray-900">
                              {getCurrencySymbol(event.currency)}{event.ticket_price}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Revenue</p>
                          <span className="font-bold text-green-600">
                            ₹{revenue.toFixed(0)}
                          </span>
                        </div>
                      </div>
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
