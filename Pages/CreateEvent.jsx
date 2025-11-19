
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function CreateEvent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "conference",
    venue_name: "",
    venue_address: "",
    venue_city: "",
    venue_country: "India",
    start_date: "",
    end_date: "",
    ticket_price: 0,
    currency: "INR",
    total_capacity: 100,
    status: "draft",
    image_url: "",
    organizer_name: "",
    organizer_email: "",
    tags: [],
    featured: false,
  });

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        organizer_name: user.full_name || user.email,
        organizer_email: user.email,
      }));
    }
  }, [user]);

  const createEventMutation = useMutation({
    mutationFn: (eventData) => base44.entities.Event.create(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(createPageUrl("MyEvents"));
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, image_url: file_url }));
    setIsUploading(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.venue_name.trim()) newErrors.venue_name = "Venue name is required";
    if (!formData.venue_city.trim()) newErrors.venue_city = "City is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";
    if (formData.ticket_price < 0) newErrors.ticket_price = "Price must be positive";
    if (formData.total_capacity < 1) newErrors.total_capacity = "Capacity must be at least 1";

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, publishNow = false) => {
    e.preventDefault();

    if (!validateForm()) return;

    const eventData = {
      ...formData,
      status: publishNow ? "published" : "draft",
      tickets_sold: 0,
    };

    createEventMutation.mutate(eventData);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("MyEvents"))}
          className="mb-6 hover:bg-purple-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Create New Event
          </h1>
          <p className="text-gray-600 mb-8">
            Fill in the details to create your event
          </p>

          <form className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-xl border-purple-100">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Annual Tech Conference 2025"
                    className="mt-1"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your event..."
                    rows={5}
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_type">Event Type *</Label>
                    <Select value={formData.event_type} onValueChange={(value) => setFormData({...formData, event_type: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="gala">Gala</SelectItem>
                        <SelectItem value="tournament">Tournament</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="concert">Concert</SelectItem>
                        <SelectItem value="exhibition">Exhibition</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="image">Cover Image</Label>
                    <div className="mt-1">
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image').click()}
                        disabled={isUploading}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? "Uploading..." : formData.image_url ? "Change Image" : "Upload Image"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-purple-100">
              <CardHeader>
                <CardTitle>Venue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="venue_name">Venue Name *</Label>
                  <Input
                    id="venue_name"
                    value={formData.venue_name}
                    onChange={(e) => setFormData({...formData, venue_name: e.target.value})}
                    placeholder="Pragati Maidan Convention Center" // Updated placeholder
                    className="mt-1"
                  />
                  {errors.venue_name && <p className="text-red-500 text-xs mt-1">{errors.venue_name}</p>}
                </div>

                <div>
                  <Label htmlFor="venue_address">Address</Label>
                  <Input
                    id="venue_address"
                    value={formData.venue_address}
                    onChange={(e) => setFormData({...formData, venue_address: e.target.value})}
                    placeholder="Mathura Road, Pragati Maidan" // Updated placeholder
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venue_city">City *</Label>
                    <Input
                      id="venue_city"
                      value={formData.venue_city}
                      onChange={(e) => setFormData({...formData, venue_city: e.target.value})}
                      placeholder="New Delhi" // Updated placeholder
                      className="mt-1"
                    />
                    {errors.venue_city && <p className="text-red-500 text-xs mt-1">{errors.venue_city}</p>}
                  </div>

                  <div>
                    <Label htmlFor="venue_country">Country</Label>
                    <Input
                      id="venue_country"
                      value={formData.venue_country}
                      onChange={(e) => setFormData({...formData, venue_country: e.target.value})}
                      placeholder="India" // Updated placeholder
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-purple-100">
              <CardHeader>
                <CardTitle>Date & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date & Time *</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="mt-1"
                    />
                    {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date & Time *</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="mt-1"
                    />
                    {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="ticket_price">Ticket Price *</Label>
                    <Input
                      id="ticket_price"
                      type="number"
                      min="0"
                      step="1" // Changed step to 1 for INR
                      value={formData.ticket_price}
                      onChange={(e) => setFormData({...formData, ticket_price: parseFloat(e.target.value) || 0})}
                      className="mt-1"
                    />
                    {errors.ticket_price && <p className="text-red-500 text-xs mt-1">{errors.ticket_price}</p>}
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem> {/* Added INR with symbol */}
                        <SelectItem value="USD">USD ($)</SelectItem> {/* Added symbol */}
                        <SelectItem value="EUR">EUR (€)</SelectItem> {/* Added symbol */}
                        <SelectItem value="GBP">GBP (£)</SelectItem> {/* Added symbol */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="total_capacity">Total Capacity *</Label>
                    <Input
                      id="total_capacity"
                      type="number"
                      min="1"
                      value={formData.total_capacity}
                      onChange={(e) => setFormData({...formData, total_capacity: parseInt(e.target.value) || 100})}
                      className="mt-1"
                    />
                    {errors.total_capacity && <p className="text-red-500 text-xs mt-1">{errors.total_capacity}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, false)}
                disabled={createEventMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={createEventMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {createEventMutation.isPending ? "Creating..." : "Publish Event"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
