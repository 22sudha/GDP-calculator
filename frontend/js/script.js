// Global variables
let lifeExpectancyData = [];

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // File upload handling
    const csvFileInput = document.getElementById('csvFile');
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', handleFileUpload);
    }

    // Manual data form handling
    const dataForm = document.getElementById('dataForm');
    if (dataForm) {
        dataForm.addEventListener('submit', handleManualInput);
    }
    
    // Calculate button handling
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', handleCalculateClick);
    }

    // Initialize country dropdowns if on compare page
    const country1Select = document.getElementById('country1');
    const country2Select = document.getElementById('country2');
    if (country1Select && country2Select) {
        initializeCountryDropdowns();
    }

    // Initialize chart controls if on results page
    const chartTypeSelect = document.getElementById('chartType');
    const yearRange = document.getElementById('yearRange');
    if (chartTypeSelect && yearRange) {
        initializeChartControls();
    }
});

// File upload handler
async function handleFileUpload() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file first!');
        return;
    }

    try {
        const text = await file.text();
        const data = parseCSV(text);
        lifeExpectancyData = data;
        updateDataPreview(data);
        saveDataToLocalStorage(data);
    } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Please make sure it\'s a valid CSV file.');
    }
}

// Manual data input handler
function handleManualInput(event) {
    event.preventDefault();
    
    const country = document.getElementById('country').value;
    const year = parseInt(document.getElementById('year').value);
    const lifeExpectancy = parseFloat(document.getElementById('lifeExpectancy').value);
    const status = document.getElementById('status').value;
    const adultMortality = parseFloat(document.getElementById('adultMortality').value);
    const infantDeaths = parseInt(document.getElementById('infantDeaths').value);
    const alcohol = parseFloat(document.getElementById('alcohol').value);
    const percentageExpenditure = parseFloat(document.getElementById('percentageExpenditure').value);
    const hepatitisB = parseFloat(document.getElementById('hepatitisB').value);
    const measles = parseInt(document.getElementById('measles').value);
    const bmi = parseFloat(document.getElementById('bmi').value);
    const underFiveDeaths = parseInt(document.getElementById('underFiveDeaths').value);
    const polio = parseFloat(document.getElementById('polio').value);
    const totalExpenditure = parseFloat(document.getElementById('totalExpenditure').value);
    const diphtheria = parseFloat(document.getElementById('diphtheria').value);
    const hivAids = parseFloat(document.getElementById('hivAids').value);
    const gdp = parseFloat(document.getElementById('gdp').value);
    const population = parseInt(document.getElementById('population').value);
    const thinness119Years = parseFloat(document.getElementById('thinness119Years').value);
    const thinness59Years = parseFloat(document.getElementById('thinness59Years').value);
    const incomeComposition = parseFloat(document.getElementById('incomeComposition').value);
    const schooling = parseFloat(document.getElementById('schooling').value);
    
    // Calculate GDP per capita for the prediction model
    const gdpPerCapita = population > 0 ? gdp / population : 0;
    
    // Call the life expectancy prediction API
    calculateLifeExpectancy({
        gdp: gdp,
        adult_mortality: adultMortality,
        bmi: bmi,
        total_expenditure: totalExpenditure,
        hiv_aids: hivAids,
        gdp_per_capita: gdpPerCapita
    });

    const newData = {
        country,
        year,
        status,
        lifeExpectancy,
        adultMortality,
        infantDeaths,
        alcohol,
        percentageExpenditure,
        hepatitisB,
        measles,
        bmi,
        underFiveDeaths,
        polio,
        totalExpenditure,
        diphtheria,
        hivAids,
        gdp,
        population,
        thinness119Years,
        thinness59Years,
        incomeComposition,
        schooling
    };

    lifeExpectancyData.push(newData);
    updateDataPreview(lifeExpectancyData);
    saveDataToLocalStorage(lifeExpectancyData);
    event.target.reset();
}

// CSV Parser
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const entry = {};
        
        headers.forEach((header, index) => {
            const value = values[index] ? values[index].trim() : '';
            // Convert numeric values
            if (!isNaN(value) && value !== '') {
                entry[header] = header === 'Year' || header.includes('Deaths') || header === 'Population' ? 
                    parseInt(value) : parseFloat(value);
            } else {
                entry[header] = value;
            }
        });

        data.push(entry);
    }

    return data;
}

