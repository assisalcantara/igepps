import React from 'react';
import Slider from '../components/Slider';
import CursosDestaque from '../components/CursosDestaque';
import Depoimentos from '../components/Depoimentos';
import Rodape from '../components/Rodape';

export default function Home(){
  return (
    <main className="bg-gray-50 min-h-screen">
      <Slider />
      <CursosDestaque />
      <Depoimentos />
      <Rodape />
    </main>
  );
}
