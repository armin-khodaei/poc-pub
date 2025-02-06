import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { FreelanceForm } from "./components/forms/FreelanceForm";
import { EmployeeForm } from "./components/forms/EmployeeForm";
import { ContractorForm } from "./components/forms/ContractorForm";
import { RentalForm } from "./components/forms/RentalForm";
import { PartnershipForm } from "./components/forms/PartnershipForm";
import { SigningPage } from "./components/SigningPage";
import { SignatureRequestsPage } from "./components/SignatureRequestsPage";
import { Toaster } from "./components/ui/toaster";
import { Header } from "@/components/Header";

function App() {
  return (
    <Router>
      <div className="font-sans antialiased">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/freelance" element={<FreelanceForm />} />
            <Route path="/employee" element={<EmployeeForm />} />
            <Route path="/contractor" element={<ContractorForm />} />
            <Route path="/rental" element={<RentalForm />} />
            <Route path="/partnership" element={<PartnershipForm />} />
            <Route path="/signing" element={<SigningPage />} />
            <Route path="/requests" element={<SignatureRequestsPage />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
