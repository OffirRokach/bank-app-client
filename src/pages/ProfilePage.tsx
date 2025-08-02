import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import type { UserUpdatableFields } from "../types";
import { Input } from "../components/ui/inputBox";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout, firstName } = useAuth();

  const { profile, isLoading, updateProfile } = useProfile();

  // State for profile form values
  const [formValues, setFormValues] = useState<
    UserUpdatableFields & {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    }
  >({});

  // State for editable fields
  const [editableFields, setEditableFields] = useState<Record<string, boolean>>(
    {
      firstName: false,
      lastName: false,
      email: false,
      phoneNumber: false,
      password: false,
    }
  );

  // Initialize form values when profile loads
  useEffect(() => {
    if (profile) {
      setFormValues({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [profile]);

  // Toggle edit mode for a field
  const toggleEditMode = (field: string) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    // Update form values without causing re-render that loses focus
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle password edit mode
  const togglePasswordEditMode = () => {
    setEditableFields((prev) => ({
      ...prev,
      password: !prev.password,
    }));

    // Reset password fields when toggling
    if (!editableFields.password) {
      setFormValues((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      // Validate password fields if password is being changed
      if (editableFields.password) {
        if (!formValues.currentPassword) {
          toast.error("Current password is required");
          return;
        }

        if (formValues.newPassword !== formValues.confirmPassword) {
          toast.error("New passwords don't match");
          return;
        }

        if (formValues.newPassword && formValues.newPassword.length < 8) {
          toast.error("Password must be at least 8 characters");
          return;
        }
      }

      // Create update payload
      const updatePayload = { ...formValues };

      // Only include password fields if password is being changed
      if (!editableFields.password) {
        delete updatePayload.currentPassword;
        delete updatePayload.newPassword;
        delete updatePayload.confirmPassword;
      } else if (!updatePayload.newPassword) {
        // If no new password is provided, don't send password fields
        delete updatePayload.currentPassword;
        delete updatePayload.newPassword;
        delete updatePayload.confirmPassword;
      }

      const result = await updateProfile(updatePayload);

      if (result.success) {
        // Reset all edit modes
        setEditableFields({
          firstName: false,
          lastName: false,
          email: false,
          phoneNumber: false,
          occupation: false,
          streetAddress: false,
          city: false,
          zipCode: false,
          country: false,
          password: false,
        });
        toast.success(result.message || "Profile updated successfully");
      }
    } catch (error: any) {

      // Show error message from API if available
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update profile");
      }
    }
  };

  // Edit icon component
  const EditIcon = ({ onClick }: { onClick: () => void }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 ml-2 cursor-pointer text-white/60 hover:text-white transition-colors"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      onClick={onClick}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );

  // Editable field component
  const EditableField = ({
    label,
    value,
    field,
    isEditing,
  }: {
    label: string;
    value: string | undefined;
    field: string;
    isEditing: boolean;
  }) => {
    // Use a ref to maintain focus
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus the input when editing mode is enabled
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEditing]);

    return (
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <p className="text-white/60 text-sm">{label}</p>
          {isEditing ? (
            <Input
              type="text"
              value={
                (formValues[field as keyof typeof formValues] as string) || ""
              }
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="mt-1"
              ref={inputRef}
            />
          ) : (
            <p className="text-white text-lg">{value || "Not provided"}</p>
          )}
        </div>
        <EditIcon onClick={() => toggleEditMode(field)} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900">
      {/* Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div
                className="text-white text-xl font-bold cursor-pointer"
                onClick={() => navigate("/dashboard")}
              >
                Aurora
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors mr-2"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-2xl font-bold">
            {firstName}'s Profile
          </h1>
        </div>

        {/* Profile Content */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-xl overflow-hidden mb-8">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="p-6">
              <div className="bg-white/5 rounded-lg p-6">
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-white text-lg font-medium mb-4">
                      Personal Details
                    </h3>
                    <div className="space-y-4">
                      <EditableField
                        label="First Name"
                        value={profile?.firstName}
                        field="firstName"
                        isEditing={editableFields.firstName}
                      />
                      <EditableField
                        label="Last Name"
                        value={profile?.lastName}
                        field="lastName"
                        isEditing={editableFields.lastName}
                      />
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <p className="text-white/60 text-sm">Email</p>
                          {editableFields.email ? (
                            <div className="mt-1">
                              <Input
                                type="email"
                                value={formValues.email || ""}
                                onChange={(e) =>
                                  handleInputChange("email", e.target.value)
                                }
                                autoFocus
                              />
                            </div>
                          ) : (
                            <p className="text-white text-lg">
                              {profile?.email}
                            </p>
                          )}
                        </div>
                        <EditIcon onClick={() => toggleEditMode("email")} />
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <p className="text-white/60 text-sm">Password</p>
                          {editableFields.password ? (
                            <div className="space-y-2 mt-1">
                              <Input
                                type="password"
                                placeholder="Current Password"
                                value={formValues.currentPassword || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "currentPassword",
                                    e.target.value
                                  )
                                }
                                autoFocus
                              />
                              <Input
                                type="password"
                                placeholder="New Password"
                                value={formValues.newPassword || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "newPassword",
                                    e.target.value
                                  )
                                }
                              />
                              <Input
                                type="password"
                                placeholder="Confirm New Password"
                                value={formValues.confirmPassword || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "confirmPassword",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ) : (
                            <p className="text-white text-lg">••••••••</p>
                          )}
                        </div>
                        <EditIcon onClick={togglePasswordEditMode} />
                      </div>
                      <EditableField
                        label="Phone Number"
                        value={profile?.phoneNumber}
                        field="phoneNumber"
                        isEditing={editableFields.phoneNumber}
                      />
                      
                      {/* Birth Date (read-only) */}
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <p className="text-white/80 text-sm">Birth Date</p>
                          <p className="text-white text-lg">
                            {profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString() : 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address information section removed as per updated User model */}
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="mt-6 border-t border-white/10 pt-6">
                <button
                  onClick={handleSaveChanges}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