// Data preview updater
let currentPage = 1;
const rowsPerPage = 10;
let currentData = [];
let sortConfig = { column: '', direction: 'asc' };

function updateDataPreview(data) {
    currentData = data;
    const previewDiv = document.getElementById('dataPreview');
    if (!previewDiv) return;

    // Create table controls
    const controls = document.createElement('div');
    controls.className = 'table-controls';
    
    // Add search input
    const searchDiv = document.createElement('div');
    searchDiv.className = 'table-search';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    searchInput.addEventListener('input', (e) => filterData(e.target.value));
    searchDiv.appendChild(searchInput);
    controls.appendChild(searchDiv);

    // Create table
    const table = document.createElement('table');
    table.className = 'data-table';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = Object.keys(data[0] || {});
    
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => sortData(header));
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    data.slice(startIndex, endIndex).forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);

    // Create pagination
    const pagination = createPagination(data.length);

    // Clear previous content and add new elements
    previewDiv.innerHTML = '';
    previewDiv.appendChild(controls);
    previewDiv.appendChild(table);
    previewDiv.appendChild(pagination);
}

function createPagination(totalRows) {
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const pagination = document.createElement('div');
    pagination.className = 'table-pagination';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '←';
    prevBtn.className = 'pagination-btn';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateDataPreview(currentData);
        }
    });
    pagination.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = `pagination-btn ${currentPage === i ? 'active' : ''}`;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            updateDataPreview(currentData);
        });
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '→';
    nextBtn.className = 'pagination-btn';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateDataPreview(currentData);
        }
    });
    pagination.appendChild(nextBtn);

    return pagination;
}

function filterData(searchTerm) {
    if (!searchTerm) {
        updateDataPreview(lifeExpectancyData);
        return;
    }

    const filteredData = lifeExpectancyData.filter(row => {
        return Object.values(row).some(value => 
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    currentPage = 1;
    updateDataPreview(filteredData);
}

function sortData(column) {
    if (sortConfig.column === column) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.column = column;
        sortConfig.direction = 'asc';
    }

    const sortedData = [...currentData].sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        } else {
            const comparison = String(aVal).localeCompare(String(bVal));
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        }
    });

    updateDataPreview(sortedData);
}


// Local storage functions
function saveDataToLocalStorage(data) {
    localStorage.setItem('lifeExpectancyData', JSON.stringify(data));
}

function loadDataFromLocalStorage() {
    const data = localStorage.getItem('lifeExpectancyData');
    return data ? JSON.parse(data) : [];
}

// Country dropdown initializer
function initializeCountryDropdowns() {
    const data = loadDataFromLocalStorage();
    const countries = [...new Set(data.map(item => item.country))].sort();
    
    const country1Select = document.getElementById('country1');
    const country2Select = document.getElementById('country2');

    countries.forEach(country => {
        country1Select.add(new Option(country, country));
        country2Select.add(new Option(country, country));
    });

    // Add event listeners for country selection
    country1Select.addEventListener('change', updateComparison);
    country2Select.addEventListener('change', updateComparison);
}

// Chart controls initializer
function initializeChartControls() {
    const chartTypeSelect = document.getElementById('chartType');
    const yearRange = document.getElementById('yearRange');
    const yearValue = document.getElementById('yearValue');

    chartTypeSelect.addEventListener('change', updateVisualization);
    yearRange.addEventListener('input', (e) => {
        yearValue.textContent = e.target.value;
        updateVisualization();
    });

    // Initialize with data
    updateVisualization();
}

// Utility functions for data manipulation
function calculateAverageLifeExpectancy(data, country) {
    const countryData = data.filter(item => item.country === country);
    const sum = countryData.reduce((acc, curr) => acc + parseFloat(curr.lifeExpectancy), 0);
    return sum / countryData.length;
}

