'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createTournament } from '@/services/apiCalls';
import { Toaster, toast } from 'react-hot-toast';
import TopBar from'@/components/local_tournament/TopBar';

import { fetchTournamentDetail, fetchTournamentUpdate } from '@/services/apiCalls';




export default function TournamentForm({params}) {

  const router = useRouter();
  const tid = useRef(-1);

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

  useEffect(() => {
    const fetchTournaments = async () => {
      const identical = await params;
      tid.current = identical.id;
      try {
        let response = await fetchTournamentDetail(identical.id ?? -1);
        if (!response.id) {
          router.push('/404');
          return;
        }
        setFormData({
          title: response.title,
          match1_nickname1: response.match1_nickname1,
          match1_nickname2: response.match1_nickname2,
          match2_nickname1: response.match2_nickname1,
          match2_nickname2: response.match2_nickname2,
          match3_nickname1: response.match3_nickname1,
          match3_nickname2: response.match3_nickname2,
          match4_nickname1: response.match4_nickname1,
          match4_nickname2: response.match4_nickname2,
        });
      } catch (error) {
        console.log('Error:', error);
      }
    };
    fetchTournaments();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetchTournamentUpdate(tid.current, formData);
      if (response.status === 200) {
        toast.success('Tournament created successfully');
        router.push(`/tournament/${response.id}`);
      } else {
        toast.error(response.msg ??  'Failed to update tournament');
      }
    } catch (error) {
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
    <>
    <TopBar activeIndex={2} />
    <div className="max-w-screen-sm mx-auto p-4 mt-8">
      <form onSubmit={handleSubmit} className="bg-white/10 shadow-md rounded-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Update Local Tournament
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
                    autoComplete="off"
                    maxLength={18}
                    // className="w-full px-3 py-2 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    className='custom-input w-full'
                  />
          ))}

          <button
            type="submit"
            // className="w-full bg-white text-black py-2 px-4 rounded-md hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            className='custom-button'
          >
            Update Tournament
          </button>
        </div>
      </form>
      <Toaster />
    </div>
    </>
  );
}