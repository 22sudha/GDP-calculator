// Profile Management Script

document.addEventListener('DOMContentLoaded', () => {
    // Load components
    Promise.all([
        fetch('include/navbar.html').then(response => response.text()),
        fetch('include/footer.html').then(response => response.text())
    ])
    .then(([navbar, footer]) => {
        document.getElementById('navbar-container').innerHTML = navbar;
        document.getElementById('footer-container').innerHTML = footer;
    });

    // Initialize profile form
    initProfileForm();
    
    // Load profile data
    loadProfileData();
});

// Initialize profile form and event listeners
function initProfileForm() {
    // Profile image preview
    const profileImageInput = document.getElementById('profileImage');
    if (profileImageInput) {
        profileImageInput.addEventListener('change', handleProfileImageChange);
    }

    // Form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
}

// Handle profile image change
async function handleProfileImageChange(e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profilePreview').src = e.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);

        // Upload the image to the server
        await uploadProfileImage(e.target.files[0]);
    }
}

// Upload profile image to server
async function uploadProfileImage(imageFile) {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch('/api/profile/image', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.status === 'success') {
            console.log('Image uploaded successfully:', result.path);
        } else {
            console.error('Error uploading image:', result.error);
        }
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

// Handle profile form submission
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        firstName: e.target.querySelector('input[placeholder="First Name"]').value,
        lastName: e.target.querySelector('input[placeholder="Last Name"]').value,
        email: e.target.querySelector('input[type="email"]').value,
        organization: e.target.querySelector('input[placeholder="Organization"]').value,
        bio: e.target.querySelector('textarea').value,
        preferences: {
            emailNotifications: document.getElementById('emailNotifications').checked,
            publicProfile: document.getElementById('publicProfile').checked
        }
    };

    // Save profile data
    const success = await saveProfileData(formData);
    
    if (success) {
        alert('Profile updated successfully!');
    } else {
        alert('Failed to update profile. Please try again.');
    }
}

// Save profile data to server
async function saveProfileData(profileData) {
    try {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });

        const result = await response.json();
        return result.status === 'success';
    } catch (error) {
        console.error('Error saving profile data:', error);
        return false;
    }
}

// Load profile data from server
async function loadProfileData() {
    try {
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('No profile data found');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const profileData = await response.json();
        
        // Populate form with profile data
        populateProfileForm(profileData);
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

// Populate profile form with data
function populateProfileForm(profileData) {
    // Set text inputs
    const firstNameInput = document.querySelector('input[placeholder="First Name"]');
    const lastNameInput = document.querySelector('input[placeholder="Last Name"]');
    const emailInput = document.querySelector('input[type="email"]');
    const organizationInput = document.querySelector('input[placeholder="Organization"]');
    const bioTextarea = document.querySelector('textarea');

    if (firstNameInput && profileData.firstName) firstNameInput.value = profileData.firstName;
    if (lastNameInput && profileData.lastName) lastNameInput.value = profileData.lastName;
    if (emailInput && profileData.email) emailInput.value = profileData.email;
    if (organizationInput && profileData.organization) organizationInput.value = profileData.organization;
    if (bioTextarea && profileData.bio) bioTextarea.value = profileData.bio;

    // Set checkboxes
    if (profileData.preferences) {
        const emailNotifications = document.getElementById('emailNotifications');
        const publicProfile = document.getElementById('publicProfile');

        if (emailNotifications && profileData.preferences.emailNotifications !== undefined) {
            emailNotifications.checked = profileData.preferences.emailNotifications;
        }
        
        if (publicProfile && profileData.preferences.publicProfile !== undefined) {
            publicProfile.checked = profileData.preferences.publicProfile;
        }
    }

    // Set profile image if available
    if (profileData.imagePath) {
        const profilePreview = document.getElementById('profilePreview');
        if (profilePreview) {
            profilePreview.src = profileData.imagePath;
        }
    }
}