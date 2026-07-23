import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { HomePage } from '../pages/Home/HomePage';
import { LoginPage } from '../pages/Login/LoginPage';
import { RegisterPage } from '../pages/Register/RegisterPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { ReportLostPage } from '../pages/ReportLost/ReportLostPage';
import { ReportFoundPage } from '../pages/ReportFound/ReportFoundPage';
import { ItemDetailsPage } from '../pages/ItemDetails/ItemDetailsPage';
import { SearchPage } from '../pages/Search/SearchPage';
import { ProfilePage } from '../pages/Profile/ProfilePage';
import { AdminPage } from '../pages/Admin/AdminPage';

export const AppRoutes: React.FC = () => {
  const { activeRoute } = useNavigation();

  switch (activeRoute) {
    case 'login':
      return <LoginPage />;
    case 'register':
      return <RegisterPage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'report-lost':
      return <ReportLostPage />;
    case 'report-found':
      return <ReportFoundPage />;
    case 'item-details':
      return <ItemDetailsPage />;
    case 'search':
      return <SearchPage />;
    case 'profile':
      return <ProfilePage />;
    case 'admin':
      return <AdminPage />;
    case 'home':
    default:
      return <HomePage />;
  }
};
