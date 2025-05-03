// src/components/common/AIRecommendations.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from './LoadingSpinner';
import '../../styles/components/AIRecommendations.css';

const AIRecommendations = ({ uploadId }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!uploadId) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/api/ai/${uploadId}/recommendations`);
        setRecommendations(response.data.recommendations);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching AI recommendations:', err);
        setError('Unable to load AI recommendations at this time.');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [uploadId]);

  if (loading) {
    return (
      <div className="ai-recommendations-container loading">
        <h4 className="ai-recommendations-title">
          <i className="fas fa-robot"></i> AI Oral Care Assistant
        </h4>
        <div className="ai-recommendations-loading">
          <LoadingSpinner />
          <p>Analyzing oral health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-recommendations-container error">
        <h4 className="ai-recommendations-title">
          <i className="fas fa-robot"></i> AI Oral Care Assistant
        </h4>
        <div className="ai-recommendations-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="ai-recommendations-container">
      <h4 className="ai-recommendations-title">
        <i className="fas fa-robot"></i> AI Oral Care Recommendations
      </h4>
      <div className="ai-recommendations-content">
        <p>{recommendations}</p>
        <div className="ai-recommendations-footer">
          <small>This is an AI-generated recommendation and should not replace professional healthcare advice.</small>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;