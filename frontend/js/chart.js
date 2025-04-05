// Chart.js visualization functions

// Update visualization based on selected chart type and year range
function updateVisualization() {
    const data = loadDataFromLocalStorage();
    const chartType = document.getElementById('chartType').value;
    const yearRange = document.getElementById('yearRange').value;
    
    // Filter data by year
    const filteredData = data.filter(item => parseInt(item.year) <= yearRange);
    
    // Update statistics
    updateStatistics(filteredData);
    
    // Create or update chart
    createChart(filteredData, chartType);
}

// Create or update the main chart
function createChart(data, chartType) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    // Add country selector if it doesn't exist
    let countrySelector = document.getElementById('countrySelector');
    if (!countrySelector) {
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        controlGroup.innerHTML = `
            <label for="countrySelector">Select Countries:</label>
            <select id="countrySelector" multiple class="enhanced-select">
                <option value="all" selected>All Countries</option>
                ${[...new Set(data.map(item => item.country))]
                    .map(country => `<option value="${country}">${country}</option>`)
                    .join('')}
            </select>
        `;
        document.querySelector('.visualization-controls').appendChild(controlGroup);
        
        // Add event listener to country selector
        document.getElementById('countrySelector').addEventListener('change', updateVisualization);
    }

    // Get selected countries
    const selectedCountries = Array.from(document.getElementById('countrySelector').selectedOptions)
        .map(option => option.value);
    const showAllCountries = selectedCountries.includes('all');

    // Group data by country
    const countries = showAllCountries ? 
        [...new Set(data.map(item => item.country))] :
        selectedCountries;

    const datasets = countries.map(country => ({
        label: country,
        data: data.filter(item => item.country === country)
            .map(item => ({
                x: parseInt(item.year),
                y: parseFloat(item.lifeExpectancy)
            })),
        fill: true,
        tension: 0.4,
        borderColor: getRandomColor(),
        backgroundColor: getRandomColor(0.1),
        pointBackgroundColor: getRandomColor(),
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
        pointHoverBorderWidth: 2,
        pointRadius: 4
    }));

    // Enhanced animations and transitions
    Chart.defaults.animation.duration = 1000;
    Chart.defaults.animation.easing = 'easeInOutQuart';

    new Chart(ctx, {
        type: chartType,
        data: {
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Year',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 10
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        borderDash: [5, 5]
                    },
                    ticks: {
                        callback: value => Math.round(value)
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Life Expectancy (years)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 10
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        borderDash: [5, 5]
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Life Expectancy Trends',
                    font: {
                        size: 20,
                        weight: 'bold',
                        family: '"Helvetica Neue", Arial, sans-serif'
                    },
                    padding: {
                        top: 20,
                        bottom: 20
                    },
                    color: '#2c3e50'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            family: '"Helvetica Neue", Arial, sans-serif'
                        },
                        generateLabels: (chart) => {
                            const datasets = chart.data.datasets;
                            return datasets.map(dataset => ({
                                text: dataset.label,
                                fillStyle: dataset.backgroundColor,
                                strokeStyle: dataset.borderColor,
                                lineWidth: 2,
                                hidden: !dataset.visible,
                                index: datasets.indexOf(dataset)
                            }));
                        }
                    },
                    onClick: (evt, legendItem, legend) => {
                        const index = legendItem.index;
                        const chart = legend.chart;
                        chart.data.datasets[index].visible = !chart.data.datasets[index].visible;
                        chart.update();
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14,
                        weight: 'bold',
                        family: '"Helvetica Neue", Arial, sans-serif'
                    },
                    bodyFont: {
                        size: 13,
                        family: '"Helvetica Neue", Arial, sans-serif'
                    },
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} years`;
                        },
                        title: function(context) {
                            return `Year: ${Math.round(context[0].parsed.x)}`;
                        }
                    }
                }
            },
            transitions: {
                show: {
                    animations: {
                        x: {
                            from: 0
                        },
                        y: {
                            from: 0
                        }
                    }
                },
                hide: {
                    animations: {
                        x: {
                            to: 0
                        },
                        y: {
                            to: 0
                        }
                    }
                }
            }
        }
    });
}

// Enhanced color generator with better contrast
function getRandomColor(alpha = 1) {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.random() * 10;
    const lightness = 45 + Math.random() * 10;
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

// Update statistics panel
// Update statistics with animated counters
function updateStatistics(data) {
    const globalAvg = data.reduce((sum, item) => sum + parseFloat(item.lifeExpectancy), 0) / data.length;
    const maxValue = Math.max(...data.map(item => parseFloat(item.lifeExpectancy)));
    const minValue = Math.min(...data.map(item => parseFloat(item.lifeExpectancy)));
    const dataRange = maxValue - minValue;

    // Animate statistics
    animateValue('globalAvg', globalAvg.toFixed(1));
    animateValue('maxValue', maxValue.toFixed(1));
    animateValue('minValue', minValue.toFixed(1));
    animateValue('dataRange', dataRange.toFixed(1));

    // Add trend indicators
    addTrendIndicator('globalAvg', globalAvg);
    addTrendIndicator('maxValue', maxValue);
    addTrendIndicator('minValue', minValue);
    addTrendIndicator('dataRange', dataRange);
}

// Animate counter from current to target value
function animateValue(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const start = parseFloat(element.textContent) || 0;
    const target = parseFloat(targetValue);
    const duration = 1500;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use easeOutQuart easing function for smooth animation
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const current = start + (target - start) * easeProgress;

        element.textContent = current.toFixed(1);

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    requestAnimationFrame(updateCounter);
}

// Add trend indicators with icons and colors
function addTrendIndicator(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const container = element.parentElement;
    const oldIndicator = container.querySelector('.trend-indicator');
    if (oldIndicator) {
        oldIndicator.remove();
    }

    const indicator = document.createElement('span');
    indicator.className = 'trend-indicator';

    // Compare with previous value (stored in data attribute)
    const previousValue = parseFloat(element.dataset.previousValue) || value;
    element.dataset.previousValue = value;

    if (value > previousValue) {
        indicator.innerHTML = '↑';
        indicator.style.color = '#4caf50';
    } else if (value < previousValue) {
        indicator.innerHTML = '↓';
        indicator.style.color = '#f44336';
    } else {
        indicator.innerHTML = '→';
        indicator.style.color = '#9e9e9e';
    }

    container.appendChild(indicator);
}

// Initialize chart controls with enhanced UI
function initializeChartControls() {
    const chartTypeSelect = document.getElementById('chartType');
    const yearRange = document.getElementById('yearRange');
    const yearValue = document.getElementById('yearValue');

    if (chartTypeSelect) {
        // Add icons to chart type options
        const options = {
            line: '📈 Line Chart',
            bar: '📊 Bar Chart',
            scatter: '📍 Scatter Plot'
        };

        chartTypeSelect.innerHTML = Object.entries(options)
            .map(([value, label]) => `<option value="${value}">${label}</option>`)
            .join('');

        chartTypeSelect.addEventListener('change', updateVisualization);
    }

    if (yearRange && yearValue) {
        // Initialize year range with data bounds
        const data = loadDataFromLocalStorage();
        const years = data.map(item => parseInt(item.year));
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);

        yearRange.min = minYear;
        yearRange.max = maxYear;
        yearRange.value = maxYear;
        yearValue.textContent = maxYear;

        yearRange.addEventListener('input', (e) => {
            yearValue.textContent = e.target.value;
            updateVisualization();
        });
    }

    // Initial visualization update
    updateVisualization();
}

// Update comparison visualization
function updateComparison() {
    const country1 = document.getElementById('country1').value;
    const country2 = document.getElementById('country2').value;
    const startYear = parseInt(document.getElementById('startYear').value);
    const endYear = parseInt(document.getElementById('endYear').value);

    if (!country1 || !country2) return;

    const data = loadDataFromLocalStorage();
    const country1Data = data.filter(item => 
        item.country === country1 && 
        item.year >= startYear && 
        item.year <= endYear
    ).sort((a, b) => a.year - b.year);

    const country2Data = data.filter(item => 
        item.country === country2 && 
        item.year >= startYear && 
        item.year <= endYear
    ).sort((a, b) => a.year - b.year);

    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    if (window.comparisonChart) {
        window.comparisonChart.destroy();
    }

    window.comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: country1Data.map(item => item.year),
            datasets: [
                {
                    label: country1,
                    data: country1Data.map(item => item.lifeExpectancy),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: country2,
                    data: country2Data.map(item => item.lifeExpectancy),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 14
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} years`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });

    updateComparisonStats(country1Data, country2Data);
}

