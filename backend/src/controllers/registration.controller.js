/**
 * Registration Controller
 * Handles event registration operations
 */

import { supabase } from '../config/supabase.js';

/**
 * Register for an event
 * POST /api/registrations/:event_id
 * @access Private (Students only)
 */
export const registerForEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const user_id = req.user.user_id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    if (!uuidRegex.test(event_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
        error: null
      });
    }

    // Check if event exists and get details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('event_id, event_name, available_seats, gform_link, manager_id')
      .eq('event_id', event_id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        error: eventError?.message || null
      });
    }

    // Check if seats are available
    if (event.available_seats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No seats available for this event',
        error: null
      });
    }

    // Check if user is already registered
    const { data: existingRegistration, error: checkError } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .single();

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
        error: null
      });
    }

    // Insert registration
    const { data: registration, error: insertError } = await supabase
      .from('registrations')
      .insert([{
        event_id,
        user_id
      }])
      .select()
      .single();

    if (insertError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to register for event',
        error: insertError.message
      });
    }

    // Decrease available_seats by 1
    const { error: updateError } = await supabase
      .from('events')
      .update({ available_seats: event.available_seats - 1 })
      .eq('event_id', event_id);

    if (updateError) {
      // Rollback: delete the registration if seat update fails
      await supabase
        .from('registrations')
        .delete()
        .eq('id', registration.id);

      return res.status(400).json({
        success: false,
        message: 'Failed to update event capacity',
        error: updateError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      redirect_url: event.gform_link || null,
      registration_id: registration.id
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all registrations for current user
 * GET /api/registrations/mine
 * @access Private
 */
export const getMyRegistrations = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Fetch registrations with full event details
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        id,
        event_id,
        registered_at,
        events (
          event_id,
          event_name,
          date_time,
          venue,
          about_event,
          event_highlights,
          requirements,
          available_seats,
          registration_fee,
          category,
          department,
          gform_link
        )
      `)
      .eq('user_id', user_id)
      .order('registered_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch registrations',
        error: error.message
      });
    }

    // Transform data to flatten event details
    const formattedRegistrations = registrations.map(reg => ({
      registration_id: reg.id,
      event_id: reg.event_id,
      registered_at: reg.registered_at,
      event_name: reg.events?.event_name,
      date_time: reg.events?.date_time,
      venue: reg.events?.venue,
      about_event: reg.events?.about_event,
      event_highlights: reg.events?.event_highlights,
      requirements: reg.events?.requirements,
      available_seats: reg.events?.available_seats,
      registration_fee: reg.events?.registration_fee,
      category: reg.events?.category,
      department: reg.events?.department,
      gform_link: reg.events?.gform_link
    }));

    // Sort by event date_time ascending
    formattedRegistrations.sort((a, b) => {
      const dateA = new Date(a.date_time);
      const dateB = new Date(b.date_time);
      return dateA - dateB;
    });

    return res.status(200).json({
      success: true,
      data: formattedRegistrations,
      count: formattedRegistrations.length
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all registrations for a specific event (Organizers only)
 * GET /api/registrations/event/:event_id
 * @access Private (Organizers only - own events)
 */
export const getEventRegistrations = async (req, res) => {
  try {
    const { event_id } = req.params;
    const manager_id = req.user.user_id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    if (!uuidRegex.test(event_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
        error: null
      });
    }

    // Check if event exists and verify ownership
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('event_id, event_name, manager_id')
      .eq('event_id', event_id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        error: eventError?.message || null
      });
    }

    // Verify organizer owns the event
    if (event.manager_id !== manager_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view registrations for your own events',
        error: null
      });
    }

    // Fetch registrations with student details
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select(`
        id,
        registered_at,
        profiles (
          user_id,
          full_name,
          email,
          reg_number,
          department,
          year,
          phone
        )
      `)
      .eq('event_id', event_id)
      .order('registered_at', { ascending: false });

    if (regError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch registrations',
        error: regError.message
      });
    }

    // Format response
    const formattedRegistrations = registrations.map(reg => ({
      registration_id: reg.id,
      full_name: reg.profiles?.full_name || 'N/A',
      email: reg.profiles?.email || 'N/A',
      reg_number: reg.profiles?.reg_number || 'N/A',
      department: reg.profiles?.department || 'N/A',
      year: reg.profiles?.year || 'N/A',
      phone: reg.profiles?.phone || 'N/A',
      registered_at: reg.registered_at
    }));

    return res.status(200).json({
      success: true,
      event_id: event.event_id,
      event_name: event.event_name,
      registrations: formattedRegistrations,
      total_registrations: formattedRegistrations.length
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
