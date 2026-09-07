import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';

import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Research } from './pages/Research/Research';
import { Papers } from './pages/Papers/Papers';
import { Comparison } from './pages/Comparison/Comparison';
import { ResearchGap } from './pages/ResearchGap/ResearchGap';
import { Methodology } from './pages/Methodology/Methodology';
import { Citations } from './pages/Citations/Citations';
import { Reviewer } from './pages/Reviewer/Reviewer';
import { Academic } from './pages/Academic/Academic';
import { Profile } from './pages/Profile/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="research" element={<Research />} />
          <Route path="papers" element={<Papers />} />
          <Route path="comparison" element={<Comparison />} />
          <Route path="gaps" element={<ResearchGap />} />
          <Route path="methodology" element={<Methodology />} />
          <Route path="citations" element={<Citations />} />
          <Route path="reviewer" element={<Reviewer />} />
          <Route path="academic" element={<Academic />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
