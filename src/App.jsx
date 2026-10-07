import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './layouts/AppLayout';
import Dashboard   from './pages/Dashboard';
import Assets      from './pages/Assets';
import Categories  from './pages/Categories';
import Employees   from './pages/Employees';
import Assignments from './pages/Assignments';
import Maintenance from './pages/Maintenance';
import Reports     from './pages/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index           element={<Dashboard />}   />
          <Route path="assets"      element={<Assets />}      />
          <Route path="categories"  element={<Categories />}  />
          <Route path="employees"   element={<Employees />}   />
          <Route path="assignments" element={<Assignments />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="reports"     element={<Reports />}     />
          {/* Catch-all: redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  </BrowserRouter>
);
}
