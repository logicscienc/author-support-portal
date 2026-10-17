
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthorDashboardPage from "./pages/author/AuthorDashboardPage";
import MyBooksPage from "./pages/author/MyBooksPage";
import SupportTicketsPage from "./pages/author/SupportTicketsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import { authorLinks, adminLinks } from "./utils/navigation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />

        <Route element={<ProtectedRoute role="AUTHOR" />}>
          <Route path="/author" element={<DashboardLayout links={authorLinks} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AuthorDashboardPage />} />
            <Route path="books" element={<MyBooksPage />} />
            <Route path="tickets" element={<SupportTicketsPage />} />
            <Route path="tickets/:id" element={<TicketDetailsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="/admin" element={<DashboardLayout links={adminLinks} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="tickets/:id" element={<TicketDetailsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

