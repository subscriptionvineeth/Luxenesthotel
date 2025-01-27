import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faCheckCircle, 
  faTimes, 
  faCheck,
  faUser 
} from '@fortawesome/free-solid-svg-icons';

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  image_url: string;
}

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
}

interface Booking {
  id: string;
  room_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  status: string;
  total_price: number;
  guests: number;
  guest_name: string;
  phone_number: string;
  users?: {
    email: string;
  };
  guest_details?: {
    email: string;
  };
  roomName?: string;
  roomDescription?: string;
  roomPrice?: number;
  roomCapacity?: number;
  roomAmenities?: string;
  roomImageUrl?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  created_at?: string;
  updated_at?: string;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<Booking | null>(null);
  const [isGuestDetailsOpen, setIsGuestDetailsOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
    console.log('Guest details:',selectedGuest);
  }, []);

  const fetchBookings = async () => {
    try {
      // Get bookings with user data
      const { data: basicBookings, error: basicError } = await supabase
        .from('bookings')
        .select(`
          *,
          users!user_id (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (basicError) {
        console.error('Booking fetch error:', basicError);
        throw basicError;
      }

      console.log('Fetched bookings:', basicBookings); // Debug log

      // Get rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*');

      if (roomsError) throw roomsError;

      const roomMap = new Map(rooms?.map(room => [room.id, room]) || []);

      if (!basicBookings) {
        setBookings([]);
        return;
      }

      const formattedBookings = basicBookings.map(booking => {
        const room = roomMap.get(booking.room_id) || {};
        
        const formatted = {
          ...booking,
          id: booking.id,
          check_in: booking.check_in ? new Date(booking.check_in).toLocaleDateString() : 'Not set',
          check_out: booking.check_out ? new Date(booking.check_out).toLocaleDateString() : 'Not set',
          status: booking.status || 'pending',
          total_price: booking.total_price,
          guests: booking.guests || 1,
          roomName: room?.name || 'Unknown Room',
          roomDescription: room?.description || 'No description',
          roomPrice: room?.price || 0,
          roomCapacity: room?.capacity || 0,
          roomAmenities: Array.isArray(room?.amenities) ? room.amenities.join(', ') : 'None',
          roomImageUrl: room?.image_url || '',
          guestName: booking.guest_name || 'Unknown Guest',
          guestEmail: booking.users?.email || booking.guest_details?.email || 'No Email',
          guestPhone: booking.phone_number || 'No Phone',
          created_at: booking.created_at,
          updated_at: booking.updated_at
        };

        console.log('Formatted booking:', formatted); // Debug log
        return formatted;
      });

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error in fetchBookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleGuestClick = (booking: Booking) => {
    setSelectedGuest(booking);
    setIsGuestDetailsOpen(true);
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state to remove the deleted booking
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'guestName',
      headerName: 'Guest Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <Button
            startIcon={<FontAwesomeIcon icon={faUser} />}
            onClick={() => handleGuestClick(params.row)}
            sx={{
              textTransform: 'none',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.lighter',
              }
            }}
          >
            {params.value}
          </Button>
        </Tooltip>
      ),
    },
    {
      field: 'guestEmail',
      headerName: 'Guest Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'roomName',
      headerName: 'Room',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex flex-col">
          <span>{params.value}</span>
          <span className="text-xs text-gray-500">
            Capacity: {params.row.roomCapacity} | Price: ₹{params.row.roomPrice}
          </span>
        </div>
      ),
    },
    {
      field: 'check_in',
      headerName: 'Check In',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'check_out',
      headerName: 'Check Out',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'guests',
      headerName: 'Guests',
      flex: 1,
      minWidth: 100,
      type: 'number',
    },
    {
      field: 'total_price',
      headerName: 'Total Price',
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => {
        const price = params.value || 0;
        return `₹${price.toFixed(2)}`;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {params.row.status === 'pending' && (
            <>
              <Tooltip title="Confirm Booking">
                <IconButton
                  onClick={() => updateBookingStatus(params.row.id, 'confirmed')}
                  color="success"
                  size="small"
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel Booking">
                <IconButton
                  onClick={() => updateBookingStatus(params.row.id, 'cancelled')}
                  color="error"
                  size="small"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </IconButton>
              </Tooltip>
            </>
          )}
          {params.row.status === 'confirmed' && (
            <>
              <Tooltip title="Mark as Completed">
                <IconButton
                  onClick={() => updateBookingStatus(params.row.id, 'completed')}
                  color="info"
                  size="small"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Delete Booking">
            <IconButton
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this booking?')) {
                  deleteBooking(params.row.id);
                }
              }}
              color="default"
              size="small"
            >
              <FontAwesomeIcon icon={faTrash} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(`Booking ${newStatus} successfully`);
      fetchBookings();
    } catch (error) {
      console.error('Error in updateBookingStatus:', error);
      toast.error('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px' 
        }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        background: 'linear-gradient(45deg, #eaebed, #eaebed)'
      }}>
        <Typography variant="h5" sx={{ color: '#000000', fontWeight: 600 }}>
          Booking Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#000000', mt: 1 }}>
          Manage and track all hotel bookings
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <DataGrid
          rows={bookings}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableColumnFilter
          disableDensitySelector
          disableColumnSelector
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 1.5
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#F9FAFB',
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              color: '#4B5563',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#F9FAFB'
            }
          }}
        />
      </Box>

      <Dialog 
        open={isGuestDetailsOpen} 
        onClose={() => setIsGuestDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(45deg, #f8f8f8, #f8f8f8)',
          color: '#000000'
        }}>
          Guest Details
        </DialogTitle>
        <DialogContent>
          {selectedGuest && (
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Guest Name</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedGuest.guestName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                <p className="mt-1 text-sm text-gray-900">Email: {selectedGuest.guestEmail}</p>
                {selectedGuest.guestPhone && (
                  <p className="mt-1 text-sm text-gray-900">Phone: {selectedGuest.guestPhone}</p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Room Details</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedGuest.roomName}</p>
                <p className="mt-1 text-sm text-gray-500">{selectedGuest.roomDescription}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Capacity: {selectedGuest.roomCapacity} guests | Price: ₹{selectedGuest.roomPrice}/night
                </p>
                <p className="mt-1 text-sm text-gray-500">Amenities: {selectedGuest.roomAmenities}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Booking Details</h4>
                <p className="mt-1 text-sm text-gray-900">Check-in: {selectedGuest.check_in}</p>
                <p className="mt-1 text-sm text-gray-900">Check-out: {selectedGuest.check_out}</p>
                <p className="mt-1 text-sm text-gray-900">{selectedGuest.guests} guest(s)</p>
                <p className="mt-1 text-sm text-gray-900">Total: ₹{selectedGuest.total_price}</p>
              </div>
              <div className="mt-6 flex space-x-3">
                {selectedGuest.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        updateBookingStatus(selectedGuest.id, 'confirmed');
                        setIsGuestDetailsOpen(false);
                      }}
                      variant="contained"
                      color="success"
                    >
                      Confirm
                    </Button>
                    <Button
                      onClick={() => {
                        updateBookingStatus(selectedGuest.id, 'cancelled');
                        setIsGuestDetailsOpen(false);
                      }}
                      variant="contained"
                      color="error"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGuestDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
