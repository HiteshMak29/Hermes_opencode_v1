
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { CollegeBrandingProvider } from './brandingConfig';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Academics from './views/Academics';
import Admissions from './views/Admissions';
import Advising from './views/Advising';
import Finances from './views/Finances';
import Housing from './views/Housing';
import Medical from './views/Medical';
import Library from './views/Library';
import Meals from './views/Meals';
import AccessCard from './views/AccessCard';
import StudentRetention from './views/StudentRetention';
import PredictiveDetection from './views/PredictiveDetection';
import ModuleAnalytics from './views/ModuleAnalytics';
import StudentAssistant from './views/StudentAssistant';
import SystemStatus from './views/SystemStatus';
import IncidentManagement from './views/IncidentManagement';
import SupportTicketing from './views/SupportTicketing';
import ConnectivityTest from './views/ConnectivityTest';
import CareerInternship from './views/CareerInternship';
import DegreeProgress from './views/DegreeProgress';
import WellnessHub from './views/WellnessHub';
import CampusMap from './views/CampusMap';
import UserDirectory from './views/UserDirectory';

const App: React.FC = () => {
  return (
    <CollegeBrandingProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/advising" element={<Advising />} />
            <Route path="/housing" element={<Housing />} />
            <Route path="/medical" element={<Medical />} />
            <Route path="/library" element={<Library />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/access" element={<AccessCard />} />
            <Route path="/retention" element={<StudentRetention />} />
            <Route path="/predictive-risk" element={<PredictiveDetection />} />
            <Route path="/analytics" element={<ModuleAnalytics />} />
            <Route path="/assistant" element={<StudentAssistant />} />
            <Route path="/status" element={<SystemStatus />} />
            <Route path="/incidents" element={<IncidentManagement />} />
            <Route path="/support" element={<SupportTicketing />} />
            <Route path="/connectivity" element={<ConnectivityTest />} />
            <Route path="/careers" element={<CareerInternship />} />
            <Route path="/degree-tracker" element={<DegreeProgress />} />
            <Route path="/wellness" element={<WellnessHub />} />
            <Route path="/map" element={<CampusMap />} />
            <Route path="/user-directory" element={<UserDirectory />} />
            {/* Fallback */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
      </HashRouter>
    </CollegeBrandingProvider>
  );
};

export default App;
