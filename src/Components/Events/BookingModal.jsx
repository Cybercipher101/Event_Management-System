import React, { useState } from 'react';
import { Ticket, User, Mail, Phone, MessageSquare } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { formatPrice } from '../../utils/helpers';
import './BookingModal.css';

export default function BookingModal({ event, user, onClose, onBook, isProcessing }) {
  const availableTickets = event.total_capacity - event.tickets_sold;

  const [formData, setFormData] = useState({
    attendee_name: user?.name || '',
    attendee_email: user?.email || '',
    attendee_phone: '',
    number_of_tickets: 1,
    special_requirements: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.attendee_name.trim()) errs.attendee_name = 'Name is required';
    if (!formData.attendee_email.trim()) errs.attendee_email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.attendee_email)) errs.attendee_email = 'Invalid email';
    if (formData.number_of_tickets < 1) errs.number_of_tickets = 'At least 1 ticket required';
    if (formData.number_of_tickets > availableTickets) errs.number_of_tickets = `Only ${availableTickets} available`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onBook({
      event: event._id,
      ...formData,
      number_of_tickets: Number(formData.number_of_tickets),
    });
  };

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const totalAmount = event.ticket_price * (formData.number_of_tickets || 0);

  return (
    <Modal isOpen={true} onClose={onClose} title={
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Ticket size={22} color="var(--primary)" /> Book Tickets
      </span>
    }>
      <p className="booking-modal-event-title">{event.title}</p>

      <form onSubmit={handleSubmit}>
        <Input
          id="attendee_name"
          label="Full Name *"
          icon={<User size={15} />}
          value={formData.attendee_name}
          onChange={(e) => update('attendee_name', e.target.value)}
          placeholder="Your full name"
          error={errors.attendee_name}
        />

        <Input
          id="attendee_email"
          label="Email Address *"
          icon={<Mail size={15} />}
          type="email"
          value={formData.attendee_email}
          onChange={(e) => update('attendee_email', e.target.value)}
          placeholder="your@email.com"
          error={errors.attendee_email}
        />

        <Input
          id="attendee_phone"
          label="Phone Number"
          icon={<Phone size={15} />}
          type="tel"
          value={formData.attendee_phone}
          onChange={(e) => update('attendee_phone', e.target.value)}
          placeholder="+91 98765 43210"
        />

        <Input
          id="number_of_tickets"
          label="Number of Tickets *"
          icon={<Ticket size={15} />}
          type="number"
          min="1"
          max={availableTickets}
          value={formData.number_of_tickets}
          onChange={(e) => update('number_of_tickets', e.target.value)}
          error={errors.number_of_tickets}
        />
        <p className="booking-tickets-available">{availableTickets} tickets available</p>

        <Textarea
          id="special_requirements"
          label="Special Requirements"
          icon={<MessageSquare size={15} />}
          rows={3}
          value={formData.special_requirements}
          onChange={(e) => update('special_requirements', e.target.value)}
          placeholder="Dietary restrictions, accessibility needs, etc."
        />

        <div className="booking-summary">
          <div className="booking-summary-row">
            <span>Tickets</span>
            <span>{formData.number_of_tickets} × {formatPrice(event.ticket_price, event.currency)}</span>
          </div>
          <div className="booking-summary-total">
            <span>Total Amount</span>
            <span>{formatPrice(totalAmount, event.currency)}</span>
          </div>
        </div>

        <div className="booking-actions">
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="submit" loading={isProcessing}>
            {isProcessing ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
