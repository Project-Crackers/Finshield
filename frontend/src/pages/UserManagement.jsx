import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { FaUserEdit, FaTrash, FaSpinner, FaUserCog } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setLoading(false);
    }
  };
  
 useEffect(() => {
  if (currentUser && currentUser.token) {
    fetchUsers();
  }
}, [currentUser]);

  
  const handleEditUser = (user) => {
    setSelectedUser({
      ...user,
      password: '' // Don't include password in edit form
    });
    setIsEditing(true);
  };
  
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };
  
  const handleChange = (e) => {
    setSelectedUser({
      ...selectedUser,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(`/api/users/${selectedUser._id}`, {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        password: selectedUser.password || undefined
      }, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      
      // Update the user in the list
      setUsers(users.map(user => 
        user._id === selectedUser._id ? response.data : user
      ));
      
      setIsEditing(false);
      setSelectedUser(null);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">User Management</h1>
        <p className="text-base-content/70">
          Manage user accounts and permissions
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="shadow-xl card bg-base-200">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="badge badge-primary">{user.role}</span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="btn btn-sm btn-outline btn-info"
                          >
                            <FaUserEdit />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="btn btn-sm btn-outline btn-error"
                            disabled={user._id === currentUser.id || user._id === currentUser._id}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {isEditing && selectedUser && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-md rounded-lg shadow-xl bg-base-100">
            <h2 className="flex items-center mb-4 text-xl font-bold">
              <FaUserCog className="mr-2" /> Edit User
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4 form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={selectedUser.name}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>
              
              <div className="mb-4 form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={selectedUser.email}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>
              
              <div className="mb-4 form-control">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  name="role"
                  value={selectedUser.role}
                  onChange={handleChange}
                  className="select select-bordered"
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
              
              <div className="mb-6 form-control">
                <label className="label">
                  <span className="label-text">New Password (leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={selectedUser.password}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedUser(null);
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;