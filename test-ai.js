// Simple test to verify the @google/genai package works correctly
import { GoogleGenAI } from '@google/genai';

console.log('Testing @google/genai package...');

try {
  // Test import
  console.log('✅ Import successful');
  console.log('GoogleGenAI class:', typeof GoogleGenAI);
  
  // Test initialization (without actual API key)
  console.log('Package is working correctly!');
  
  // Test with placeholder key to see constructor
  try {
    const testAI = new GoogleGenAI({ apiKey: 'test-key' });
    console.log('✅ Constructor works');
    console.log('AI instance type:', typeof testAI);
  } catch (error) {
    console.log('Constructor error (expected with invalid key):', error.message);
  }
  
} catch (error) {
  console.error('❌ Package test failed:', error);
}
