import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import EventCard from "../components/events/EventCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.filter({ status: "published" }, "-start_date"),
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || event.event_type === selectedType;
    const matchesCity = selectedCity === "all" || event.venue_city === selectedCity;
    return matchesSearch && matchesType && matchesCity;
  });

  const featuredEvents = filteredEvents.filter(e => e.featured);
  const regularEvents = filteredEvents.filter(e => !e.featured);

  const cities = [...new Set(events.map(e => e.venue_city))].filter(Boolean);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find and book tickets for conferences, galas, tournaments, and more
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-100 p-6 mb-10"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-12 border-purple-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="gala">Gala</SelectItem>
                <SelectItem value="tournament">Tournament</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="concert">Concert</SelectItem>
                <SelectItem value="exhibition">Exhibition</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-12 border-purple-200">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} featured />
              ))}
            </div>
          </motion.div>
        )}

        {/* All Events */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              {featuredEvents.length > 0 ? "All Events" : "Upcoming Events"}
            </h2>
            <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {filteredEvents.length}
            </span>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : regularEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <CalendarIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}