'use client';

import { useState } from 'react';
import { createTournament } from '@/services/apiCalls';
import { Toaster, toast } from 'react-hot-toast';


export default function TournamentForm() {
  const [formData, setFormData] = useState({
    title: '',
    match1_nickname1: '',
    match1_nickname2: '',
    match2_nickname1: '',
    match2_nickname2: '',
    match3_nickname1: '',
    match3_nickname2: '',
    match4_nickname1: '',
    match4_nickname2: ''
  });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await createTournament(JSON.stringify(formData));
      if (response.status === 201) {
        // alert('Tournament created successfully!');
        toast.success('Tournament created successfully');
        // Reset form
        setFormData({
          title: '',
          match1_nickname1: '',
          match1_nickname2: '',
          match2_nickname1: '',
          match2_nickname2: '',
          match3_nickname1: '',
          match3_nickname2: '',
          match4_nickname1: '',
          match4_nickname2: ''
        });
      } else {
        // alert('Failed to create tournament');
        toast.error('Failed to create tournament');
      }
    } catch (error) {
      // console.error('Error:', error);
      // alert('Error creating tournament');
      toast.error('Error creating tournament');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 mt-8">
      <form onSubmit={handleSubmit} className="bg-white/10 shadow-md rounded-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Create Local Tournament
        </h2>
        
        <div className="space-y-4">
          {Object.entries(formData).map(([key], index) => (
                  <input
                    key={index}
                    type="text"
                    id={key}
                    name={key}
                    value={formData[key]}
                    placeholder={key==='title'? key: `Nickname ${index}`}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
          ))}

          <button
            type="submit"
            className="w-full bg-white text-black py-2 px-4 rounded-md hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Create Tournament
          </button>
        </div>
      </form>
      <Toaster />
    </div>
  );
}