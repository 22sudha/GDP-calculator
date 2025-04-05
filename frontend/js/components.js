// Component loader utility

/**
 * Loads HTML components into specified container elements
 * @param {string} path - Path to the HTML component file
 * @param {string} containerId - ID of the container element
 * @returns {Promise} - Promise that resolves when component is loaded
 */
async function loadComponent(path, containerId) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = data;
        } else {
            console.error(`Container with ID '${containerId}' not found`);
        }
    } catch (error) {
        console.error(`Error loading ${path}:`, error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="text-red-500">Error loading component</div>`;
        }
    }
}

/**
 * Loads multiple components at once
 * @param {Object[]} components - Array of component objects with path and containerId
 * @returns {Promise} - Promise that resolves when all components are loaded
 */
async function loadComponents(components) {
    try {
        for (const component of components) {
            await loadComponent(component.path, component.containerId);
        }
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Default components that most pages use
    loadComponents([
        { path: 'include/navbar.html', containerId: 'navbar-container' },
        { path: 'include/footer.html', containerId: 'footer-container' }
    ]);
});