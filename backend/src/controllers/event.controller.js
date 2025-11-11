/**
 * Event Controller
 * Handles CRUD operations for events
 */

import { supabase, supabaseAdmin } from '../config/supabase.js';

/**
 * Get all events with optional filters
 * GET /api/events
 * @access Public
 */
export const getAllEvents = async (req, res) => {
  try {
    const { search, category, department, limit } = req.query;

    // Build query - Use supabaseAdmin to bypass RLS
    let query = supabaseAdmin
      .from('events')
      .select('*, event_organizers(*)');

    // Apply filters
    if (search) {
      query = query.or(`event_name.ilike.%${search}%,about_event.ilike.%${search}%,venue.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (department) {
      query = query.eq('department', department);
    }

    // Order by date_time ascending (upcoming events first)
    query = query.order('date_time', { ascending: true });

    // Apply limit if provided
    if (limit && !isNaN(limit)) {
      query = query.limit(parseInt(limit));
    }

    const { data: events, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch events',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: events,
      count: events.length
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
 * Get single event by ID
 * GET /api/events/:id
 * @access Public
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
        error: null
      });
    }

    const { data: event, error } = await supabase
      .from('events')
      .select('*, event_organizers(*)')
      .eq('event_id', id)
      .single();

    if (error || !event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        error: error?.message || null
      });
    }

    return res.status(200).json({
      success: true,
      data: event
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
 * Create a new event
 * POST /api/events
 * @access Private (Organizers only)
 */
export const createEvent = async (req, res) => {
  try {
    console.log('📝 Create Event Request received');
    console.log('User:', req.user);
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const {
      event_name,
      date_time,
      venue,
      about_event,
      event_highlights,
      requirements,
      available_seats,
      registration_fee,
      gform_link,
      category,
      department,
      organizers // Array of organizer objects: [{ organizer_name, organizer_phone }, ...]
    } = req.body;

    const manager_id = req.user.user_id;

    console.log('Manager ID:', manager_id);

    // Validate required fields
    if (!event_name || !date_time || !venue || !about_event) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: event_name, date_time, venue, about_event',
        error: null
      });
    }

    // Validate available_seats
    if (available_seats && (isNaN(available_seats) || available_seats < 0)) {
      console.log('❌ Validation failed: Invalid available_seats');
      return res.status(400).json({
        success: false,
        message: 'available_seats must be a non-negative number',
        error: null
      });
    }

    // Validate organizers (max 3)
    if (organizers && (!Array.isArray(organizers) || organizers.length > 3)) {
      return res.status(400).json({
        success: false,
        message: 'organizers must be an array with maximum 3 contacts',
        error: null
      });
    }

    // Insert event
    console.log('✅ Validation passed, inserting into database...');
    const { data: newEvent, error: eventError } = await supabaseAdmin
      .from('events')
      .insert([{
        manager_id,
        event_name,
        date_time,
        venue,
        about_event,
        event_highlights: event_highlights || [],
        requirements: requirements || [],
        available_seats: available_seats || 0,
        registration_fee: registration_fee || 0,
        gform_link: gform_link || null
        // Note: category and department columns don't exist in current schema
      }])
      .select()
      .single();

    if (eventError) {
      console.error('❌ Database Error:', eventError);
      console.error('Error details:', JSON.stringify(eventError, null, 2));
      return res.status(400).json({
        success: false,
        message: 'Failed to create event',
        error: eventError.message
      });
    }
    
    console.log('✅ Event inserted successfully:', newEvent.event_id);

    // Insert event organizers (contact persons)
    if (organizers && organizers.length > 0) {
      console.log('➕ Inserting organizers...');
      const organizerRecords = organizers.map(org => ({
        event_id: newEvent.event_id,
        organizer_name: org.organizer_name,
        organizer_phone: org.organizer_phone
      }));

      const { error: orgError } = await supabaseAdmin
        .from('event_organizers')
        .insert(organizerRecords);

      if (orgError) {
        console.error('❌ Organizers insertion failed:', orgError);
        // Rollback: delete the event if organizers insertion fails
        await supabaseAdmin.from('events').delete().eq('event_id', newEvent.event_id);
        
        return res.status(400).json({
          success: false,
          message: 'Failed to add event organizers',
          error: orgError.message
        });
      }
      
      console.log('✅ Organizers inserted successfully');
    }

    console.log('🎉 Event creation completed successfully!');
    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event_id: newEvent.event_id,
      data: newEvent
    });

  } catch (error) {
    console.error('💥 Unexpected error in createEvent:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update an event
 * PUT /api/events/:id
 * @access Private (Organizers only - own events)
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      event_name,
      date_time,
      venue,
      about_event,
      event_highlights,
      requirements,
      available_seats,
      registration_fee,
      gform_link,
      category,
      department,
      organizers
    } = req.body;

    const manager_id = req.user.user_id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
        error: null
      });
    }

    // Check if event exists
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('manager_id')
      .eq('event_id', id)
      .single();

    if (fetchError || !existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        error: fetchError?.message || null
      });
    }

    // Check if user is the event creator
    if (existingEvent.manager_id !== manager_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update your own events',
        error: null
      });
    }

    // Build update object (only include provided fields)
    const updateData = {};
    if (event_name !== undefined) updateData.event_name = event_name;
    if (date_time !== undefined) updateData.date_time = date_time;
    if (venue !== undefined) updateData.venue = venue;
    if (about_event !== undefined) updateData.about_event = about_event;
    if (event_highlights !== undefined) updateData.event_highlights = event_highlights;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (available_seats !== undefined) updateData.available_seats = available_seats;
    if (registration_fee !== undefined) updateData.registration_fee = registration_fee;
    if (gform_link !== undefined) updateData.gform_link = gform_link;
    if (category !== undefined) updateData.category = category;
    if (department !== undefined) updateData.department = department;

    // Update event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('event_id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update event',
        error: updateError.message
      });
    }

    // Update organizers if provided
    if (organizers !== undefined) {
      // Validate organizers
      if (!Array.isArray(organizers) || organizers.length > 3) {
        return res.status(400).json({
          success: false,
          message: 'organizers must be an array with maximum 3 contacts',
          error: null
        });
      }

      // Delete old organizers
      await supabase
        .from('event_organizers')
        .delete()
        .eq('event_id', id);

      // Insert new organizers
      if (organizers.length > 0) {
        const organizerRecords = organizers.map(org => ({
          event_id: id,
          organizer_name: org.organizer_name,
          organizer_phone: org.organizer_phone
        }));

        const { error: orgError } = await supabase
          .from('event_organizers')
          .insert(organizerRecords);

        if (orgError) {
          return res.status(400).json({
            success: false,
            message: 'Failed to update event organizers',
            error: orgError.message
          });
        }
      }
    }

    // Fetch updated event with organizers
    const { data: finalEvent } = await supabase
      .from('events')
      .select('*, event_organizers(*)')
      .eq('event_id', id)
      .single();

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: finalEvent
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
 * Delete an event
 * DELETE /api/events/:id
 * @access Private (Organizers only - own events)
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const manager_id = req.user.user_id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
        error: null
      });
    }

    // Check if event exists and verify ownership
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('manager_id')
      .eq('event_id', id)
      .single();

    if (fetchError || !existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        error: fetchError?.message || null
      });
    }

    // Check if user is the event creator
    if (existingEvent.manager_id !== manager_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own events',
        error: null
      });
    }

    // Delete event (cascade will handle event_organizers)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('event_id', id);

    if (deleteError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete event',
        error: deleteError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
