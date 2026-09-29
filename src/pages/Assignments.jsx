import PlaceholderPage from '../components/PlaceholderPage';

export default function Assignments() {
  return (
    <PlaceholderPage
      title="Assignments"
      subtitle="Track asset-to-employee assignment history and current allocations"
      columns={['Asset', 'Employee', 'Assigned Date', 'Expected Return', 'Status', 'Assigned By', 'Actions']}
    />
  );
}
