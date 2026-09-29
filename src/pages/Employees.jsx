import PlaceholderPage from '../components/PlaceholderPage';

export default function Employees() {
  return (
    <PlaceholderPage
      title="Employees"
      subtitle="Track employees and their assigned IT assets"
      columns={['Employee Name', 'Employee ID', 'Department', 'Email', 'Assigned Assets', 'Status', 'Actions']}
    />
  );
}
