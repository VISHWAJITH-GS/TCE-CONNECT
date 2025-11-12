/**
 * Clubs Controller
 * Handles club and club membership operations
 */

import { supabaseAdmin } from '../config/supabase.js';

/**
 * Get all clubs
 * GET /api/clubs
 * @access Public
 */
export const getAllClubs = async (req, res) => {
  try {
    const { data: clubs, error } = await supabaseAdmin
      .from('clubs')
      .select('*')
      .order('club_name', { ascending: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch clubs',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: clubs,
      count: clubs.length
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
 * Get clubs for current user
 * GET /api/clubs/mine
 * @access Private
 */
export const getMyClubs = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Fetch club memberships with full club details
    const { data: memberships, error } = await supabaseAdmin
      .from('club_members')
      .select(`
        id,
        club_id,
        joined_at,
        role,
        clubs (
          club_id,
          club_name,
          club_icon,
          description,
          club_type
        )
      `)
      .eq('user_id', user_id)
      .order('joined_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch your clubs',
        error: error.message
      });
    }

    // Transform data to flatten club details
    const formattedClubs = memberships.map(membership => ({
      membership_id: membership.id,
      club_id: membership.club_id,
      joined_at: membership.joined_at,
      role: membership.role,
      club_name: membership.clubs?.club_name,
      club_icon: membership.clubs?.club_icon,
      description: membership.clubs?.description,
      club_type: membership.clubs?.club_type
    }));

    return res.status(200).json({
      success: true,
      data: formattedClubs,
      count: formattedClubs.length
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
 * Join a club
 * POST /api/clubs/:club_id/join
 * @access Private
 */
export const joinClub = async (req, res) => {
  try {
    const { club_id } = req.params;
    const user_id = req.user.user_id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    if (!uuidRegex.test(club_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid club ID format'
      });
    }

    // Check if club exists
    const { data: club, error: clubError } = await supabaseAdmin
      .from('clubs')
      .select('club_id, club_name')
      .eq('club_id', club_id)
      .single();

    if (clubError || !club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if already a member
    const { data: existingMembership } = await supabaseAdmin
      .from('club_members')
      .select('id')
      .eq('club_id', club_id)
      .eq('user_id', user_id)
      .single();

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this club'
      });
    }

    // Insert membership
    const { data: membership, error: insertError } = await supabaseAdmin
      .from('club_members')
      .insert([{
        club_id,
        user_id,
        role: 'member'
      }])
      .select()
      .single();

    if (insertError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to join club',
        error: insertError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: `Successfully joined ${club.club_name}`,
      membership_id: membership.id
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
 * Leave a club
 * DELETE /api/clubs/:club_id/leave
 * @access Private
 */
export const leaveClub = async (req, res) => {
  try {
    const { club_id } = req.params;
    const user_id = req.user.user_id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    if (!uuidRegex.test(club_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid club ID format'
      });
    }

    // Check if membership exists
    const { data: membership, error: checkError } = await supabaseAdmin
      .from('club_members')
      .select('id, clubs(club_name)')
      .eq('club_id', club_id)
      .eq('user_id', user_id)
      .single();

    if (checkError || !membership) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this club'
      });
    }

    // Delete membership
    const { error: deleteError } = await supabaseAdmin
      .from('club_members')
      .delete()
      .eq('club_id', club_id)
      .eq('user_id', user_id);

    if (deleteError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to leave club',
        error: deleteError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully left the club'
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
 * Get club details by ID
 * GET /api/clubs/:club_id
 * @access Public
 */
export const getClubById = async (req, res) => {
  try {
    const { club_id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    if (!uuidRegex.test(club_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid club ID format'
      });
    }

    const { data: club, error } = await supabaseAdmin
      .from('clubs')
      .select('*')
      .eq('club_id', club_id)
      .single();

    if (error || !club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Get member count
    const { count: memberCount } = await supabaseAdmin
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', club_id);

    return res.status(200).json({
      success: true,
      data: {
        ...club,
        member_count: memberCount || 0
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