function updateComparisonStats(country1Data, country2Data) {
    const avgDiff = document.getElementById('avgDiff');
    const growthRate = document.getElementById('growthRate');
    const currentGap = document.getElementById('currentGap');
    const insightsList = document.getElementById('insightsList');

    // Calculate statistics with animations
    const avg1 = country1Data.reduce((sum, item) => sum + item.lifeExpectancy, 0) / country1Data.length;
    const avg2 = country2Data.reduce((sum, item) => sum + item.lifeExpectancy, 0) / country2Data.length;
    const difference = Math.abs(avg1 - avg2);

    animateValue(avgDiff, difference.toFixed(1));

    const growth1 = calculateGrowthRate(country1Data);
    const growth2 = calculateGrowthRate(country2Data);
    growthRate.innerHTML = `
        <span class="${growth1 > growth2 ? 'positive' : 'negative'}">${country1Data[0].country}: ${growth1.toFixed(2)}%</span><br>
        <span class="${growth2 > growth1 ? 'positive' : 'negative'}">${country2Data[0].country}: ${growth2.toFixed(2)}%</span>
    `;

    const lastGap = Math.abs(
        country1Data[country1Data.length - 1].lifeExpectancy - 
        country2Data[country2Data.length - 1].lifeExpectancy
    );
    animateValue(currentGap, lastGap.toFixed(1));

    // Generate insights
    generateInsights(country1Data, country2Data, insightsList);
}

