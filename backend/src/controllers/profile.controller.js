/**
 * Profile Controller
 * Handles user profile operations
 */

import { supabase, supabaseAdmin } from '../config/supabase.js';

/**
 * Get logged-in user profile
 * GET /api/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Fetch user profile using supabaseAdmin to bypass RLS
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email, full_name, reg_number, department, year, phone_number, role')
      .eq('user_id', user_id)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
        error: error?.message || null
      });
    }

    return res.status(200).json({
      success: true,
      data: profile // Changed from 'profile' to 'data' for consistency
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
 * Update user profile
 * PUT /api/profile/update
 * @access Private
 */
export const updateProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { full_name, department, year, phone_number } = req.body;

    // Validate at least one field is provided
    if (!full_name && !department && !year && !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update',
        error: null
      });
    }

    // Build update object (only include provided fields)
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (department !== undefined) updateData.department = department;
    if (year !== undefined) {
      // Validate year is a number between 1 and 5
      if (isNaN(year) || year < 1 || year > 5) {
        return res.status(400).json({
          success: false,
          message: 'Year must be a number between 1 and 5',
          error: null
        });
      }
      updateData.year = parseInt(year);
    }
    if (phone_number !== undefined) updateData.phone_number = phone_number;

    // Update profile using supabaseAdmin to bypass RLS
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('user_id', user_id);

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update profile',
        error: updateError.message
      });
    }

    // Fetch updated profile
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name, reg_number, department, year, phone_number, role')
      .eq('user_id', user_id)
      .single();

    if (fetchError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch updated profile',
        error: fetchError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
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
 * Get user dashboard statistics
 * GET /api/profile/stats
 * @access Private
 */
export const getProfileStats = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const role = req.user.role;

    // Fetch user role from database if not in JWT
    let userRole = role;
    if (!userRole) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user_id)
        .single();
      userRole = profile?.role;
    }

    if (userRole === 'student') {
      // Student statistics
      // Get all registrations with event details
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select(`
          id,
          registered_at,
          events (
            event_id,
            date_time
          )
        `)
        .eq('user_id', user_id);

      if (regError) {
        return res.status(400).json({
          success: false,
          message: 'Failed to fetch registration statistics',
          error: regError.message
        });
      }

      const now = new Date();
      const total_registered_events = registrations.length;
      const upcoming_events = registrations.filter(reg => 
        new Date(reg.events?.date_time) >= now
      ).length;
      const past_events = registrations.filter(reg => 
        new Date(reg.events?.date_time) < now
      ).length;

      return res.status(200).json({
        success: true,
        role: 'student',
        stats: {
          total_registered_events,
          upcoming_events,
          past_events
        }
      });

    } else if (userRole === 'event_manager') {
      // Event Manager statistics
      // Get all events managed by user
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('event_id, date_time')
        .eq('manager_id', user_id);

      if (eventsError) {
        return res.status(400).json({
          success: false,
          message: 'Failed to fetch event statistics',
          error: eventsError.message
        });
      }

      const now = new Date();
      const total_events_managed = events.length;
      const active_events = events.filter(event => 
        new Date(event.date_time) >= now
      ).length;
      const past_events = events.filter(event => 
        new Date(event.date_time) < now
      ).length;

      // Get total registrations for all managed events
      let total_registrations_received = 0;
      if (events.length > 0) {
        const eventIds = events.map(e => e.event_id);
        const { data: registrations } = await supabase
          .from('registrations')
          .select('id')
          .in('event_id', eventIds);
        
        total_registrations_received = registrations?.length || 0;
      }

      // Calculate success rate (past events with >0 registrations)
      let success_rate = 0;
      if (past_events > 0) {
        const pastEventIds = events
          .filter(event => new Date(event.date_time) < now)
          .map(e => e.event_id);

        if (pastEventIds.length > 0) {
          const { data: pastRegistrations } = await supabase
            .from('registrations')
            .select('event_id')
            .in('event_id', pastEventIds);

          const eventsWithRegistrations = new Set(
            pastRegistrations?.map(r => r.event_id) || []
          ).size;

          success_rate = Math.round((eventsWithRegistrations / past_events) * 100);
        }
      }

      return res.status(200).json({
        success: true,
        role: 'event_manager',
        stats: {
          total_events_managed,
          active_events,
          past_events,
          total_registrations_received,
          success_rate
        }
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role',
        error: null
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get complete profile overview
 * GET /api/profile/overview
 * @access Private
 */
export const getProfileOverview = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name, reg_number, department, year, phone_number, role')
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
        error: profileError?.message || null
      });
    }

    // Fetch registered events
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select(`
        id,
        registered_at,
        events (
          event_id,
          event_name,
          date_time,
          venue,
          about_event,
          category,
          department,
          available_seats,
          registration_fee
        )
      `)
      .eq('user_id', user_id)
      .order('registered_at', { ascending: false });

    if (regError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch registered events',
        error: regError.message
      });
    }

    // Format registered events
    const registered_events = registrations.map(reg => ({
      registration_id: reg.id,
      event_id: reg.events?.event_id,
      event_name: reg.events?.event_name,
      date_time: reg.events?.date_time,
      venue: reg.events?.venue,
      about_event: reg.events?.about_event,
      category: reg.events?.category,
      department: reg.events?.department,
      available_seats: reg.events?.available_seats,
      registration_fee: reg.events?.registration_fee,
      registered_at: reg.registered_at
    }));

    // Sort by event date_time
    registered_events.sort((a, b) => 
      new Date(a.date_time) - new Date(b.date_time)
    );

    // Initialize response
    const response = {
      success: true,
      profile,
      registered_events
    };

    // If user is event manager, fetch organized events
    if (profile.role === 'event_manager') {
      const { data: organizedEvents, error: orgError } = await supabase
        .from('events')
        .select('event_id, event_name, date_time, venue, about_event, category, department, available_seats')
        .eq('manager_id', user_id)
        .order('date_time', { ascending: false });

      if (orgError) {
        return res.status(400).json({
          success: false,
          message: 'Failed to fetch organized events',
          error: orgError.message
        });
      }

      // Get registration counts for each organized event
      const organized_events = await Promise.all(
        organizedEvents.map(async (event) => {
          const { data: registrations } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', event.event_id);

          return {
            event_id: event.event_id,
            event_name: event.event_name,
            date_time: event.date_time,
            venue: event.venue,
            about_event: event.about_event,
            category: event.category,
            department: event.department,
            available_seats: event.available_seats,
            total_registrations: registrations?.length || 0
          };
        })
      );

      // Sort by date_time
      organized_events.sort((a, b) => 
        new Date(a.date_time) - new Date(b.date_time)
      );

      response.organized_events = organized_events;
    }

    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
