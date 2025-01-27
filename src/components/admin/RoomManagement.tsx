import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
}

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCapacity, setEditCapacity] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      console.log('Fetching rooms...');
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rooms:', error);
        throw error;
      }

      console.log('Raw rooms data:', data);
      
      if (data) {
        setRooms(data.map(room => ({
          ...room,
          price: parseFloat(room.price) || 0,
          capacity: parseInt(room.capacity) || 1
        })));
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (room: Room) => {
    console.log('Editing room:', room);
    setEditRoom(room);
    setEditName(room.name || '');
    setEditDescription(room.description || '');
    setEditPrice(room.price?.toString() || '0');
    setEditCapacity(room.capacity?.toString() || '1');
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editRoom) return;

    try {
      const updates = {
        name: editName.trim(),
        description: editDescription.trim(),
        price: parseFloat(editPrice) || 0,
        capacity: parseInt(editCapacity) || 1
      };

      console.log('Updating room with values:', {
        id: editRoom.id,
        ...updates
      });

      const { error: updateError } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', editRoom.id);

      if (updateError) {
        console.error('Error updating room:', updateError);
        throw updateError;
      }

      toast.success('Room updated successfully');
      setIsEditDialogOpen(false);
      fetchRooms(); // Refresh the rooms list
    } catch (error) {
      console.error('Error updating room:', error);
      if (error instanceof Error) {
        toast.error(`Failed to update room: ${error.message}`);
      } else if (typeof error === 'object' && error !== null) {
        // @ts-ignore
        toast.error(`Failed to update room: ${error.message || 'Unknown error'}`);
      } else {
        toast.error('Failed to update room');
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'price',
      headerName: 'Price',
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => {
        const price = params.value || 0;
        return `₹${price.toLocaleString('en-IN')}`;
      },
    },
    {
      field: 'capacity',
      headerName: 'Capacity',
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => {
        const guests = params.value || 1;
        return `${guests} guest${guests > 1 ? 's' : ''}`;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <button
          onClick={() => handleEditClick(params.row)}
          className="text-blue-600 hover:text-blue-900"
        >
          Edit
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Room</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                name="capacity"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Size (sqft)</label>
              <input
                type="number"
                name="size"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amenities (comma-separated)
            </label>
            <input
              type="text"
              name="amenities"
              placeholder="WiFi, TV, Air Conditioning"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image URLs (comma-separated)
            </label>
            <input
              type="text"
              name="images"
              placeholder="http://image1.jpg, http://image2.jpg"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Add Room
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Room List</h3>
        </div>
        <Box sx={{ width: '100%', height: '100%', p: 2 }}>
          <DataGrid
            rows={rooms}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
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
                borderBottom: '1px solid #E5E7EB',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: '500',
                color: '#6B7280',
              },
            }}
          />
        </Box>
      </div>

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Room</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <TextField
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Price"
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <span className="text-gray-500 mr-1">₹</span>,
              }}
            />
            <TextField
              label="Capacity"
              type="number"
              value={editCapacity}
              onChange={(e) => setEditCapacity(e.target.value)}
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
