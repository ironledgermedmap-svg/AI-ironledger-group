import React, { useState } from 'react';

export const PostGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [tone, setTone] = useState('professional');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePost = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
      // This would integrate with your AI service
      setGeneratedPost(`Here's a ${tone} ${platform} post about "${topic}":\n\n🚀 Exciting developments in ${topic}! As professionals in this space, we understand the importance of staying ahead of the curve.\n\n✨ Key insights:\n• Innovation drives growth\n• Collaboration breeds success\n• Knowledge sharing creates value\n\nWhat's your take on the latest trends in ${topic}? Let's discuss in the comments! 👇\n\n#${topic.replace(/\s+/g, '')} #Innovation #Growth`);
    } catch (error) {
      console.error('Failed to generate post:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Topic or Theme
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the topic you want to write about..."
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="blog">Blog Post</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="excited">Excited</option>
              <option value="informative">Informative</option>
            </select>
          </div>

          <button
            onClick={generatePost}
            disabled={!topic.trim() || isGenerating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isGenerating ? 'Generating...' : 'Generate Post'}
          </button>
        </div>

        <div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Generated Post
            </label>
            <textarea
              value={generatedPost}
              onChange={(e) => setGeneratedPost(e.target.value)}
              placeholder="Your generated post will appear here..."
              className="w-full h-80 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {generatedPost && (
            <button
              onClick={() => navigator.clipboard.writeText(generatedPost)}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Copy to Clipboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
