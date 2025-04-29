const Record = require('../models/record.model.js');

// Generate time series data for charts
exports.generateTimeSeriesData = async (patientId) => {
  try {
    // Get patient record
    const record = await Record.findOne({ patient: patientId });
    
    if (!record || !record.entries || record.entries.length === 0) {
      return {
        dates: [],
        plaqueCoverage: [],
        gingivalInflammation: [],
        tartar: []
      };
    }
    
    // Sort entries by date
    const sortedEntries = [...record.entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Extract data for charts
    const chartData = {
      dates: sortedEntries.map(entry => entry.date),
      plaqueCoverage: sortedEntries.map(entry => entry.plaqueCoverage),
      gingivalInflammation: sortedEntries.map(entry => entry.gingivalInflammation),
      tartar: sortedEntries.map(entry => entry.tartar)
    };
    
    return chartData;
    
  } catch (error) {
    console.error('Error generating chart data:', error);
    throw error;
  }
};

// Generate summary statistics
exports.generateSummaryStats = async (patientId) => {
  try {
    // Get patient record
    const record = await Record.findOne({ patient: patientId });
    
    if (!record || !record.entries || record.entries.length === 0) {
      return {
        totalUploads: 0,
        averagePlaqueCoverage: 0,
        averageGingivalInflammation: 0,
        averageTartar: 0,
        trendPlaqueCoverage: 'neutral',
        trendGingivalInflammation: 'neutral',
        trendTartar: 'neutral'
      };
    }
    
    // Sort entries by date
    const sortedEntries = [...record.entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate averages
    const totalUploads = sortedEntries.length;
    const averagePlaqueCoverage = sortedEntries.reduce((sum, entry) => sum + entry.plaqueCoverage, 0) / totalUploads;
    const averageGingivalInflammation = sortedEntries.reduce((sum, entry) => sum + entry.gingivalInflammation, 0) / totalUploads;
    const averageTartar = sortedEntries.reduce((sum, entry) => sum + entry.tartar, 0) / totalUploads;
    
    // Calculate trends (if we have at least 2 entries)
    let trendPlaqueCoverage = 'neutral';
    let trendGingivalInflammation = 'neutral';
    let trendTartar = 'neutral';
    
    if (totalUploads >= 2) {
      // Compare latest two entries
      const latestEntry = sortedEntries[totalUploads - 1];
      const previousEntry = sortedEntries[totalUploads - 2];
      
      // Plaque coverage trend
      if (latestEntry.plaqueCoverage < previousEntry.plaqueCoverage) {
        trendPlaqueCoverage = 'improving';
      } else if (latestEntry.plaqueCoverage > previousEntry.plaqueCoverage) {
        trendPlaqueCoverage = 'worsening';
      }
      
      // Gingival inflammation trend
      if (latestEntry.gingivalInflammation < previousEntry.gingivalInflammation) {
        trendGingivalInflammation = 'improving';
      } else if (latestEntry.gingivalInflammation > previousEntry.gingivalInflammation) {
        trendGingivalInflammation = 'worsening';
      }
      
      // Tartar trend
      if (latestEntry.tartar < previousEntry.tartar) {
        trendTartar = 'improving';
      } else if (latestEntry.tartar > previousEntry.tartar) {
        trendTartar = 'worsening';
      }
    }
    
    return {
      totalUploads,
      averagePlaqueCoverage,
      averageGingivalInflammation,
      averageTartar,
      trendPlaqueCoverage,
      trendGingivalInflammation,
      trendTartar
    };
    
  } catch (error) {
    console.error('Error generating summary stats:', error);
    throw error;
  }
};