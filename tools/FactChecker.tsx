import React, { useState } from 'react';
import type { FactCheckResult } from '../types';

export const FactChecker: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkFact = async () => {
    if (!question.trim()) return;
    
    setIsChecking(true);
    try {
      // This would integrate with your fact-checking API
      const mockResult: FactCheckResult = {
        answer: `Based on current research and available data, here's what we found about "${question}":\n\nThe information suggests that this topic has multiple perspectives and ongoing research. Key findings indicate that while there is evidence supporting certain aspects, the complete picture may be more nuanced than initially apparent.\n\nKey points:\n• Current research shows mixed results\n• Multiple studies have different conclusions\n• Context and methodology matter significantly\n\nFor the most accurate and up-to-date information, it's recommended to consult multiple reliable sources and consider the specific context of your inquiry.`,
        sources: [
          {
            web: {
              uri: 'https://example.com/research-study-1',
              title: 'Comprehensive Research Study on Related Topic'
            }
          },
          {
            web: {
              uri: 'https://example.com/academic-paper',
              title: 'Academic Paper: Latest Findings'
            }
          },
          {
            web: {
              uri: 'https://example.com/expert-analysis',
              title: 'Expert Analysis and Review'
            }
          }
        ]
      };
      setResult(mockResult);
    } catch (error) {
      console.error('Failed to check fact:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Question or Statement to Fact-Check
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter a question or statement you'd like to fact-check..."
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={4}
          />
        </div>

        <button
          onClick={checkFact}
          disabled={!question.trim() || isChecking}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {isChecking ? 'Checking...' : 'Check Facts'}
        </button>

        {result && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Answer</h3>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-line">{result.answer}</p>
              </div>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Sources</h3>
                <div className="space-y-3">
                  {result.sources.map((source, index) => (
                    <div key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                      {source.web && (
                        <div>
                          <h4 className="font-medium text-white mb-1">
                            {source.web.title || 'Source'}
                          </h4>
                          {source.web.uri && (
                            <a
                              href={source.web.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm break-all"
                            >
                              {source.web.uri}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-yellow-300 font-medium">Disclaimer</h4>
                  <p className="text-yellow-200 text-sm mt-1">
                    This information is provided for research purposes. Always verify facts from multiple reliable sources before making important decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
