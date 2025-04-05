class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.toggles = ['themeToggle', 'cacheToggle', 'emailToggle', 'alertsToggle', 'analyticsToggle', 'historyToggle'];
        this.currentColorScheme = this.settings.colorScheme || 'blue';
        this.applyColorScheme(this.currentColorScheme);
    }

    loadSettings() {
        try {
            return JSON.parse(localStorage.getItem('userSettings')) || {
                theme: false,
                colorScheme: 'blue',
                updateFrequency: 'daily',
                cacheEnabled: false,
                emailNotifications: false,
                dataAlerts: false,
                shareAnalytics: false,
                storeHistory: false
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {};
        }
    }

    initializeUI() {
        // Initialize toggle switches
        this.toggles.forEach(id => {
            const toggle = document.getElementById(id);
            if (toggle) {
                const isActive = this.settings[id] || (id === 'themeToggle' && this.settings.theme);
                this.updateToggleState(toggle, isActive);
                toggle.addEventListener('click', () => this.handleToggleClick(toggle, id));
            }
        });

        // Initialize select inputs
        ['colorScheme', 'updateFrequency'].forEach(id => {
            const select = document.getElementById(id);
            if (select && this.settings[id]) {
                select.value = this.settings[id];
            }
        });

        // Add color scheme change handler
        const colorSchemeSelect = document.getElementById('colorScheme');
        if (colorSchemeSelect) {
            colorSchemeSelect.value = this.currentColorScheme;
            colorSchemeSelect.addEventListener('change', (e) => {
                this.currentColorScheme = e.target.value;
                this.applyColorScheme(e.target.value);
                // Save the color scheme immediately
                this.settings.colorScheme = e.target.value;
                localStorage.setItem('userSettings', JSON.stringify(this.settings));
            });
        }

        // Save button handler
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        // Apply current color scheme
        this.applyColorScheme(this.currentColorScheme);
    }

    updateToggleState(toggle, isActive) {
        toggle.classList.toggle('bg-blue-600', isActive);
        toggle.classList.toggle('bg-gray-200', !isActive);
        const dot = toggle.querySelector('.settings-switch-dot');
        if (dot) {
            dot.classList.toggle('translate-x-6', isActive);
        }
    }

    handleToggleClick(toggle, id) {
        const isActive = !toggle.classList.contains('bg-blue-600');
        this.updateToggleState(toggle, isActive);
        
        if (id === 'themeToggle') {
            this.handleThemeChange(isActive);
        }
    }

    handleThemeChange(isDark) {
        document.documentElement.classList.toggle('dark', isDark);
        const event = new CustomEvent('themeChange', { detail: { isDark } });
        document.dispatchEvent(event);
    }

    applyColorScheme(scheme) {
        const root = document.documentElement;
        const colors = this.getSchemeColors(scheme);
        
        // Remove existing color scheme classes
        root.classList.remove('theme-blue', 'theme-purple', 'theme-green', 'theme-indigo');
        
        // Add new color scheme class
        root.classList.add(`theme-${scheme}`);
        
        // Update CSS variables
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        // Update UI elements
        document.querySelectorAll('.settings-card').forEach(card => {
            card.style.borderLeftColor = colors.primary;
        });

        // Store the current scheme
        this.currentColorScheme = scheme;
        localStorage.setItem('colorScheme', scheme);
    }

    getSchemeColors(scheme) {
        const schemes = {
            blue: {
                primary: '#3B82F6',
                secondary: '#60A5FA',
                accent: '#2563EB',
                hover: '#1D4ED8',
                text: '#1E40AF'
            },
            purple: {
                primary: '#8B5CF6',
                secondary: '#A78BFA',
                accent: '#7C3AED',
                hover: '#6D28D9',
                text: '#5B21B6'
            },
            green: {
                primary: '#10B981',
                secondary: '#34D399',
                accent: '#059669',
                hover: '#047857',
                text: '#065F46'
            },
            indigo: {
                primary: '#6366F1',
                secondary: '#818CF8',
                accent: '#4F46E5',
                hover: '#4338CA',
                text: '#3730A3'
            }
        };
        return schemes[scheme] || schemes.blue;
    }

    updateCustomProperties(colors) {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-secondary', colors.secondary);
        root.style.setProperty('--color-accent', colors.accent);
        root.style.setProperty('--color-hover', colors.hover);
    }

    saveSettings() {
        try {
            const newSettings = {
                theme: document.getElementById('themeToggle').classList.contains('bg-blue-600'),
                colorScheme: this.currentColorScheme,
                updateFrequency: document.getElementById('updateFrequency').value,
                cacheEnabled: document.getElementById('cacheToggle').classList.contains('bg-blue-600'),
                emailNotifications: document.getElementById('emailToggle').classList.contains('bg-blue-600'),
                dataAlerts: document.getElementById('alertsToggle').classList.contains('bg-blue-600'),
                shareAnalytics: document.getElementById('analyticsToggle').classList.contains('bg-blue-600'),
                storeHistory: document.getElementById('historyToggle').classList.contains('bg-blue-600')
            };

            localStorage.setItem('userSettings', JSON.stringify(newSettings));
            this.settings = newSettings;
            this.showToast('Settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Error saving settings', 'error');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-fade-in`;
        
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle mr-2"></i>
            ${message}
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('animate-fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const settingsManager = new SettingsManager();
    settingsManager.initializeUI();
});