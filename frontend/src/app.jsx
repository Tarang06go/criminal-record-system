import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/DashboardPage";
import Officers from "./pages/OfficersPage";
import Criminals from "./pages/CriminalsPage";
import Cases from "./pages/CasesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/officers" element={<Officers />} />
        <Route path="/criminals" element={<Criminals />} />
        <Route path="/cases" element={<Cases />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;