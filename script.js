// Global data variable
// Define a global variable to store the loaded CSV data
let csvData;

// Define margin and dimensions for the charts
const margin = {
  top: 20,
  right: 20,
  bottom: 50,
  left: 80,
};


//const width = 500 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Function to start the dashboard
function startDashboard() {
  // Helper functions to load CSV files using D3's d3.json and d3.csv
  function loadCSV(file) {
    return d3.csv(file);
  }

  // Function to load CSV data using D3.js
  d3.csv('GamesData.csv').then(function(data) {
  // Data loading is asynchronous, so handle the data inside this callback function
    csvData = data;
    console.log('CSV data loaded:', csvData);
  // Call any functions or perform operations with the data here
  }).catch(function(error) {
    console.error('Error:', error);
  });

    // Call functions to create the plots
    createParallelCoordinates(); //Define width inside this function
    createDensityPlot(); //Define width inside this function
};