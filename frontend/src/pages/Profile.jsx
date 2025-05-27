import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const { user } = useSelector((state) => state.auth);
  
  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Make sure to use the correct endpoint
      const response = await axios.get('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        password: '',
        confirmPassword: ''
      });
      
      if (response.data.profileImage) {
        setImagePreview(response.data.profileImage);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again later.');
      setLoading(false);
      toast.error('Error loading profile');
    }
  };
  
  useEffect(() => {
    if (user && user.token) {
      fetchUserProfile();
    }
  }, [user]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match if changing password
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      // Create form data for multipart/form-data (for image upload)
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('email', formData.email);
      
      if (formData.password) {
        updateData.append('password', formData.password);
      }
      
      if (profileImage) {
        updateData.append('profileImage', profileImage);
      }
      
      const response = await axios.put('/api/users/profile', updateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setProfile(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }
  
  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">User Profile</h1>
      
      <div className="p-6 rounded-lg shadow-md bg-base-200">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-4">
            <div className="avatar">
              <div className="w-24 rounded-full ring ring-offset-2 ring-primary ring-offset-base-100">
                <img 
                  src={imagePreview || 'https://via.placeholder.com/150'} 
                  alt="Profile" 
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Profile Image</label>
            <input 
              type="file" 
              className="w-full file-input file-input-bordered" 
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full input input-bordered" 
              required 
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full input input-bordered" 
              required 
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">New Password (leave blank to keep current)</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full input input-bordered" 
            />
          </div>
          
          <div className="mb-6">
            <label className="block mb-2">Confirm New Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              className="w-full input input-bordered" 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full btn btn-primary"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
