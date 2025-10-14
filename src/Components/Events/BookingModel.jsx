
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Ticket, User, Mail, Phone, MessageSquare } from "lucide-react";

export default function BookingModal({ event, user, availableTickets, onClose, onBook, isProcessing }) {
  const [formData, setFormData] = useState({
    attendee_name: user?.full_name || "",
    attendee_email: user?.email || "",
    attendee_phone: user?.phone || "",
    number_of_tickets: 1,
    special_requirements: "",
  });

  const [errors, setErrors] = useState({});

  const getCurrencySymbol = (currency) => {
    // This function can be extended for more currencies if needed.
    // For this context, assuming "INR" for Indian Rupee and "$" for others.
    return currency === "INR" ? "₹" : "$";
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.attendee_name.trim()) {
      newErrors.attendee_name = "Name is required";
    }
    
    if (!formData.attendee_email.trim()) {
      newErrors.attendee_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.attendee_email)) {
      newErrors.attendee_email = "Invalid email format";
    }
    
    if (formData.number_of_tickets < 1) {
      newErrors.number_of_tickets = "At least 1 ticket required";
    } else if (formData.number_of_tickets > availableTickets) {
      newErrors.number_of_tickets = `Only ${availableTickets} tickets available`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const totalAmount = event.ticket_price * formData.number_of_tickets;
    
    onBook({
      ...formData,
      total_amount: totalAmount,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-purple-600" />
            Book Your Tickets
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            {event.title}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <Label htmlFor="attendee_name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </Label>
            <Input
              id="attendee_name"
              value={formData.attendee_name}
              onChange={(e) => setFormData({...formData, attendee_name: e.target.value})}
              placeholder="John Doe"
              className="mt-1"
            />
            {errors.attendee_name && (
              <p className="text-red-500 text-xs mt-1">{errors.attendee_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="attendee_email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </Label>
            <Input
              id="attendee_email"
              type="email"
              value={formData.attendee_email}
              onChange={(e) => setFormData({...formData, attendee_email: e.target.value})}
              placeholder="john@example.com"
              className="mt-1"
            />
            {errors.attendee_email && (
              <p className="text-red-500 text-xs mt-1">{errors.attendee_email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="attendee_phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="attendee_phone"
              type="tel"
              value={formData.attendee_phone}
              onChange={(e) => setFormData({...formData, attendee_phone: e.target.value})}
              placeholder="+1 (555) 000-0000"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="number_of_tickets" className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Number of Tickets *
            </Label>
            <Input
              id="number_of_tickets"
              type="number"
              min="1"
              max={availableTickets}
              value={formData.number_of_tickets}
              onChange={(e) => setFormData({...formData, number_of_tickets: parseInt(e.target.value) || 1})}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              {availableTickets} tickets available
            </p>
            {errors.number_of_tickets && (
              <p className="text-red-500 text-xs mt-1">{errors.number_of_tickets}</p>
            )}
          </div>

          <div>
            <Label htmlFor="special_requirements" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Special Requirements
            </Label>
            <Textarea
              id="special_requirements"
              value={formData.special_requirements}
              onChange={(e) => setFormData({...formData, special_requirements: e.target.value})}
              placeholder="Any dietary restrictions, accessibility needs, etc."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Tickets</span>
              <span className="font-semibold">{formData.number_of_tickets} × {getCurrencySymbol(event.currency)}{event.ticket_price}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold text-purple-600">
              <span>Total Amount</span>
              <span>{getCurrencySymbol(event.currency)}{(event.ticket_price * formData.number_of_tickets).toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isProcessing ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
