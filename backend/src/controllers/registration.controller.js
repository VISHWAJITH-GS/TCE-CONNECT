/**
 * Registration Controller
 * Handles event registration operations
 */

import { supabaseAdmin } from '../config/supabase.js';

/**
 * Register for an event
 * POST /api/registrations/:event_id
 * @access Private (Students only)
 */
export const registerForEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const user_id = req.user.user_id;
    const { full_name, reg_number, year, department, section, phone } = req.body;

    // Validate required fields
    if (!full_name || !reg_number || !year || !department || !section || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: full_name, reg_number, year, department, section, phone',
        error: null
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    if (!uuidRegex.test(event_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
        error: null
      });
    }

    // Validate phone number (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Please enter a valid 10-digit mobile number',
        error: null
      });
    }

    // Check if event exists and get details
    const { data: event, error: eventError } = await supabaseAdmin
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

    // Check current registration count
    const { count: currentRegistrations, error: countError } = await supabaseAdmin
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event_id);

    if (countError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to check event capacity',
        error: countError.message
      });
    }

    // Check if seats are available
    if (currentRegistrations >= event.available_seats) {
      return res.status(400).json({
        success: false,
        message: 'No seats available for this event',
        error: null
      });
    }

    // Check if user is already registered
    const { data: existingRegistration, error: checkError } = await supabaseAdmin
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

    // Insert registration with student details
    const { data: registration, error: insertError } = await supabaseAdmin
      .from('registrations')
      .insert([{
        event_id,
        user_id,
        full_name,
        reg_number,
        year,
        department,
        section,
        phone
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

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
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

    console.log('📋 Fetching registrations for user:', user_id);

    // Fetch registrations with full event details
    const { data: registrations, error } = await supabaseAdmin
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
          gform_link
        )
      `)
      .eq('user_id', user_id)
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching registrations:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch registrations',
        error: error.message
      });
    }

    console.log(`✅ Found ${registrations?.length || 0} registrations`);

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
    const { data: event, error: eventError } = await supabaseAdmin
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

    // Try fetching registrations with new schema first (without joining profiles for email)
    let { data: registrations, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('id, full_name, reg_number, year, department, section, phone, registered_at, user_id')
      .eq('event_id', event_id)
      .order('registered_at', { ascending: false });

    // If new columns don't exist, fallback to old schema with profile data
    if (regError && (regError.message.includes('column') || regError.code === '42703')) {
      console.log('⚠️ New columns not found, using fallback to profile data');
      const fallbackResult = await supabaseAdmin
        .from('registrations')
        .select(`
          id,
          registered_at,
          user_id,
          profiles!inner (
            email,
            full_name,
            reg_number,
            year,
            department,
            phone
          )
        `)
        .eq('event_id', event_id)
        .order('registered_at', { ascending: false });

      registrations = fallbackResult.data;
      regError = fallbackResult.error;

      if (!fallbackResult.error && registrations) {
        console.log(`✅ Found ${registrations.length} registrations (using profile data)`);
        
        // Format with profile data
        const formattedRegistrations = registrations.map(reg => ({
          registration_id: reg.id,
          full_name: reg.profiles?.full_name || 'N/A',
          email: reg.profiles?.email || 'N/A',
          reg_number: reg.profiles?.reg_number || 'N/A',
          department: reg.profiles?.department || 'N/A',
          year: reg.profiles?.year?.toString() || 'N/A',
          section: 'N/A', // Not available in old schema
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
      }
    }

    if (regError) {
      console.error('❌ Error fetching registrations:', regError);
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch registrations',
        error: regError.message
      });
    }

    console.log(`✅ Found ${registrations?.length || 0} registrations for event ${event_id}`);

    // Get emails separately from profiles table for new schema
    const userIds = registrations.map(reg => reg.user_id);
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email')
      .in('user_id', userIds);

    const emailMap = {};
    if (profiles) {
      profiles.forEach(profile => {
        emailMap[profile.user_id] = profile.email;
      });
    }

    // Format response with new schema data
    const formattedRegistrations = registrations.map(reg => ({
      registration_id: reg.id,
      full_name: reg.full_name || 'N/A',
      email: emailMap[reg.user_id] || 'N/A',
      reg_number: reg.reg_number || 'N/A',
      department: reg.department || 'N/A',
      year: reg.year || 'N/A',
      section: reg.section || 'N/A',
      phone: reg.phone || 'N/A',
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
