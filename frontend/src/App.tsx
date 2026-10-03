import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout, loadAppData } from './layouts/AppLayout';

import { Login } from './pages/Login/Login';
import { CreateAccount } from './pages/Login/CreateAccount';
import { ResetPassword } from './pages/Login/ResetPassword';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Research } from './pages/Research/Research';
import { FinalPlan } from './pages/FinalPlan/FinalPlan';
import { Papers } from './pages/Papers/Papers';
import { Comparison } from './pages/Comparison/Comparison';
import { ResearchGap } from './pages/ResearchGap/ResearchGap';
import { Methodology } from './pages/Methodology/Methodology';
import { Citations } from './pages/Citations/Citations';
import { Reviewer } from './pages/Reviewer/Reviewer';
import { Academic } from './pages/Academic/Academic';
import { Profile } from './pages/Profile/Profile';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/create-account', element: <CreateAccount /> },
  { path: '/reset-password', element: <ResetPassword /> },
  {
    id: 'app',
    path: '/',
    loader: loadAppData,
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'workspace', element: <Research /> },
      { path: 'research', element: <Research /> },
      { path: 'final-plan', element: <FinalPlan /> },
      { path: 'papers', element: <Papers /> },
      { path: 'comparison', element: <Comparison /> },
      { path: 'gaps', element: <ResearchGap /> },
      { path: 'methodology', element: <Methodology /> },
      { path: 'citations', element: <Citations /> },
      { path: 'reviewer', element: <Reviewer /> },
      { path: 'academic', element: <Academic /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
