import PlaceholderPage from '../components/PlaceholderPage';

export default function Assets() {
  return (
    <PlaceholderPage
      title="Assets"
      subtitle="Manage all IT hardware and equipment across your organization"
      columns={['Asset Name', 'Asset ID', 'Category', 'Status', 'Assignee', 'Location', 'Purchase Date', 'Actions']}
    />
  );
}
