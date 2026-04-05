import { Routes, Route } from 'react-router-dom';
import TransactionsList from '@/components/TransactionsList';
import TransactionDetail from '@/components/TransactionDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TransactionsList />} />
      <Route path="/transaction/:id" element={<TransactionDetail />} />
    </Routes>
  );
}
