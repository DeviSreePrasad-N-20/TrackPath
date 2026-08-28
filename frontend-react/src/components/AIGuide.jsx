import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, MessageSquare } from 'lucide-react';
import api from '../api';

export default function AIGuide({ auth }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const fetchGuide = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/api/ai/guide', {
        path: location.pathname,
        role: auth?.role
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("I'm having trouble connecting right now.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchGuide();
    }
  }, [location.pathname, isOpen]); // Re-fetch if they navigate while open, or dashboard data changes

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl mb-4 w-80 overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2 font-medium">
              <Bot size={18} /> TrackPath AI Guide
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <X size={16} />
            </button>
          </div>
          <div className="p-4 bg-gray-50 min-h-32 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
              </div>
            ) : (
              message
            )}
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-105 flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
