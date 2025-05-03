// backend/services/aiService.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure the OpenRouter API
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Base64 encode image for the API
const encodeImageToBase64 = async (imagePath) => {
  try {
    const imageBuffer = await fs.promises.readFile(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('Error encoding image:', error);
    throw error;
  }
};

/**
 * Get AI-generated dental recommendations based on a dental image
 * Uses OpenRouter.ai with their free tier for development
 * @param {Buffer} imageBuffer - The frontal dental image buffer
 * @returns {Promise<string>} The AI-generated recommendations
 */
exports.getDentalRecommendations = async (imageBuffer) => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured');
    }

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Prepare prompt for the AI
    const prompt = `You are a professional dentist analyzing a dental image. 
    Based solely on the image provided, give concise and practical recommendations for oral care. 
    Focus on practical advice like brushing techniques, spots that need attention, and general oral hygiene tips. 
    Keep your response under 150 words and make it patient-friendly.`;

    // Make request to OpenRouter API
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: 'anthropic/claude-3-haiku', // Using the free tier model
        messages: [
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Please analyze this dental image and provide recommendations:' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.APP_URL || 'https://dentalcare.app', // Domain to identify your application
          'X-Title': 'Dental Care App' // Application name
        }
      }
    );

    // Extract the AI's recommendation
    if (response.data && 
        response.data.choices && 
        response.data.choices.length > 0 && 
        response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response from OpenRouter API');
    }
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    // Return a fallback response in case of error
    return "Unable to generate AI recommendations at this time. Please consult with your dentist for personalized oral care advice.";
  }
};

// Cache recommendations to avoid unnecessary API calls
const recommendationsCache = new Map();

/**
 * Get cached recommendations or generate new ones
 * @param {string} imageId - The image ID to use as cache key
 * @param {Buffer} imageBuffer - The image buffer
 * @returns {Promise<string>} The AI-generated recommendations
 */
exports.getCachedOrNewRecommendations = async (imageId, imageBuffer) => {
  // Check if we have cached recommendations for this image
  if (recommendationsCache.has(imageId)) {
    return recommendationsCache.get(imageId);
  }

  // Generate new recommendations
  const recommendations = await this.getDentalRecommendations(imageBuffer);
  
  // Cache the result (with a limit on cache size)
  if (recommendationsCache.size > 100) {
    // Delete oldest entry if cache is too big
    const oldestKey = recommendationsCache.keys().next().value;
    recommendationsCache.delete(oldestKey);
  }
  
  recommendationsCache.set(imageId, recommendations);
  return recommendations;
};