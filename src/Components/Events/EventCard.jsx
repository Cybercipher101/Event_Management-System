import React from "react";
import { motion } from "framer-motion";
import CardContent from "../ui/card";
import Badge from "../ui/badge";
import Button from "../ui/button";
import { Calendar, MapPin, Users, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";


export default function EventCard({ event, featured = false }) {
  const availableTickets = event.total_capacity - event.tickets_sold;
  const isSoldOut = availableTickets <= 0;

  const typeColors = {
    conference: "bg-blue-100 text-blue-800 border-blue-200",
    meeting: "bg-green-100 text-green-800 border-green-200",
    gala: "bg-purple-100 text-purple-800 border-purple-200",
    tournament: "bg-red-100 text-red-800 border-red-200",
    workshop: "bg-yellow-100 text-yellow-800 border-yellow-200",
    webinar: "bg-indigo-100 text-indigo-800 border-indigo-200",
    concert: "bg-pink-100 text-pink-800 border-pink-200",
    exhibition: "bg-orange-100 text-orange-800 border-orange-200",
  };

  const getCurrencySymbol = (currency) => {
    return currency === "INR" ? "₹" : "$";
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={createPageUrl("EventDetails") + `?id=${event.id}`}>
        <Card className={`overflow-hidden h-full bg-white hover:shadow-2xl transition-shadow duration-300 border-2 ${
          featured ? "border-yellow-400" : "border-purple-100"
        }`}>
          {event.image_url ? (
            <div className="relative h-48 overflow-hidden">
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {featured && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">Featured</span>
                </div>
              )}
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">SOLD OUT</span>
                </div>
              )}
            </div>
          ) : (
            <div className={`relative h-48 bg-gradient-to-br ${
              featured 
                ? "from-yellow-400 to-orange-500" 
                : "from-purple-500 to-indigo-600"
            } flex items-center justify-center`}>
              <Calendar className="w-20 h-20 text-white/30" />
              {featured && (
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">Featured</span>
                </div>
              )}
            </div>
          )}

          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <Badge className={`${typeColors[event.event_type]} border font-medium`}>
                {event.event_type}
              </Badge>
              {!isSoldOut && availableTickets < 20 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Only {availableTickets} left
                </Badge>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
              {event.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {event.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="font-medium">
                  {format(new Date(event.start_date), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-purple-500" />
                <span className="line-clamp-1">{event.venue_name}, {event.venue_city}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-purple-500" />
                <span>{event.tickets_sold} / {event.total_capacity} attendees</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">
                  {getCurrencySymbol(event.currency)}{event.ticket_price}
                </span>
              </div>
              <Button 
                className={`${
                  isSoldOut 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                } shadow-md`}
                disabled={isSoldOut}
              >
                {isSoldOut ? "Sold Out" : "Book Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}