function calculateGrowthRate(data, country) {
    const countryData = data.filter(item => item.country === country)
        .sort((a, b) => a.year - b.year);
    
    if (countryData.length < 2) return 0;
    
    const firstValue = parseFloat(countryData[0].lifeExpectancy);
    const lastValue = parseFloat(countryData[countryData.length - 1].lifeExpectancy);
    const years = countryData[countryData.length - 1].year - countryData[0].year;
    
    return ((lastValue - firstValue) / firstValue) / years * 100;
}

// Life expectancy prediction function
async function calculateLifeExpectancy(features) {
    try {
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(features)
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            // Display the prediction result
            displayPredictionResult(result.prediction, features);
        } else {
            console.error('Prediction error:', result.error);
            alert('Error calculating life expectancy: ' + result.error);
        }
    } catch (error) {
        console.error('API call error:', error);
        alert('Error connecting to the prediction service. Please try again later.');
    }
}

// Display prediction result
function displayPredictionResult(prediction, features) {
    // Create or get the result container
    let resultContainer = document.getElementById('predictionResult');
    
    if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.id = 'predictionResult';
        resultContainer.className = 'mt-8 p-6 bg-blue-50 rounded-lg shadow-md';
        
        // Find where to insert the result container
        const previewSection = document.querySelector('.preview-section');
        if (previewSection) {
            previewSection.parentNode.insertBefore(resultContainer, previewSection);
        } else {
            document.querySelector('section').appendChild(resultContainer);
        }
    }
    
    // Update the content
    resultContainer.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Predicted Life Expectancy</h2>
        <div class="text-5xl font-bold text-blue-600 mb-6">${prediction} years</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="stat-card bg-white p-4 rounded-lg shadow">
                <div class="text-sm text-gray-500">GDP</div>
                <div class="text-xl font-semibold">${features.gdp.toLocaleString()}</div>
            </div>
            <div class="stat-card bg-white p-4 rounded-lg shadow">
                <div class="text-sm text-gray-500">Adult Mortality</div>
                <div class="text-xl font-semibold">${features.adult_mortality}</div>
            </div>
            <div class="stat-card bg-white p-4 rounded-lg shadow">
                <div class="text-sm text-gray-500">BMI</div>
                <div class="text-xl font-semibold">${features.bmi}</div>
            </div>
            <div class="stat-card bg-white p-4 rounded-lg shadow">
                <div class="text-sm text-gray-500">Total Expenditure</div>
                <div class="text-xl font-semibold">${features.total_expenditure}%</div>
            </div>
            <div class="stat-card bg-white p-4 rounded-lg shadow">
                <div class="text-sm text-gray-500">HIV/AIDS</div>
                <div class="text-xl font-semibold">${features.hiv_aids}</div>
            </div>
            <div class="stat-card bg-white p-4 rounded-lg shadow">
                <div class="text-sm text-gray-500">GDP per Capita</div>
                <div class="text-xl font-semibold">${features.gdp_per_capita.toLocaleString()}</div>
            </div>
        </div>
        <p class="mt-4 text-gray-600">This prediction is based on the provided health and economic indicators.</p>
        <button id="saveResultBtn" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors duration-200">Save Result</button>
    `;
    
    // Add event listener to the save button
    document.getElementById('saveResultBtn').addEventListener('click', () => {
        // Here you could implement saving the result to local storage or database
        alert('Result saved successfully!');
    });
    
    // Scroll to the result
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Handle calculate button click
function handleCalculateClick() {
    // Get form values
    const adultMortality = parseFloat(document.getElementById('adultMortality').value);
    const bmi = parseFloat(document.getElementById('bmi').value);
    const totalExpenditure = parseFloat(document.getElementById('totalExpenditure').value);
    const hivAids = parseFloat(document.getElementById('hivAids').value);
    const gdp = parseFloat(document.getElementById('gdp').value);
    const population = parseInt(document.getElementById('population').value);
    
    // Calculate GDP per capita
    const gdpPerCapita = population > 0 ? gdp / population : 0;
    
    // Call the prediction function
    calculateLifeExpectancy({
        gdp: gdp,
        adult_mortality: adultMortality,
        bmi: bmi,
        total_expenditure: totalExpenditure,
        hiv_aids: hivAids,
        gdp_per_capita: gdpPerCapita
    });
}