function animateValue(element, value) {
    const start = parseFloat(element.textContent) || 0;
    const end = parseFloat(value);
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const current = start + (end - start) * easeOutQuart(progress);
        element.textContent = current.toFixed(1);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

function calculateGrowthRate(data) {
    if (data.length < 2) return 0;
    const firstValue = data[0].lifeExpectancy;
    const lastValue = data[data.length - 1].lifeExpectancy;
    const years = data[data.length - 1].year - data[0].year;
    return ((lastValue - firstValue) / firstValue) * 100 / years;
}

function generateInsights(country1Data, country2Data, container) {
    container.innerHTML = '';
    const insights = [];

    // Compare recent trends
    const recent1 = country1Data.slice(-5);
    const recent2 = country2Data.slice(-5);
    const trend1 = calculateTrend(recent1);
    const trend2 = calculateTrend(recent2);

    insights.push({
        text: `${country1Data[0].country} shows a ${trend1 > 0 ? 'positive' : 'negative'} trend in recent years`,
        icon: trend1 > 0 ? '📈' : '📉'
    });

    insights.push({
        text: `${country2Data[0].country} shows a ${trend2 > 0 ? 'positive' : 'negative'} trend in recent years`,
        icon: trend2 > 0 ? '📈' : '📉'
    });

    // Render insights with animation
    insights.forEach((insight, index) => {
        const div = document.createElement('div');
        div.className = 'insight-item';
        div.style.opacity = '0';
        div.style.transform = 'translateY(20px)';
        div.innerHTML = `<span class="insight-icon">${insight.icon}</span>${insight.text}`;

        container.appendChild(div);

        setTimeout(() => {
            div.style.transition = 'all 0.5s ease-out';
            div.style.opacity = '1';
            div.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

function calculateTrend(data) {
    if (data.length < 2) return 0;
    return data[data.length - 1].lifeExpectancy - data[0].lifeExpectancy;
}

// Utility function to get latest value for a country
function getLatestValue(data, country) {
    const countryData = data.filter(item => item.country === country)
        .sort((a, b) => b.year - a.year);
    return countryData.length > 0 ? parseFloat(countryData[0].lifeExpectancy) : 0;
}