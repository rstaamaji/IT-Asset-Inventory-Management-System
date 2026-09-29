import PlaceholderPage from '../components/PlaceholderPage';

export default function Maintenance() {
  return (
    <PlaceholderPage
      title="Maintenance"
      subtitle="Schedule and track maintenance, repair, and service records for IT assets"
      columns={['Asset', 'Issue', 'Priority', 'Technician', 'Opened', 'Status', 'Resolved', 'Actions']}
    />
  );
}
