import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Lock, UserCog, Eye, EyeOff, Save } from 'lucide-react';
import userapiServices from '../../services/userapiServices';
import Loader from '../../components/Loader/Loader';
import Swal from 'sweetalert2';

const AdminSettings = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userapiServices.getMyProfile();
      setProfile(data);
      setProfileForm({
        name: data.name || '',
        email: data.email || ''
      });
    } catch (error) {
      console.error("Failed to fetch profile", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load profile data.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      return Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Name and email are required.'
      });
    }

    try {
      setIsUpdatingProfile(true);
      const res = await userapiServices.updateProfile({
        name: profileForm.name,
        email: profileForm.email
      });
      setProfile(res.user);
      
      // Update local storage if user updates own info
      const user = JSON.parse(localStorage.getItem('user'));
      if(user) {
         user.name = res.user.name;
         user.email = res.user.email;
         localStorage.setItem('user', JSON.stringify(user));
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Profile updated successfully.',
        confirmButtonColor: '#4f46e5'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      return Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password must be at least 6 characters long.'
      });
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Passwords do not match.'
      });
    }

    try {
      setIsUpdatingPassword(true);
      await userapiServices.updatePassword(passwordForm.newPassword);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Password updated successfully.',
        confirmButtonColor: '#4f46e5'
      });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update password.'
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full flex-1">
        <Loader message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="p-8 w-full flex-1 flex flex-col overflow-y-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <UserCog className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Settings</h1>
          </div>
          <p className="text-slate-500 ml-[3.25rem]">Manage your personal information and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
          
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-indigo-50 p-2 rounded-full mt-1">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
                <p className="text-sm text-slate-500">Update your profile details</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 flex-1 flex flex-col">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Display Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="pl-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="pl-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Role (Read Only) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role (Read-Only)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Admin'}
                    className="pl-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end mt-auto">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-indigo-50 p-2 rounded-full mt-1">
                <Lock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
                <p className="text-sm text-slate-500">Ensure your account stays secure</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 flex-1 flex flex-col">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="pl-10 pr-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="pl-10 pr-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end mt-auto">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
    </div>
  );
};

export default AdminSettings;
